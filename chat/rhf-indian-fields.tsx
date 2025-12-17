import * as React from 'react';
import { useController, type FieldPath, type FieldValues, type UseControllerProps } from 'react-hook-form';
import TextField, { type TextFieldProps } from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

// =============================================================================
// Base Props
// =============================================================================

interface BaseFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> extends Omit<TextFieldProps, 'name' | 'value' | 'onChange' | 'onBlur' | 'error' | 'defaultValue'>,
    Omit<UseControllerProps<TFieldValues, TName>, 'control'> {
  control: UseControllerProps<TFieldValues, TName>['control'];
  helperText?: string;
}

// =============================================================================
// 1. RHFAmountField - Indian Rupee formatting
// =============================================================================

interface RHFAmountFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> extends BaseFieldProps<TFieldValues, TName> {
  /** Currency symbol (default: ₹) */
  currency?: string;
  /** Locale for number formatting (default: en-IN) */
  locale?: string;
  /** Decimal places (default: 2) */
  decimalPlaces?: number;
}

/**
 * Formats number to Indian locale: 1,00,000.00
 */
function formatIndianCurrency(value: number | null | undefined, decimalPlaces: number): string {
  if (value == null || isNaN(value)) return '';
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces,
  }).format(value);
}

/**
 * Parses Indian formatted string back to number
 */
function parseIndianCurrency(value: string): number | null {
  if (!value?.trim()) return null;
  // Remove commas and spaces
  const cleaned = value.replace(/[,\s]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? null : parsed;
}

export function RHFAmountField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  name,
  control,
  rules,
  defaultValue,
  shouldUnregister,
  helperText,
  currency = '₹',
  locale = 'en-IN',
  decimalPlaces = 2,
  ...textFieldProps
}: RHFAmountFieldProps<TFieldValues, TName>) {
  const {
    field: { value, onChange, onBlur, ref },
    fieldState: { error },
  } = useController({ name, control, rules, defaultValue, shouldUnregister });

  const [isFocused, setIsFocused] = React.useState(false);
  const [inputValue, setInputValue] = React.useState('');

  // Sync display value when form value changes externally
  React.useEffect(() => {
    if (!isFocused) {
      setInputValue(formatIndianCurrency(value, decimalPlaces));
    }
  }, [value, isFocused, decimalPlaces]);

  const handleFocus = () => {
    setIsFocused(true);
    // Show raw number for easier editing
    if (value != null) {
      setInputValue(String(value));
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    const parsed = parseIndianCurrency(inputValue);
    onChange(parsed);
    setInputValue(formatIndianCurrency(parsed, decimalPlaces));
    onBlur();
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    setInputValue(newValue);
    
    // Update form value in real-time for validation
    const parsed = parseIndianCurrency(newValue);
    if (parsed !== null) {
      onChange(parsed);
    }
  };

  return (
    <TextField
      {...textFieldProps}
      name={name}
      value={inputValue}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      inputRef={ref}
      error={!!error}
      helperText={error?.message ?? helperText}
      slotProps={{
        input: {
          startAdornment: <InputAdornment position="start">{currency}</InputAdornment>,
          inputMode: 'decimal',
          ...textFieldProps.slotProps?.input,
        },
      }}
    />
  );
}

// =============================================================================
// 2. RHFAadhaarField - 12-digit Aadhaar with masking
// =============================================================================

interface RHFAadhaarFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> extends BaseFieldProps<TFieldValues, TName> {
  /** Show masked format XXXX XXXX 1234 (default: false) */
  masked?: boolean;
}

/**
 * Formats Aadhaar as XXXX XXXX XXXX
 */
function formatAadhaar(input: string): string {
  const digits = (input ?? '').replace(/\D/g, '').slice(0, 12);
  const parts: string[] = [];
  for (let i = 0; i < digits.length; i += 4) {
    parts.push(digits.slice(i, i + 4));
  }
  return parts.join(' ');
}

/**
 * Masks Aadhaar as XXXX XXXX 1234
 */
function maskAadhaar(input: string): string {
  const digits = (input ?? '').replace(/\D/g, '');
  if (digits.length === 0) return '';
  if (digits.length <= 4) return 'XXXX XXXX ' + digits;
  if (digits.length <= 8) return 'XXXX XXXX ' + digits.slice(4);
  return 'XXXX XXXX ' + digits.slice(8);
}

export function RHFAadhaarField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  name,
  control,
  rules,
  defaultValue,
  shouldUnregister,
  helperText,
  masked = false,
  ...textFieldProps
}: RHFAadhaarFieldProps<TFieldValues, TName>) {
  const {
    field: { value, onChange, onBlur, ref },
    fieldState: { error },
  } = useController({ name, control, rules, defaultValue, shouldUnregister });

  const [showFull, setShowFull] = React.useState(!masked);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // Store only digits
    const digits = event.target.value.replace(/\D/g, '').slice(0, 12);
    onChange(digits);
  };

  const displayValue = showFull ? formatAadhaar(value ?? '') : maskAadhaar(value ?? '');

  return (
    <TextField
      {...textFieldProps}
      name={name}
      value={displayValue}
      onChange={handleChange}
      onBlur={onBlur}
      inputRef={ref}
      error={!!error}
      helperText={error?.message ?? helperText ?? '12-digit Aadhaar number'}
      slotProps={{
        input: {
          inputMode: 'numeric',
          endAdornment: masked ? (
            <InputAdornment position="end">
              <IconButton
                onClick={() => setShowFull((prev) => !prev)}
                edge="end"
                size="small"
                aria-label={showFull ? 'Hide Aadhaar' : 'Show Aadhaar'}
              >
                {showFull ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ) : undefined,
          ...textFieldProps.slotProps?.input,
        },
        htmlInput: {
          maxLength: 14, // 12 digits + 2 spaces
        },
      }}
    />
  );
}

// =============================================================================
// 3. RHFPanField - PAN Card (ABCDE1234F)
// =============================================================================

/**
 * Validates and formats PAN input
 * Format: 5 letters + 4 digits + 1 letter
 */
function formatPan(input: string): string {
  const upper = input.toUpperCase();
  let result = '';

  for (let i = 0; i < Math.min(upper.length, 10); i++) {
    const char = upper[i];
    // Positions 0-4: letters only
    if (i < 5 && /[A-Z]/.test(char)) {
      result += char;
    }
    // Positions 5-8: digits only
    else if (i >= 5 && i < 9 && /[0-9]/.test(char)) {
      result += char;
    }
    // Position 9: letter only
    else if (i === 9 && /[A-Z]/.test(char)) {
      result += char;
    }
  }

  return result;
}

export function RHFPanField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  name,
  control,
  rules,
  defaultValue,
  shouldUnregister,
  helperText,
  ...textFieldProps
}: BaseFieldProps<TFieldValues, TName>) {
  const {
    field: { value, onChange, onBlur, ref },
    fieldState: { error },
  } = useController({ name, control, rules, defaultValue, shouldUnregister });

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPan(event.target.value);
    onChange(formatted);
  };

  return (
    <TextField
      {...textFieldProps}
      name={name}
      value={value ?? ''}
      onChange={handleChange}
      onBlur={onBlur}
      inputRef={ref}
      error={!!error}
      helperText={error?.message ?? helperText ?? 'Format: ABCDE1234F'}
      slotProps={{
        input: {
          style: { textTransform: 'uppercase' },
          ...textFieldProps.slotProps?.input,
        },
        htmlInput: {
          maxLength: 10,
        },
      }}
    />
  );
}
