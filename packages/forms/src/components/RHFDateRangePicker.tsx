import { useMemo, useCallback } from 'react';
import { useController, useFormContext, FieldValues, FieldPath } from 'react-hook-form';
import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import FormHelperText from '@mui/material/FormHelperText';
import Typography from '@mui/material/Typography';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import type { RHFDateRangePickerProps, DateRange } from '../types';
import { useFieldRequired } from '../context/SchemaContext';

/**
 * Date range picker component with start and end date selection
 *
 * Note: This component stores value as { start: Date, end: Date } object.
 * For Zod schema, use z.object({ start: z.any(), end: z.any() }) or custom refinement.
 *
 * @example
 * ```tsx
 * <RHFDateRangePicker
 *   name="dateRange"
 *   label="Date Range"
 *   startLabel="Start Date"
 *   endLabel="End Date"
 * />
 * ```
 *
 * @example With presets
 * ```tsx
 * <RHFDateRangePicker
 *   name="reportPeriod"
 *   label="Report Period"
 *   showPresets
 *   presets={[
 *     { label: 'Last 7 days', getValue: () => ({ start: subDays(new Date(), 7), end: new Date() }) },
 *     { label: 'Last 30 days', getValue: () => ({ start: subDays(new Date(), 30), end: new Date() }) },
 *   ]}
 * />
 * ```
 *
 * @example Constrained dates
 * ```tsx
 * <RHFDateRangePicker
 *   name="bookingDates"
 *   label="Booking Period"
 *   disablePast
 *   maxRange={30} // Maximum 30 days range
 * />
 * ```
 */
export function RHFDateRangePicker<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TDate = unknown
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
  startLabel = 'Start Date',
  endLabel = 'End Date',
  format = 'DD/MM/YYYY',
  minDate,
  maxDate,
  disableFuture = false,
  disablePast = false,
  size = 'medium',
  direction = 'row',
  spacing = 2,
  separator = '—',
  showPresets = false,
  presets = [],
}: RHFDateRangePickerProps<TFieldValues, TName, TDate>) {
  const formContext = useFormContext<TFieldValues>();
  const control = controlProp ?? formContext?.control;

  const schemaRequired = useFieldRequired(name);
  const required = requiredProp ?? schemaRequired;

  const {
    field: { value, onChange, onBlur },
    fieldState: { error },
  } = useController({
    name,
    control,
    rules,
    defaultValue,
    shouldUnregister,
  });

  const dateRange = useMemo<DateRange<TDate>>(() => {
    if (value && typeof value === 'object' && 'start' in value) {
      return value as DateRange<TDate>;
    }
    return { start: null, end: null };
  }, [value]);

  const handleStartChange = useCallback(
    (newStart: TDate | null) => {
      const newRange: DateRange<TDate> = {
        start: newStart,
        end: dateRange.end,
      };
      // If start date is after end date, reset end date
      if (newStart && dateRange.end) {
        // Use comparison that works with any date library
        const startMs = newStart instanceof Date ? newStart.getTime() : 
          // dayjs/moment have valueOf
          typeof (newStart as any).valueOf === 'function' ? (newStart as any).valueOf() : 0;
        const endMs = dateRange.end instanceof Date ? dateRange.end.getTime() :
          typeof (dateRange.end as any).valueOf === 'function' ? (dateRange.end as any).valueOf() : 0;
        if (startMs > endMs) {
          newRange.end = null;
        }
      }
      onChange(newRange);
    },
    [dateRange.end, onChange]
  );

  const handleEndChange = useCallback(
    (newEnd: TDate | null) => {
      const newRange: DateRange<TDate> = {
        start: dateRange.start,
        end: newEnd,
      };
      onChange(newRange);
    },
    [dateRange.start, onChange]
  );

  const handlePresetClick = useCallback(
    (preset: { label: string; getValue: () => DateRange<TDate> }) => {
      const newRange = preset.getValue();
      onChange(newRange);
    },
    [onChange]
  );

  // Compute minDate for end date picker (must be >= start date)
  const endMinDate = useMemo(() => {
    if (dateRange.start) {
      if (minDate) {
        // Return the later of start and minDate
        const startMs = dateRange.start instanceof Date ? dateRange.start.getTime() :
          typeof (dateRange.start as any).valueOf === 'function' ? (dateRange.start as any).valueOf() : 0;
        const minMs = minDate instanceof Date ? minDate.getTime() :
          typeof (minDate as any).valueOf === 'function' ? (minDate as any).valueOf() : 0;
        return startMs > minMs ? dateRange.start : minDate;
      }
      return dateRange.start as TDate;
    }
    return minDate;
  }, [dateRange.start, minDate]);

  // Get error message - could be on the object itself or on start/end
  const errorMessage = useMemo(() => {
    if (error?.message) return error.message;
    if (error && typeof error === 'object') {
      const errObj = error as Record<string, { message?: string }>;
      if (errObj.start?.message) return errObj.start.message;
      if (errObj.end?.message) return errObj.end.message;
    }
    return undefined;
  }, [error]);

  return (
    <FormControl error={!!error} disabled={disabled} fullWidth={fullWidth}>
      {label && (
        <FormLabel required={required} sx={{ mb: 1 }}>
          {label}
        </FormLabel>
      )}

      {showPresets && presets.length > 0 && (
        <Box sx={{ display: 'flex', gap: 1, mb: 1.5, flexWrap: 'wrap' }}>
          {presets.map((preset) => (
            <Box
              key={preset.label}
              component="button"
              type="button"
              onClick={() => handlePresetClick(preset)}
              disabled={disabled}
              sx={{
                px: 1.5,
                py: 0.5,
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                backgroundColor: 'background.paper',
                cursor: disabled ? 'default' : 'pointer',
                fontSize: '0.875rem',
                '&:hover:not(:disabled)': {
                  backgroundColor: 'action.hover',
                  borderColor: 'primary.main',
                },
                '&:disabled': {
                  opacity: 0.5,
                },
              }}
            >
              {preset.label}
            </Box>
          ))}
        </Box>
      )}

      <Box
        sx={{
          display: 'flex',
          flexDirection: direction,
          alignItems: direction === 'row' ? 'center' : 'stretch',
          gap: spacing,
        }}
        onBlur={onBlur}
      >
        <DatePicker
          label={startLabel}
          value={dateRange.start ?? null}
          onChange={handleStartChange}
          format={format}
          minDate={minDate}
          maxDate={maxDate}
          disableFuture={disableFuture}
          disablePast={disablePast}
          disabled={disabled}
          slotProps={{
            textField: {
              size,
              fullWidth: direction === 'column',
              error: !!error,
              sx: direction === 'row' ? { flex: 1 } : undefined,
            },
          }}
        />

        {separator && direction === 'row' && (
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ flexShrink: 0 }}
          >
            {separator}
          </Typography>
        )}

        <DatePicker
          label={endLabel}
          value={dateRange.end ?? null}
          onChange={handleEndChange}
          format={format}
          minDate={endMinDate}
          maxDate={maxDate}
          disableFuture={disableFuture}
          disablePast={disablePast}
          disabled={disabled}
          slotProps={{
            textField: {
              size,
              fullWidth: direction === 'column',
              error: !!error,
              sx: direction === 'row' ? { flex: 1 } : undefined,
            },
          }}
        />
      </Box>

      {(errorMessage || helperText) && (
        <FormHelperText>{errorMessage ?? helperText}</FormHelperText>
      )}
    </FormControl>
  );
}
