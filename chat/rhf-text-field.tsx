import { useController, type FieldPath, type FieldValues, type UseControllerProps } from 'react-hook-form';
import TextField, { type TextFieldProps } from '@mui/material/TextField';

// =============================================================================
// Types
// =============================================================================

export interface RHFTextFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> extends Omit<TextFieldProps, 'name' | 'value' | 'onChange' | 'onBlur' | 'error' | 'defaultValue'>,
    Omit<UseControllerProps<TFieldValues, TName>, 'control'> {
  control: UseControllerProps<TFieldValues, TName>['control'];
  helperText?: string;
  transform?: {
    input?: (value: unknown) => unknown;
    output?: (value: unknown) => unknown;
  };
}

// =============================================================================
// Component
// =============================================================================

export function RHFTextField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  name,
  control,
  rules,
  defaultValue,
  shouldUnregister,
  helperText,
  transform,
  ...textFieldProps
}: RHFTextFieldProps<TFieldValues, TName>) {
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

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = transform?.output
      ? transform.output(event.target.value)
      : event.target.value;
    onChange(newValue);
  };

  const displayValue = transform?.input ? transform.input(value) : (value ?? '');

  return (
    <TextField
      {...textFieldProps}
      name={name}
      value={displayValue}
      onChange={handleChange}
      onBlur={onBlur}
      inputRef={ref}
      error={!!error}
      helperText={error?.message ?? helperText}
    />
  );
}

// =============================================================================
// Variants
// =============================================================================

export function RHFNumberField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>(props: RHFTextFieldProps<TFieldValues, TName>) {
  return (
    <RHFTextField
      {...props}
      type="number"
      slotProps={{
        htmlInput: { inputMode: 'numeric' },
        ...props.slotProps,
      }}
      transform={{
        input: (val) => (val == null ? '' : String(val)),
        output: (val) => {
          const parsed = parseFloat(val as string);
          return isNaN(parsed) ? null : parsed;
        },
      }}
    />
  );
}
