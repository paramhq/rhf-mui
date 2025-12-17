import { useController, useFormContext, FieldValues, FieldPath } from 'react-hook-form';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import type { RHFDatePickerProps } from '../types';
import { useFieldRequired } from '../context/SchemaContext';

/**
 * Date picker component integrated with React Hook Form
 * Requires @mui/x-date-pickers and a date adapter (dayjs, date-fns, etc.)
 *
 * @example
 * ```tsx
 * <RHFDatePicker
 *   name="birthDate"
 *   label="Date of Birth"
 *   disableFuture
 * />
 * ```
 *
 * @example With min/max dates
 * ```tsx
 * <RHFDatePicker
 *   name="appointmentDate"
 *   label="Appointment Date"
 *   minDate={new Date()}
 *   maxDate={addMonths(new Date(), 3)}
 * />
 * ```
 *
 * @example Year/Month picker
 * ```tsx
 * <RHFDatePicker
 *   name="expiryDate"
 *   label="Expiry Date"
 *   views={['year', 'month']}
 *   openTo="year"
 * />
 * ```
 */
export function RHFDatePicker<
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
  minDate,
  maxDate,
  format = 'DD/MM/YYYY',
  disableFuture = false,
  disablePast = false,
  size = 'medium',
  openTo = 'day',
  views = ['year', 'month', 'day'],
}: RHFDatePickerProps<TFieldValues, TName>) {
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
    <DatePicker
      label={label}
      value={value ?? null}
      onChange={(newValue) => onChange(newValue)}
      minDate={minDate}
      maxDate={maxDate}
      format={format}
      disableFuture={disableFuture}
      disablePast={disablePast}
      openTo={openTo}
      views={views}
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
