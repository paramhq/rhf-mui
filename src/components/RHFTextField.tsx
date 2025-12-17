import React from 'react';
import { useController, useFormContext, FieldValues, FieldPath } from 'react-hook-form';
import TextField from '@mui/material/TextField';
import type { RHFTextFieldProps } from '../types';
import { useFieldRequired, useFieldMeta } from '../context/SchemaContext';

/**
 * Text field component integrated with React Hook Form
 *
 * @example
 * ```tsx
 * <RHFTextField
 *   name="email"
 *   label="Email Address"
 *   placeholder="Enter your email"
 * />
 * ```
 *
 * @example With transform
 * ```tsx
 * <RHFTextField
 *   name="username"
 *   label="Username"
 *   transform={{
 *     output: (value) => value.toLowerCase().trim(),
 *   }}
 * />
 * ```
 */
export function RHFTextField<
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
  transform,
  ...textFieldProps
}: RHFTextFieldProps<TFieldValues, TName>) {
  const formContext = useFormContext<TFieldValues>();
  const control = controlProp ?? formContext?.control;

  const schemaRequired = useFieldRequired(name);
  const fieldMeta = useFieldMeta(name);
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
    const newValue = transform?.output
      ? transform.output(event.target.value)
      : event.target.value;
    onChange(newValue);
  };

  const displayValue = transform?.input ? transform.input(value) : (value ?? '');

  return (
    <TextField
      {...textFieldProps}
      name={name}
      value={displayValue}
      onChange={handleChange}
      onBlur={onBlur}
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
          maxLength: fieldMeta.maxLength,
        },
      }}
    />
  );
}
