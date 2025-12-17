import React, { useState, useCallback } from 'react';
import { useController, useFormContext, FieldValues, FieldPath } from 'react-hook-form';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import type { RHFAmountFieldProps } from '../types';
import { useFieldRequired } from '../context/SchemaContext';
import { formatIndianCurrency, parseIndianCurrency } from '../utils/formatters';

/**
 * Indian currency amount field with automatic formatting
 * Displays formatted value on blur, raw number on focus for easy editing
 *
 * @example
 * ```tsx
 * <RHFAmountField
 *   name="amount"
 *   label="Loan Amount"
 * />
 * ```
 *
 * @example Custom decimal places
 * ```tsx
 * <RHFAmountField
 *   name="price"
 *   label="Price"
 *   decimalPlaces={0}
 *   currency="$"
 *   locale="en-US"
 * />
 * ```
 */
export function RHFAmountField<
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
  currency = '\u20B9', // ₹
  locale = 'en-IN',
  decimalPlaces = 2,
  ...textFieldProps
}: RHFAmountFieldProps<TFieldValues, TName>) {
  const formContext = useFormContext<TFieldValues>();
  const control = controlProp ?? formContext?.control;

  const schemaRequired = useFieldRequired(name);
  const required = requiredProp ?? schemaRequired;

  const [isFocused, setIsFocused] = useState(false);
  const [inputValue, setInputValue] = useState('');

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

  // Format the display value
  const getDisplayValue = useCallback(() => {
    if (isFocused) {
      return inputValue;
    }
    if (value === null || value === undefined || value === '') {
      return '';
    }
    return formatIndianCurrency(value as number, decimalPlaces, locale);
  }, [isFocused, inputValue, value, decimalPlaces, locale]);

  const handleFocus = () => {
    setIsFocused(true);
    // Show raw number for editing
    if (value !== null && value !== undefined && value !== '') {
      setInputValue(String(value));
    } else {
      setInputValue('');
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    onBlur();

    // Parse and store the value
    const parsed = parseIndianCurrency(inputValue);
    onChange(parsed);
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;

    // Allow only numbers, decimal point, and minus sign
    if (newValue === '' || /^-?\d*\.?\d*$/.test(newValue)) {
      setInputValue(newValue);
    }
  };

  return (
    <TextField
      {...textFieldProps}
      type="text"
      inputMode="decimal"
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
      slotProps={{
        ...textFieldProps.slotProps,
        input: {
          ...textFieldProps.slotProps?.input,
          startAdornment: (
            <InputAdornment position="start">{currency}</InputAdornment>
          ),
        },
      }}
    />
  );
}
