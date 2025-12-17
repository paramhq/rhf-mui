import { forwardRef, type ElementType } from 'react';
import { useController, useFormContext, FieldValues, FieldPath } from 'react-hook-form';
import TextField from '@mui/material/TextField';
import type { InputBaseComponentProps } from '@mui/material/InputBase';
import { IMaskInput } from 'react-imask';
import type { RHFMaskedFieldProps } from '../types';
import { useFieldRequired, useFieldMeta } from '../context/SchemaContext';

/**
 * Props for the internal masked input adapter
 */
interface IMaskAdapterProps {
  onChange: (event: { target: { name: string; value: string } }) => void;
  name: string;
  mask: string | Record<string, unknown>;
  definitions?: Record<string, RegExp>;
  overwrite?: boolean;
  lazy?: boolean;
  placeholderChar?: string;
  unmask?: boolean | 'typed';
  onAccept?: (value: string, maskRef: unknown) => void;
  value?: string;
}

/**
 * Adapter component that bridges IMaskInput with MUI TextField
 *
 * Note: react-imask has complex discriminated union types for the mask prop
 * that are incompatible with our simplified interface. We use type assertions
 * at the integration point to maintain type safety in consumer code while
 * allowing the underlying IMaskInput to work correctly at runtime.
 */
const IMaskAdapter = forwardRef<HTMLInputElement, IMaskAdapterProps>(
  function IMaskAdapter(props, ref) {
    const {
      onChange,
      name,
      mask,
      definitions,
      overwrite,
      lazy,
      placeholderChar,
      unmask,
      onAccept,
      value,
      ...rest
    } = props;

    // IMaskInput props - type assertion needed due to complex discriminated unions
    // in react-imask's type definitions that can't be easily represented in our API
    const imaskProps = {
      ...rest,
      name,
      value: value ?? '',
      mask,
      definitions,
      overwrite,
      lazy,
      placeholderChar,
      unmask,
      inputRef: ref,
      onAccept: (acceptedValue: string, maskRef: unknown) => {
        onChange({ target: { name, value: String(acceptedValue) } });
        onAccept?.(String(acceptedValue), maskRef);
      },
    } as Parameters<typeof IMaskInput>[0];

    return <IMaskInput {...imaskProps} />;
  }
);

// Bridge type for MUI's inputComponent - required due to type incompatibility
// between react-imask and MUI's InputBaseComponentProps
const MaskedInputComponent: ElementType<InputBaseComponentProps> =
  IMaskAdapter as unknown as ElementType<InputBaseComponentProps>;

/**
 * Masked text field component integrated with React Hook Form
 *
 * Uses react-imask for input masking. Supports various mask patterns:
 * - `0` - any digit
 * - `a` - any letter
 * - `*` - any character
 * - Custom definitions via `definitions` prop
 *
 * @example Phone number
 * ```tsx
 * <RHFMaskedField
 *   name="phone"
 *   label="Phone Number"
 *   mask="(000) 000-0000"
 *   placeholder="(___) ___-____"
 * />
 * ```
 *
 * @example Credit card
 * ```tsx
 * <RHFMaskedField
 *   name="creditCard"
 *   label="Credit Card"
 *   mask="0000 0000 0000 0000"
 *   placeholder="____ ____ ____ ____"
 * />
 * ```
 *
 * @example SSN with custom placeholder
 * ```tsx
 * <RHFMaskedField
 *   name="ssn"
 *   label="Social Security Number"
 *   mask="000-00-0000"
 *   placeholderChar="_"
 *   lazy={false}
 * />
 * ```
 *
 * @example Custom pattern (uppercase letters only)
 * ```tsx
 * <RHFMaskedField
 *   name="code"
 *   label="Code"
 *   mask="AAA-000"
 *   definitions={{ A: /[A-Z]/ }}
 * />
 * ```
 */
export function RHFMaskedField<
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
  mask,
  definitions,
  overwrite,
  lazy = true,
  placeholderChar = '_',
  unmask = true,
  onAccept,
  ...textFieldProps
}: RHFMaskedFieldProps<TFieldValues, TName>) {
  const formContext = useFormContext<TFieldValues>();
  const control = controlProp ?? formContext?.control;

  const schemaRequired = useFieldRequired(name);
  const fieldMeta = useFieldMeta(name);
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
    <TextField
      {...textFieldProps}
      name={name}
      value={value ?? ''}
      onChange={onChange}
      onBlur={onBlur}
      inputRef={ref}
      error={!!error}
      helperText={error?.message ?? helperText}
      required={required}
      disabled={disabled}
      fullWidth={fullWidth}
      slotProps={{
        ...textFieldProps.slotProps,
        input: {
          ...textFieldProps.slotProps?.input,
          inputComponent: MaskedInputComponent,
          inputProps: {
            mask,
            definitions,
            overwrite,
            lazy,
            placeholderChar,
            unmask,
            onAccept,
          },
        },
        htmlInput: {
          ...textFieldProps.slotProps?.htmlInput,
          maxLength: fieldMeta.maxLength,
        },
      }}
    />
  );
}

export default RHFMaskedField;
