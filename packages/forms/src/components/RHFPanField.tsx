import { ChangeEvent } from 'react';
import { useController, useFormContext, FieldValues, FieldPath } from 'react-hook-form';
import TextField from '@mui/material/TextField';
import type { RHFPanFieldProps } from '../types';
import { useFieldRequired } from '../context/SchemaContext';
import { formatPan } from '../utils/formatters';

/**
 * PAN (Permanent Account Number) field with position-based validation
 * Format: ABCDE1234F (5 letters + 4 digits + 1 letter)
 *
 * @example
 * ```tsx
 * <RHFPanField
 *   name="pan"
 *   label="PAN Number"
 * />
 * ```
 */
export function RHFPanField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  name,
  control: controlProp,
  rules,
  defaultValue,
  shouldUnregister,
  helperText = 'Format: ABCDE1234F',
  required: requiredProp,
  disabled,
  fullWidth = true,
  ...textFieldProps
}: RHFPanFieldProps<TFieldValues, TName>) {
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

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const input = event.target.value;
    const formatted = formatPan(input);
    onChange(formatted);
  };

  return (
    <TextField
      {...textFieldProps}
      type="text"
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
      placeholder="ABCDE1234F"
      slotProps={{
        ...textFieldProps.slotProps,
        htmlInput: {
          ...textFieldProps.slotProps?.htmlInput,
          maxLength: 10,
        },
      }}
      sx={{ '& input': { textTransform: 'uppercase' } }}
    />
  );
}
