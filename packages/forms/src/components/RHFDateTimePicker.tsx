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
      value={value || null}
      onChange={(newValue) => {
        if (!newValue) {
          onChange(null);
          return;
        }

        // Adapter-agnostic: works with Day.js, Moment, native Date, Luxon
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const toIso = (newValue as any).toISOString ?? (newValue as any).toISO;

        if (typeof toIso === 'function') {
          // Full ISO string for datetime: "2026-01-15T10:30:00.000Z"
          onChange(toIso.call(newValue));
        } else {
          // Fallback: pass as-is (shouldn't happen with standard adapters)
          onChange(newValue);
        }
      }}
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
