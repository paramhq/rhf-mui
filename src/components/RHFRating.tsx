import { useController, useFormContext, FieldValues, FieldPath } from 'react-hook-form';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import FormHelperText from '@mui/material/FormHelperText';
import Rating from '@mui/material/Rating';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import type { RHFRatingProps } from '../types';
import { useFieldRequired } from '../context/SchemaContext';

/**
 * Rating component integrated with React Hook Form
 *
 * @example Basic rating
 * ```tsx
 * <RHFRating
 *   name="rating"
 *   label="Rate this product"
 * />
 * ```
 *
 * @example With value display
 * ```tsx
 * <RHFRating
 *   name="satisfaction"
 *   label="Satisfaction"
 *   showValue
 *   max={10}
 *   precision={0.5}
 * />
 * ```
 *
 * @example Custom icons
 * ```tsx
 * <RHFRating
 *   name="difficulty"
 *   label="Difficulty"
 *   icon={<FireIcon />}
 *   emptyIcon={<FireOutlineIcon />}
 * />
 * ```
 */
export function RHFRating<
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
  max = 5,
  precision = 1,
  size = 'medium',
  ...ratingProps
}: RHFRatingProps<TFieldValues, TName>) {
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
    <FormControl error={!!error} disabled={disabled}>
      {label && (
        <FormLabel required={required} sx={{ mb: 0.5 }}>
          {label}
        </FormLabel>
      )}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Rating
          {...ratingProps}
          name={name}
          value={value ?? null}
          onChange={(_, newValue) => onChange(newValue)}
          onBlur={onBlur}
          ref={ref}
          max={max}
          precision={precision}
          size={size}
          disabled={disabled}
        />
        {showValue && value !== null && value !== undefined && (
          <Typography variant="body2" color="text.secondary">
            {value}/{max}
          </Typography>
        )}
      </Box>
      {(error?.message || helperText) && (
        <FormHelperText>{error?.message ?? helperText}</FormHelperText>
      )}
    </FormControl>
  );
}
