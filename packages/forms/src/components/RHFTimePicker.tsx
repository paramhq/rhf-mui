import { useController, useFormContext, FieldValues, FieldPath } from 'react-hook-form';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import type { RHFTimePickerProps } from '../types';
import { useFieldRequired } from '../context/SchemaContext';

/**
 * Time picker component integrated with React Hook Form
 * Requires @mui/x-date-pickers and a date adapter (dayjs, date-fns, etc.)
 *
 * @example
 * ```tsx
 * <RHFTimePicker
 *   name="appointmentTime"
 *   label="Appointment Time"
 * />
 * ```
 *
 * @example 12-hour format with AM/PM
 * ```tsx
 * <RHFTimePicker
 *   name="meetingTime"
 *   label="Meeting Time"
 *   ampm
 * />
 * ```
 *
 * @example With time restrictions
 * ```tsx
 * <RHFTimePicker
 *   name="officeHours"
 *   label="Office Hours"
 *   minTime={new Date(0, 0, 0, 9, 0)}  // 9:00 AM
 *   maxTime={new Date(0, 0, 0, 17, 0)} // 5:00 PM
 * />
 * ```
 */
export function RHFTimePicker<
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
  ampm = false,
  minTime,
  maxTime,
  size = 'medium',
}: RHFTimePickerProps<TFieldValues, TName>) {
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
    <TimePicker
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
          const isoString: string = toIso.call(newValue);
          // Extract time part: "10:30:00" from "2026-01-15T10:30:00.000Z"
          const timePart = isoString.split('T')[1]?.split('.')[0];
          onChange(timePart ?? isoString);
        } else {
          // Fallback: pass as-is (shouldn't happen with standard adapters)
          onChange(newValue);
        }
      }}
      ampm={ampm}
      minTime={minTime}
      maxTime={maxTime}
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
