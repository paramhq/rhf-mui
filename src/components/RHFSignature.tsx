import { useState, useEffect, useCallback, useRef } from 'react';
import { useController, useFormContext, FieldValues, FieldPath } from 'react-hook-form';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import FormLabel from '@mui/material/FormLabel';
import FormHelperText from '@mui/material/FormHelperText';
import CircularProgress from '@mui/material/CircularProgress';
import ClearIcon from '@mui/icons-material/Clear';
import type { RHFSignatureProps } from '../types';
import { useFieldRequired } from '../context/SchemaContext';

// Type for signature_pad
interface SignaturePadInstance {
  clear: () => void;
  isEmpty: () => boolean;
  toDataURL: (type?: string, encoderOptions?: number) => string;
  toSVG: () => string;
  fromDataURL: (dataUrl: string) => Promise<void>;
  on: () => void;
  off: () => void;
}

interface SignaturePadOptions {
  backgroundColor?: string;
  penColor?: string;
  minWidth?: number;
  maxWidth?: number;
}

type SignaturePadConstructor = new (
  canvas: HTMLCanvasElement,
  options?: SignaturePadOptions
) => SignaturePadInstance;

/**
 * Signature pad component for capturing handwritten signatures
 *
 * Requires signature_pad:
 * `npm install signature_pad`
 *
 * @example
 * ```tsx
 * <RHFSignature
 *   name="signature"
 *   label="Your Signature"
 *   width={400}
 *   height={200}
 * />
 * ```
 *
 * @example
 * ```tsx
 * // With custom styling
 * <RHFSignature
 *   name="signature"
 *   label="Sign Here"
 *   penColor="#0000ff"
 *   backgroundColor="#f5f5f5"
 *   outputFormat="svg"
 * />
 * ```
 */
export function RHFSignature<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  name,
  control: controlProp,
  rules,
  defaultValue,
  shouldUnregister,
  helperText,
  required: requiredProp,
  disabled,
  fullWidth = true,
  label,
  width = 400,
  height = 200,
  penColor = '#000000',
  backgroundColor = '#ffffff',
  lineWidth = 2,
  outputFormat = 'base64',
  showClearButton = true,
  clearButtonText = 'Clear',
}: RHFSignatureProps<TFieldValues, TName>) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const signaturePadRef = useRef<SignaturePadInstance | null>(null);
  const [SignaturePad, setSignaturePad] = useState<SignaturePadConstructor | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const formContext = useFormContext<TFieldValues>();
  const control = controlProp ?? formContext?.control;

  const schemaRequired = useFieldRequired(name);
  const required = requiredProp ?? schemaRequired;

  const {
    field: { value, onChange, onBlur },
    fieldState: { error },
  } = useController({
    name,
    control,
    rules,
    defaultValue,
    shouldUnregister,
  });

  // Load signature_pad dynamically
  useEffect(() => {
    let mounted = true;

    const loadSignaturePad = async () => {
      try {
        // @ts-expect-error - Optional peer dependency
        const signaturePadModule = await import('signature_pad');
        if (mounted) {
          setSignaturePad(() => signaturePadModule.default as SignaturePadConstructor);
          setIsLoading(false);
        }
      } catch {
        if (mounted) {
          setLoadError(true);
          setIsLoading(false);
        }
      }
    };

    loadSignaturePad();

    return () => {
      mounted = false;
    };
  }, []);

  // Initialize signature pad when library is loaded
  useEffect(() => {
    if (!SignaturePad || !canvasRef.current) return;

    const canvas = canvasRef.current;

    // Set canvas size for high DPI displays
    const ratio = Math.max(window.devicePixelRatio || 1, 1);
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.scale(ratio, ratio);
    }

    // Initialize SignaturePad
    signaturePadRef.current = new SignaturePad(canvas, {
      backgroundColor,
      penColor,
      minWidth: lineWidth * 0.5,
      maxWidth: lineWidth * 1.5,
    });

    // Load existing value
    if (value && typeof value === 'string' && value.startsWith('data:')) {
      signaturePadRef.current.fromDataURL(value);
    }

    // Disable if needed
    if (disabled) {
      signaturePadRef.current.off();
    }

    return () => {
      signaturePadRef.current = null;
    };
  }, [SignaturePad, width, height, backgroundColor, penColor, lineWidth, disabled, value]);

  // Sync disabled state
  useEffect(() => {
    if (!signaturePadRef.current) return;

    if (disabled) {
      signaturePadRef.current.off();
    } else {
      signaturePadRef.current.on();
    }
  }, [disabled]);

  // Handle stroke end - update form value
  const handleStrokeEnd = useCallback(() => {
    if (!signaturePadRef.current) return;

    let newValue: string;

    switch (outputFormat) {
      case 'svg':
        newValue = signaturePadRef.current.toSVG();
        break;
      case 'blob':
        // For blob, we still store base64 internally but can convert on submit
        newValue = signaturePadRef.current.toDataURL('image/png');
        break;
      case 'base64':
      default:
        newValue = signaturePadRef.current.toDataURL('image/png');
    }

    onChange(newValue as TFieldValues[TName]);
    onBlur();
  }, [onChange, onBlur, outputFormat]);

  // Attach event listener for stroke end
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !SignaturePad) return;

    const handleMouseUp = () => handleStrokeEnd();
    const handleTouchEnd = () => handleStrokeEnd();

    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('touchend', handleTouchEnd);

    return () => {
      canvas.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleStrokeEnd, SignaturePad]);

  // Clear signature
  const handleClear = useCallback(() => {
    if (!signaturePadRef.current) return;

    signaturePadRef.current.clear();
    onChange('' as TFieldValues[TName]);
  }, [onChange]);

  // Loading state
  if (isLoading) {
    return (
      <Box sx={{ width: fullWidth ? '100%' : width }}>
        {label && (
          <FormLabel required={required} error={!!error} sx={{ display: 'block', mb: 0.5 }}>
            {label}
          </FormLabel>
        )}
        <Paper
          variant="outlined"
          sx={{
            width,
            height,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <CircularProgress size={24} />
        </Paper>
      </Box>
    );
  }

  // Error state - signature_pad not installed
  if (loadError || !SignaturePad) {
    return (
      <Box sx={{ width: fullWidth ? '100%' : width }}>
        {label && (
          <FormLabel required={required} error={!!error} sx={{ display: 'block', mb: 0.5 }}>
            {label}
          </FormLabel>
        )}
        <Paper
          variant="outlined"
          sx={{
            p: 2,
            width,
            height,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'grey.100',
          }}
        >
          <FormHelperText error>
            signature_pad is required. Install with:
            <br />
            <code>npm install signature_pad</code>
          </FormHelperText>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ width: fullWidth ? '100%' : 'auto' }}>
      {label && (
        <FormLabel required={required} error={!!error} sx={{ display: 'block', mb: 0.5 }}>
          {label}
        </FormLabel>
      )}

      <Paper
        variant="outlined"
        sx={{
          borderColor: error ? 'error.main' : 'divider',
          overflow: 'hidden',
          width: fullWidth ? '100%' : width,
          maxWidth: width,
          position: 'relative',
        }}
      >
        <canvas
          ref={canvasRef}
          style={{
            display: 'block',
            touchAction: 'none',
            cursor: disabled ? 'not-allowed' : 'crosshair',
            opacity: disabled ? 0.6 : 1,
          }}
        />

        {/* Signature line */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 40,
            left: 20,
            right: 20,
            borderBottom: '1px dashed',
            borderColor: 'grey.400',
            pointerEvents: 'none',
          }}
        />

        {/* X mark for signature start */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 44,
            left: 20,
            color: 'grey.500',
            fontSize: '0.875rem',
            pointerEvents: 'none',
          }}
        >
          ✕
        </Box>

        {showClearButton && !disabled && (
          <Box
            sx={{
              position: 'absolute',
              bottom: 8,
              right: 8,
            }}
          >
            <Button
              size="small"
              variant="outlined"
              onClick={handleClear}
              startIcon={<ClearIcon />}
              sx={{
                backgroundColor: 'background.paper',
                fontSize: '0.75rem',
              }}
            >
              {clearButtonText}
            </Button>
          </Box>
        )}
      </Paper>

      {(error?.message || helperText) && (
        <FormHelperText error={!!error} sx={{ mt: 0.5 }}>
          {error?.message ?? helperText}
        </FormHelperText>
      )}
    </Box>
  );
}
