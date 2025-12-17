import { useController, useFormContext, FieldValues, FieldPath } from 'react-hook-form';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import FormHelperText from '@mui/material/FormHelperText';
import type { RHFRadioGroupProps } from '../types';
import { useFieldRequired } from '../context/SchemaContext';

/**
 * Radio group component integrated with React Hook Form
 *
 * @example
 * ```tsx
 * <RHFRadioGroup
 *   name="gender"
 *   label="Gender"
 *   options={[
 *     { value: 'male', label: 'Male' },
 *     { value: 'female', label: 'Female' },
 *     { value: 'other', label: 'Other' },
 *   ]}
 * />
 * ```
 *
 * @example Horizontal layout
 * ```tsx
 * <RHFRadioGroup
 *   name="size"
 *   label="Size"
 *   row
 *   options={[
 *     { value: 's', label: 'Small' },
 *     { value: 'm', label: 'Medium' },
 *     { value: 'l', label: 'Large' },
 *   ]}
 * />
 * ```
 */
export function RHFRadioGroup<
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
  options,
  label,
  row = false,
  ...radioGroupProps
}: RHFRadioGroupProps<TFieldValues, TName>) {
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
        <FormLabel required={required} id={`${name}-label`}>
          {label}
        </FormLabel>
      )}
      <RadioGroup
        {...radioGroupProps}
        aria-labelledby={label ? `${name}-label` : undefined}
        name={name}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        row={row}
        ref={ref}
      >
        {options.map((option) => (
          <FormControlLabel
            key={String(option.value)}
            value={option.value}
            control={<Radio />}
            label={option.label}
            disabled={option.disabled}
          />
        ))}
      </RadioGroup>
      {(error?.message || helperText) && (
        <FormHelperText>{error?.message ?? helperText}</FormHelperText>
      )}
    </FormControl>
  );
}
