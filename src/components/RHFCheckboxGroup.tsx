import React from 'react';
import { useController, useFormContext, FieldValues, FieldPath } from 'react-hook-form';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import FormHelperText from '@mui/material/FormHelperText';
import type { RHFCheckboxGroupProps } from '../types';
import { useFieldRequired } from '../context/SchemaContext';

/**
 * Checkbox group component for multi-select (stores array of values)
 *
 * @example
 * ```tsx
 * <RHFCheckboxGroup
 *   name="interests"
 *   label="Interests"
 *   options={[
 *     { value: 'sports', label: 'Sports' },
 *     { value: 'music', label: 'Music' },
 *     { value: 'reading', label: 'Reading' },
 *     { value: 'gaming', label: 'Gaming' },
 *   ]}
 * />
 * ```
 *
 * @example Horizontal layout
 * ```tsx
 * <RHFCheckboxGroup
 *   name="features"
 *   label="Features"
 *   row
 *   options={[
 *     { value: 'wifi', label: 'WiFi' },
 *     { value: 'parking', label: 'Parking' },
 *     { value: 'pool', label: 'Pool' },
 *   ]}
 * />
 * ```
 */
export function RHFCheckboxGroup<
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
  options,
  label,
  row = false,
}: RHFCheckboxGroupProps<TFieldValues, TName>) {
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

  const selectedValues: (string | number)[] = Array.isArray(value) ? value : [];

  const handleChange = (optionValue: string | number) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.checked
      ? [...selectedValues, optionValue]
      : selectedValues.filter((v) => v !== optionValue);
    onChange(newValue);
  };

  return (
    <FormControl error={!!error} disabled={disabled} component="fieldset">
      {label && (
        <FormLabel required={required} component="legend">
          {label}
        </FormLabel>
      )}
      <FormGroup row={row} onBlur={onBlur}>
        {options.map((option) => (
          <FormControlLabel
            key={String(option.value)}
            control={
              <Checkbox
                checked={selectedValues.includes(option.value)}
                onChange={handleChange(option.value)}
                disabled={option.disabled}
              />
            }
            label={option.label}
          />
        ))}
      </FormGroup>
      {(error?.message || helperText) && (
        <FormHelperText>{error?.message ?? helperText}</FormHelperText>
      )}
    </FormControl>
  );
}
