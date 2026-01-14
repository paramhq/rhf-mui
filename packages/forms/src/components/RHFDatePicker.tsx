import { useController, useFormContext, FieldValues, FieldPath } from 'react-hook-form';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs, { Dayjs } from 'dayjs';
import type { RHFDatePickerProps } from '../types';
import { useFieldRequired } from '../context/SchemaContext';

/**
 * Date picker component integrated with React Hook Form
 * Stores ISO date strings (YYYY-MM-DD) in form state for Zod compatibility.
 *
 * @example
 * ```tsx
 * <RHFDatePicker
 *   name="birthDate"
 *   label="Date of Birth"
 *   disableFuture
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

  // Convert form value (string | null | undefined | Dayjs) to Dayjs for MUI
  // This runs on every render - no state needed
  const toPickerValue = (): Dayjs | null => {
    if (value === null || value === undefined || value === '') {
      return null;
    }
    if (dayjs.isDayjs(value)) {
      return value;
    }
    if (typeof value === 'string') {
      const parsed = dayjs(value);
      return parsed.isValid() ? parsed : null;
    }
    return null;
  };

  // Convert Dayjs to string for form state (Zod validation)
  const handleChange = (newValue: Dayjs | null): void => {
    if (newValue === null || !newValue.isValid()) {
      onChange(null);
    } else {
      onChange(newValue.format('YYYY-MM-DD'));
    }
  };

  return (
    <DatePicker
      label={label}
      value={toPickerValue()}
      onChange={handleChange}
      minDate={minDate as Dayjs | undefined}
      maxDate={maxDate as Dayjs | undefined}
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
