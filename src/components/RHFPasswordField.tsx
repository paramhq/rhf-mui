import React, { useState } from 'react';
import { useController, useFormContext, FieldValues, FieldPath } from 'react-hook-form';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import type { RHFPasswordFieldProps } from '../types';
import { useFieldRequired, useFieldMeta } from '../context/SchemaContext';

/**
 * Password field component with visibility toggle
 *
 * @example
 * ```tsx
 * <RHFPasswordField
 *   name="password"
 *   label="Password"
 *   showToggle
 * />
 * ```
 */
export function RHFPasswordField<
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
  showToggle = true,
  ...textFieldProps
}: RHFPasswordFieldProps<TFieldValues, TName>) {
  const [showPassword, setShowPassword] = useState(false);

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

  const handleToggleVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleMouseDown = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  return (
    <TextField
      {...textFieldProps}
      type={showPassword ? 'text' : 'password'}
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
        htmlInput: {
          ...textFieldProps.slotProps?.htmlInput,
          maxLength: fieldMeta.maxLength,
        },
        input: {
          ...textFieldProps.slotProps?.input,
          endAdornment: showToggle ? (
            <InputAdornment position="end">
              <IconButton
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                onClick={handleToggleVisibility}
                onMouseDown={handleMouseDown}
                edge="end"
                disabled={disabled}
                size="small"
              >
                {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
              </IconButton>
            </InputAdornment>
          ) : undefined,
        },
      }}
    />
  );
}
