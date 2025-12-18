import React, { useRef, useCallback, KeyboardEvent, ClipboardEvent } from 'react';
import { useController, useFormContext, FieldValues, FieldPath } from 'react-hook-form';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import FormHelperText from '@mui/material/FormHelperText';
import FormLabel from '@mui/material/FormLabel';
import type { RHFOTPProps } from '../types';
import { useFieldRequired } from '../context/SchemaContext';

/**
 * One-Time Password (OTP) input component with individual digit boxes
 *
 * @example
 * ```tsx
 * <RHFOTP
 *   name="otp"
 *   label="Enter OTP"
 *   length={6}
 * />
 * ```
 */
export function RHFOTP<
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
  length = 6,
  autoFocus = false,
  variant = 'outlined',
  size = 'medium',
  type = 'text',
  label,
  onComplete,
  separator,
  separatorPosition,
}: RHFOTPProps<TFieldValues, TName>) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

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

  // Convert value to array of digits
  const otpValue = String(value ?? '').split('').slice(0, length);
  while (otpValue.length < length) {
    otpValue.push('');
  }

  const focusInput = (index: number) => {
    if (index >= 0 && index < length) {
      inputRefs.current[index]?.focus();
    }
  };

  const handleChange = useCallback(
    (index: number, inputValue: string) => {
      // Only allow single character input
      const char = inputValue.slice(-1);

      // Validate input based on type
      if (type === 'number' && char && !/^\d$/.test(char)) {
        return;
      }

      // Update value array
      const newValue = [...otpValue];
      newValue[index] = char;
      const joinedValue = newValue.join('');
      onChange(joinedValue);

      // Auto-focus next input
      if (char && index < length - 1) {
        focusInput(index + 1);
      }

      // Check if complete
      if (joinedValue.length === length && !joinedValue.includes('')) {
        onComplete?.(joinedValue);
      }
    },
    [otpValue, onChange, length, type, onComplete]
  );

  const handleKeyDown = useCallback(
    (index: number, event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Backspace') {
        if (otpValue[index] === '' && index > 0) {
          // Move to previous input and clear it
          focusInput(index - 1);
          const newValue = [...otpValue];
          newValue[index - 1] = '';
          onChange(newValue.join(''));
        } else {
          // Clear current input
          const newValue = [...otpValue];
          newValue[index] = '';
          onChange(newValue.join(''));
        }
        event.preventDefault();
      } else if (event.key === 'ArrowLeft' && index > 0) {
        focusInput(index - 1);
        event.preventDefault();
      } else if (event.key === 'ArrowRight' && index < length - 1) {
        focusInput(index + 1);
        event.preventDefault();
      }
    },
    [otpValue, onChange, length]
  );

  const handlePaste = useCallback(
    (event: ClipboardEvent<HTMLInputElement>) => {
      event.preventDefault();
      const pastedData = event.clipboardData.getData('text').slice(0, length);

      // Validate pasted data based on type
      if (type === 'number' && !/^\d*$/.test(pastedData)) {
        return;
      }

      const newValue = pastedData.split('').slice(0, length);
      while (newValue.length < length) {
        newValue.push('');
      }

      onChange(newValue.join(''));

      // Focus last filled input or first empty
      const lastFilledIndex = pastedData.length - 1;
      focusInput(Math.min(lastFilledIndex + 1, length - 1));

      // Check if complete
      if (pastedData.length === length) {
        onComplete?.(pastedData);
      }
    },
    [onChange, length, type, onComplete]
  );

  // Calculate separator positions (e.g., "3" means after index 2, "3,6" means after 2 and 5)
  const separatorPositions = separatorPosition
    ? separatorPosition.split(',').map((p) => parseInt(p.trim(), 10) - 1)
    : [];

  const inputWidth = size === 'small' ? 40 : 48;
  const inputHeight = size === 'small' ? 40 : 56;

  return (
    <Box>
      {label && (
        <FormLabel
          required={required}
          error={!!error}
          sx={{ display: 'block', mb: 1 }}
        >
          {label}
        </FormLabel>
      )}

      <Box
        sx={{
          display: 'flex',
          gap: 1,
          alignItems: 'center',
        }}
      >
        {otpValue.map((digit, index) => (
          <React.Fragment key={index}>
            <TextField
              inputRef={(el) => {
                inputRefs.current[index] = el;
              }}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e as KeyboardEvent<HTMLInputElement>)}
              onPaste={handlePaste}
              onBlur={onBlur}
              disabled={disabled}
              error={!!error}
              variant={variant}
              size={size}
              autoFocus={autoFocus && index === 0}
              slotProps={{
                htmlInput: {
                  maxLength: 1,
                  style: {
                    textAlign: 'center',
                    fontSize: size === 'small' ? '1.25rem' : '1.5rem',
                    fontWeight: 600,
                    padding: size === 'small' ? '8px' : '12px',
                    width: inputWidth,
                    height: inputHeight,
                    boxSizing: 'border-box',
                  },
                  inputMode: type === 'number' ? 'numeric' : 'text',
                  autoComplete: 'one-time-code',
                  'aria-label': `Digit ${index + 1} of ${length}`,
                },
              }}
              sx={{
                width: inputWidth,
                '& .MuiOutlinedInput-root': {
                  width: inputWidth,
                },
              }}
            />
            {separator && separatorPositions.includes(index) && (
              <Box
                component="span"
                sx={{
                  mx: 0.5,
                  fontSize: size === 'small' ? '1.25rem' : '1.5rem',
                  fontWeight: 600,
                  color: 'text.secondary',
                }}
              >
                {separator}
              </Box>
            )}
          </React.Fragment>
        ))}
      </Box>

      {(error?.message || helperText) && (
        <FormHelperText error={!!error} sx={{ mt: 1 }}>
          {error?.message ?? helperText}
        </FormHelperText>
      )}
    </Box>
  );
}
