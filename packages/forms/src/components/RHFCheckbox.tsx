import { useController, useFormContext, FieldValues, FieldPath } from 'react-hook-form';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import FormHelperText from '@mui/material/FormHelperText';
import type { RHFCheckboxProps } from '../types';
import { useFieldRequired } from '../context/SchemaContext';

/**
 * Single checkbox component integrated with React Hook Form
 *
 * @example
 * ```tsx
 * <RHFCheckbox
 *   name="acceptTerms"
 *   label="I accept the terms and conditions"
 * />
 * ```
 *
 * @example With label placement
 * ```tsx
 * <RHFCheckbox
 *   name="newsletter"
 *   label="Subscribe to newsletter"
 *   labelPlacement="start"
 * />
 * ```
 */
export function RHFCheckbox<
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
  labelPlacement = 'end',
  color = 'primary',
  size = 'medium',
  ...checkboxProps
}: RHFCheckboxProps<TFieldValues, TName>) {
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
      <FormControlLabel
        control={
          <Checkbox
            {...checkboxProps}
            checked={!!value}
            onChange={(e) => onChange(e.target.checked)}
            onBlur={onBlur}
            inputRef={ref}
            color={color}
            size={size}
            required={required}
          />
        }
        label={
          <>
            {label}
            {required && <span style={{ color: 'red', marginLeft: 2 }}>*</span>}
          </>
        }
        labelPlacement={labelPlacement}
      />
      {(error?.message || helperText) && (
        <FormHelperText>{error?.message ?? helperText}</FormHelperText>
      )}
    </FormControl>
  );
}
