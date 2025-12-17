import { useController, useFormContext, FieldValues, FieldPath } from 'react-hook-form';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import type { RHFDateTimePickerProps } from '../types';
import { useFieldRequired } from '../context/SchemaContext';

/**
 * Combined date and time picker component integrated with React Hook Form
 * Requires @mui/x-date-pickers and a date adapter (dayjs, date-fns, etc.)
 *
 * @example
 * ```tsx
 * <RHFDateTimePicker
 *   name="eventDateTime"
 *   label="Event Date & Time"
 * />
 * ```
 *
 * @example With restrictions
 * ```tsx
 * <RHFDateTimePicker
 *   name="scheduledAt"
 *   label="Schedule At"
 *   minDateTime={new Date()}
 *   ampm
 * />
 * ```
 */
export function RHFDateTimePicker<
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
  label,
  placeholder,
  minDateTime,
  maxDateTime,
  ampm = false,
  size = 'medium',
}: RHFDateTimePickerProps<TFieldValues, TName>) {
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

  return (
    <DateTimePicker
      label={label}
      value={value ?? null}
      onChange={(newValue) => onChange(newValue)}
      minDateTime={minDateTime}
      maxDateTime={maxDateTime}
      ampm={ampm}
      disabled={disabled}
      inputRef={ref}
      slotProps={{
        textField: {
          size,
          fullWidth,
          required,
          error: !!error,
          helperText: error?.message ?? helperText,
          placeholder,
          onBlur,
        },
      }}
    />
  );
}
