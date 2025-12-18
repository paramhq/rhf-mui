import { useController, useFormContext, FieldValues, FieldPath } from 'react-hook-form';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import type { RHFTextAreaProps } from '../types';
import { useFieldRequired, useFieldMeta } from '../context/SchemaContext';

/**
 * Multi-line text area component integrated with React Hook Form
 *
 * @example
 * ```tsx
 * <RHFTextArea
 *   name="description"
 *   label="Description"
 *   minRows={3}
 *   maxRows={10}
 *   showCharacterCount
 *   maxLength={500}
 * />
 * ```
 */
export function RHFTextArea<
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
  minRows = 3,
  maxRows = 10,
  showCharacterCount = false,
  maxLength: maxLengthProp,
  ...textFieldProps
}: RHFTextAreaProps<TFieldValues, TName>) {
  const formContext = useFormContext<TFieldValues>();
  const control = controlProp ?? formContext?.control;

  const schemaRequired = useFieldRequired(name);
  const fieldMeta = useFieldMeta(name);
  const required = requiredProp ?? schemaRequired;
  const maxLength = maxLengthProp ?? fieldMeta.maxLength;

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

  const currentLength = typeof value === 'string' ? value.length : 0;

  const characterCountText =
    showCharacterCount && maxLength
      ? `${currentLength}/${maxLength}`
      : showCharacterCount
        ? `${currentLength} characters`
        : undefined;

  const combinedHelperText = error?.message ?? helperText;

  return (
    <Box sx={{ position: 'relative', width: fullWidth ? '100%' : 'auto' }}>
      <TextField
        {...textFieldProps}
        multiline
        minRows={minRows}
        maxRows={maxRows}
        name={name}
        value={value ?? ''}
        onChange={onChange}
        onBlur={onBlur}
        inputRef={ref}
        error={!!error}
        helperText={combinedHelperText}
        required={required}
        disabled={disabled}
        fullWidth={fullWidth}
        slotProps={{
          ...textFieldProps.slotProps,
          htmlInput: {
            ...textFieldProps.slotProps?.htmlInput,
            maxLength,
          },
        }}
      />
      {showCharacterCount && (
        <Typography
          variant="caption"
          color={
            maxLength && currentLength >= maxLength
              ? 'error'
              : maxLength && currentLength >= maxLength * 0.9
                ? 'warning.main'
                : 'text.secondary'
          }
          sx={{
            position: 'absolute',
            right: 8,
            bottom: error || combinedHelperText ? 28 : 8,
          }}
        >
          {characterCountText}
        </Typography>
      )}
    </Box>
  );
}
