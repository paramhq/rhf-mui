import React, { useState, useCallback } from 'react';
import { useController, useFormContext, FieldValues, FieldPath } from 'react-hook-form';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import type { RHFAadhaarFieldProps } from '../types';
import { useFieldRequired } from '../context/SchemaContext';
import { formatAadhaar, formatAadhaarMasked, parseAadhaar } from '../utils/formatters';

/**
 * Aadhaar number field with formatting (XXXX XXXX XXXX)
 * Stores raw 12 digits, displays formatted with spaces
 *
 * @example
 * ```tsx
 * <RHFAadhaarField
 *   name="aadhaar"
 *   label="Aadhaar Number"
 * />
 * ```
 *
 * @example With masking (shows only last 4 digits)
 * ```tsx
 * <RHFAadhaarField
 *   name="aadhaar"
 *   label="Aadhaar Number"
 *   masked
 * />
 * ```
 */
export function RHFAadhaarField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  name,
  control: controlProp,
  rules,
  defaultValue,
  shouldUnregister,
  helperText = '12-digit Aadhaar number',
  required: requiredProp,
  disabled,
  fullWidth = true,
  masked = false,
  ...textFieldProps
}: RHFAadhaarFieldProps<TFieldValues, TName>) {
  const formContext = useFormContext<TFieldValues>();
  const control = controlProp ?? formContext?.control;

  const schemaRequired = useFieldRequired(name);
  const required = requiredProp ?? schemaRequired;

  const [showFull, setShowFull] = useState(!masked);
  const [isFocused, setIsFocused] = useState(false);

  const {
    field: { value, onChange, onBlur, ref },
    fieldState: { error },
  } = useController({
    name,
    control,
    rules,
    defaultValue,
    shouldUnregister,
  });

  // Format for display
  const getDisplayValue = useCallback(() => {
    const rawValue = (value as string) ?? '';
    if (!rawValue) return '';

    // When focused, always show formatted but unmasked
    if (isFocused) {
      return formatAadhaar(rawValue);
    }

    // When not focused, respect masking preference
    if (masked && !showFull) {
      return formatAadhaarMasked(rawValue);
    }

    return formatAadhaar(rawValue);
  }, [value, isFocused, masked, showFull]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const input = event.target.value;

    // Extract only digits
    const digits = parseAadhaar(input);

    // Update the stored value (raw digits)
    onChange(digits);
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
    onBlur();
  };

  const handleToggleVisibility = () => {
    setShowFull((prev) => !prev);
  };

  return (
    <TextField
      {...textFieldProps}
      type="text"
      inputMode="numeric"
      name={name}
      value={getDisplayValue()}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      inputRef={ref}
      error={!!error}
      helperText={error?.message ?? helperText}
      required={required}
      disabled={disabled}
      fullWidth={fullWidth}
      placeholder="XXXX XXXX XXXX"
      slotProps={{
        ...textFieldProps.slotProps,
        htmlInput: {
          ...textFieldProps.slotProps?.htmlInput,
          maxLength: 14, // 12 digits + 2 spaces
        },
        input: {
          ...textFieldProps.slotProps?.input,
          endAdornment: masked ? (
            <InputAdornment position="end">
              <IconButton
                aria-label={showFull ? 'Hide Aadhaar' : 'Show Aadhaar'}
                onClick={handleToggleVisibility}
                edge="end"
                disabled={disabled}
                size="small"
              >
                {showFull ? <VisibilityOffIcon /> : <VisibilityIcon />}
              </IconButton>
            </InputAdornment>
          ) : undefined,
        },
      }}
    />
  );
}
