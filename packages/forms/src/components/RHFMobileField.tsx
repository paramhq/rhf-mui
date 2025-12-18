import React from 'react';
import { useController, useFormContext, FieldValues, FieldPath } from 'react-hook-form';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import type { RHFMobileFieldProps } from '../types';
import { useFieldRequired } from '../context/SchemaContext';
import { parseMobile } from '../utils/formatters';

/**
 * Indian mobile number field (10 digits)
 * Stores raw 10 digits, can display with country code
 *
 * @example
 * ```tsx
 * <RHFMobileField
 *   name="mobile"
 *   label="Mobile Number"
 * />
 * ```
 *
 * @example With country code display
 * ```tsx
 * <RHFMobileField
 *   name="mobile"
 *   label="Mobile Number"
 *   showCountryCode
 * />
 * ```
 */
export function RHFMobileField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  name,
  control: controlProp,
  rules,
  defaultValue,
  shouldUnregister,
  helperText = '10-digit mobile number',
  required: requiredProp,
  disabled,
  fullWidth = true,
  showCountryCode = false,
  countryCode = '+91',
  ...textFieldProps
}: RHFMobileFieldProps<TFieldValues, TName>) {
  const formContext = useFormContext<TFieldValues>();
  const control = controlProp ?? formContext?.control;

  const schemaRequired = useFieldRequired(name);
  const required = requiredProp ?? schemaRequired;

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

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const input = event.target.value;
    const digits = parseMobile(input);

    // Only allow valid Indian mobile number start (6, 7, 8, 9)
    if (digits.length > 0 && !/^[6-9]/.test(digits)) {
      return;
    }

    onChange(digits);
  };

  return (
    <TextField
      {...textFieldProps}
      type="tel"
      inputMode="tel"
      name={name}
      value={(value as string) ?? ''}
      onChange={handleChange}
      onBlur={onBlur}
      inputRef={ref}
      error={!!error}
      helperText={error?.message ?? helperText}
      required={required}
      disabled={disabled}
      fullWidth={fullWidth}
      placeholder="9876543210"
      slotProps={{
        ...textFieldProps.slotProps,
        htmlInput: {
          ...textFieldProps.slotProps?.htmlInput,
          maxLength: 10,
        },
        input: {
          ...textFieldProps.slotProps?.input,
          startAdornment: showCountryCode ? (
            <InputAdornment position="start">{countryCode}</InputAdornment>
          ) : undefined,
        },
      }}
    />
  );
}
