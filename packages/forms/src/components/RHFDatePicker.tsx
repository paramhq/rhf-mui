import { useMemo } from 'react';
import { useController, useFormContext, FieldValues, FieldPath } from 'react-hook-form';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useLocalizationContext } from '@mui/x-date-pickers/internals';
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

  // Access the date adapter from LocalizationProvider
  const { utils } = useLocalizationContext();

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

  // Convert string values to date objects for the picker
  // This allows form state to store strings while picker displays correctly
  const pickerValue = useMemo(() => {
    if (!value) return null;
    // If already a date object (has isValid method), use as-is
    if (typeof value === 'object' && 'isValid' in value) return value;
    // If string, parse using the adapter
    if (typeof value === 'string') {
      const parsed = utils.date(value);
      return parsed && utils.isValid(parsed) ? parsed : null;
    }
    return null;
  }, [value, utils]);

  return (
    <DatePicker
      label={label}
      value={pickerValue}
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
          // Extract date part: "2026-01-15" from "2026-01-15T00:00:00.000Z"
          onChange(isoString.split('T')[0]);
        } else {
          // Fallback: pass as-is (shouldn't happen with standard adapters)
          onChange(newValue);
        }
      }}
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
