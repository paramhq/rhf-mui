import { ChangeEvent } from 'react';
import { useController, useFormContext, FieldValues, FieldPath } from 'react-hook-form';
import TextField from '@mui/material/TextField';
import type { RHFGstFieldProps } from '../types';
import { useFieldRequired } from '../context/SchemaContext';
import { formatGst } from '../utils/formatters';

/**
 * GST number (GSTIN) field with format validation
 * Format: 2 digits (state) + 10 chars (PAN) + 1 char (entity) + 1Z + 1 checksum = 15 chars
 *
 * @example
 * ```tsx
 * <RHFGstField
 *   name="gst"
 *   label="GST Number"
 * />
 * ```
 */
export function RHFGstField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  name,
  control: controlProp,
  rules,
  defaultValue,
  shouldUnregister,
  helperText = 'e.g., 27AAPFU0939F1ZV',
  required: requiredProp,
  disabled,
  fullWidth = true,
  ...textFieldProps
}: RHFGstFieldProps<TFieldValues, TName>) {
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
    const formatted = formatGst(input);
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
      placeholder="27AAPFU0939F1ZV"
      slotProps={{
        ...textFieldProps.slotProps,
        htmlInput: {
          ...textFieldProps.slotProps?.htmlInput,
          maxLength: 15,
        },
      }}
      sx={{ '& input': { textTransform: 'uppercase' } }}
    />
  );
}
