import { ChangeEvent, FocusEvent, useCallback } from 'react';
import { useController, useFormContext, FieldValues, FieldPath } from 'react-hook-form';
import TextField from '@mui/material/TextField';
import type { RHFNumberFieldProps } from '../types';
import { useFieldRequired, useFieldMeta } from '../context/SchemaContext';

/**
 * Number field component integrated with React Hook Form
 *
 * @example
 * ```tsx
 * <RHFNumberField
 *   name="age"
 *   label="Age"
 *   min={0}
 *   max={120}
 * />
 * ```
 *
 * @example With decimal places
 * ```tsx
 * <RHFNumberField
 *   name="price"
 *   label="Price"
 *   decimalPlaces={2}
 *   min={0}
 * />
 * ```
 */
export function RHFNumberField<
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
  min,
  max,
  step,
  decimalPlaces,
  allowNegative = true,
  ...textFieldProps
}: RHFNumberFieldProps<TFieldValues, TName>) {
  const formContext = useFormContext<TFieldValues>();
  const control = controlProp ?? formContext?.control;

  const schemaRequired = useFieldRequired(name);
  const fieldMeta = useFieldMeta(name);
  const required = requiredProp ?? schemaRequired;

  // Use schema constraints if not explicitly provided
  const effectiveMin = min ?? fieldMeta.min;
  const effectiveMax = max ?? fieldMeta.max;

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

  const parseValue = useCallback(
    (inputValue: string): number | null => {
      if (!inputValue || inputValue === '' || inputValue === '-') return null;

      let parsed: number;
      if (decimalPlaces !== undefined) {
        parsed = parseFloat(inputValue);
        if (!isNaN(parsed)) {
          parsed = Math.round(parsed * Math.pow(10, decimalPlaces)) / Math.pow(10, decimalPlaces);
        }
      } else {
        parsed = parseFloat(inputValue);
      }

      if (isNaN(parsed)) return null;
      return parsed;
    },
    [decimalPlaces]
  );

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const inputValue = event.target.value;

    // Allow empty input
    if (inputValue === '') {
      onChange(null);
      return;
    }

    // Allow typing minus sign at start
    if (inputValue === '-' && allowNegative) {
      return;
    }

    // Validate input format
    const regex = allowNegative ? /^-?\d*\.?\d*$/ : /^\d*\.?\d*$/;
    if (!regex.test(inputValue)) {
      return;
    }

    const parsed = parseValue(inputValue);
    onChange(parsed);
  };

  const handleBlur = (_event: FocusEvent<HTMLInputElement>) => {
    onBlur();

    // Clamp value to min/max on blur
    if (value !== null && value !== undefined) {
      let clampedValue = value as number;
      if (effectiveMin !== undefined && clampedValue < effectiveMin) {
        clampedValue = effectiveMin;
      }
      if (effectiveMax !== undefined && clampedValue > effectiveMax) {
        clampedValue = effectiveMax;
      }
      if (clampedValue !== value) {
        onChange(clampedValue);
      }
    }
  };

  const displayValue = value !== null && value !== undefined ? String(value) : '';

  return (
    <TextField
      {...textFieldProps}
      type="text"
      inputMode="decimal"
      name={name}
      value={displayValue}
      onChange={handleChange}
      onBlur={handleBlur}
      inputRef={ref}
      error={!!error}
      helperText={error?.message ?? helperText}
      required={required}
      disabled={disabled}
      fullWidth={fullWidth}
      slotProps={{
        ...textFieldProps.slotProps,
        htmlInput: {
          ...textFieldProps.slotProps?.htmlInput,
          min: effectiveMin,
          max: effectiveMax,
          step: step ?? (decimalPlaces ? Math.pow(10, -decimalPlaces) : 1),
        },
      }}
    />
  );
}
