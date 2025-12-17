import { useController, useFormContext, FieldValues, FieldPath } from 'react-hook-form';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import FormHelperText from '@mui/material/FormHelperText';
import type { RHFSwitchProps } from '../types';
import { useFieldRequired } from '../context/SchemaContext';

/**
 * Switch (toggle) component integrated with React Hook Form
 *
 * @example
 * ```tsx
 * <RHFSwitch
 *   name="notifications"
 *   label="Enable notifications"
 * />
 * ```
 *
 * @example With label placement
 * ```tsx
 * <RHFSwitch
 *   name="darkMode"
 *   label="Dark mode"
 *   labelPlacement="start"
 *   color="secondary"
 * />
 * ```
 */
export function RHFSwitch<
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
  ...switchProps
}: RHFSwitchProps<TFieldValues, TName>) {
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
          <Switch
            {...switchProps}
            checked={!!value}
            onChange={(e) => onChange(e.target.checked)}
            onBlur={onBlur}
            inputRef={ref}
            color={color}
            size={size}
            required={required}
          />
        }
        label={label ?? ''}
        labelPlacement={labelPlacement}
      />
      {(error?.message || helperText) && (
        <FormHelperText>{error?.message ?? helperText}</FormHelperText>
      )}
    </FormControl>
  );
}
