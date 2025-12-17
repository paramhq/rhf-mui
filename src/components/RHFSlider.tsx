import { useController, useFormContext, FieldValues, FieldPath } from 'react-hook-form';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import FormHelperText from '@mui/material/FormHelperText';
import Slider from '@mui/material/Slider';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import type { RHFSliderProps } from '../types';
import { useFieldRequired } from '../context/SchemaContext';

/**
 * Slider component integrated with React Hook Form
 *
 * @example Basic slider
 * ```tsx
 * <RHFSlider
 *   name="volume"
 *   label="Volume"
 *   min={0}
 *   max={100}
 * />
 * ```
 *
 * @example With value display
 * ```tsx
 * <RHFSlider
 *   name="price"
 *   label="Max Price"
 *   min={0}
 *   max={1000}
 *   step={10}
 *   showValue
 *   formatValue={(v) => `$${v}`}
 * />
 * ```
 *
 * @example Range slider
 * ```tsx
 * <RHFSlider
 *   name="priceRange"
 *   label="Price Range"
 *   min={0}
 *   max={1000}
 *   valueLabelDisplay="auto"
 * />
 * ```
 */
export function RHFSlider<
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
  label,
  showValue = false,
  formatValue,
  min = 0,
  max = 100,
  step = 1,
  marks,
  valueLabelDisplay = 'off',
  ...sliderProps
}: RHFSliderProps<TFieldValues, TName>) {
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

  const displayValue = formatValue
    ? formatValue(value as number)
    : String(value ?? min);

  return (
    <FormControl fullWidth error={!!error} disabled={disabled}>
      {(label || showValue) && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          {label && (
            <FormLabel required={required}>{label}</FormLabel>
          )}
          {showValue && (
            <Typography variant="body2" color="primary" fontWeight="medium">
              {displayValue}
            </Typography>
          )}
        </Box>
      )}
      <Slider
        {...sliderProps}
        value={value ?? min}
        onChange={(_, newValue) => onChange(newValue)}
        onBlur={onBlur}
        ref={ref}
        min={min}
        max={max}
        step={step}
        marks={marks}
        disabled={disabled}
        valueLabelDisplay={valueLabelDisplay}
        valueLabelFormat={formatValue}
      />
      {(error?.message || helperText) && (
        <FormHelperText>{error?.message ?? helperText}</FormHelperText>
      )}
    </FormControl>
  );
}
