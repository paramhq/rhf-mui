import { useMemo } from 'react';
import { useController, useFormContext, FieldValues, FieldPath } from 'react-hook-form';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';
import type { RHFAutocompleteProps, SelectOption } from '../types';
import { useFieldRequired } from '../context/SchemaContext';

/**
 * Single-select autocomplete component integrated with React Hook Form
 *
 * @example
 * ```tsx
 * <RHFAutocomplete
 *   name="country"
 *   label="Country"
 *   options={[
 *     { value: 'us', label: 'United States' },
 *     { value: 'uk', label: 'United Kingdom' },
 *     { value: 'ca', label: 'Canada' },
 *   ]}
 * />
 * ```
 *
 * @example With custom rendering
 * ```tsx
 * <RHFAutocomplete
 *   name="user"
 *   label="User"
 *   options={users}
 *   renderOptionContent={(option) => (
 *     <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
 *       <Avatar src={option.avatar} />
 *       {option.label}
 *     </Box>
 *   )}
 * />
 * ```
 *
 * @example With groups
 * ```tsx
 * <RHFAutocomplete
 *   name="city"
 *   label="City"
 *   options={cities}
 *   groupBy={(option) => option.country}
 * />
 * ```
 */
export function RHFAutocomplete<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TOption extends SelectOption = SelectOption
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
  options,
  label,
  placeholder,
  size = 'medium',
  renderOptionContent,
  groupBy,
  clearable = true,
  loading = false,
  loadingText = 'Loading...',
  noOptionsText = 'No options',
}: RHFAutocompleteProps<TFieldValues, TName, TOption>) {
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

  // Find the selected option by value
  const selectedOption = useMemo(() => {
    if (value === null || value === undefined || value === '') return null;
    return options.find((opt) => opt.value === value) ?? null;
  }, [value, options]);

  return (
    <Autocomplete
      options={options}
      value={selectedOption}
      onChange={(_, newValue) => {
        onChange(newValue?.value ?? null);
      }}
      onBlur={onBlur}
      getOptionLabel={(option) => option.label}
      isOptionEqualToValue={(option, val) => option.value === val.value}
      getOptionDisabled={(option) => !!option.disabled}
      groupBy={groupBy}
      disableClearable={!clearable}
      disabled={disabled}
      loading={loading}
      loadingText={loadingText}
      noOptionsText={noOptionsText}
      fullWidth={fullWidth}
      size={size}
      renderOption={
        renderOptionContent
          ? (props, option) => {
              const { key, ...otherProps } = props;
              return (
                <li key={key} {...otherProps}>
                  {renderOptionContent(option as TOption)}
                </li>
              );
            }
          : undefined
      }
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          placeholder={placeholder}
          required={required}
          error={!!error}
          helperText={error?.message ?? helperText}
          inputRef={ref}
          slotProps={{
            input: {
              ...params.InputProps,
              endAdornment: (
                <>
                  {loading && <CircularProgress color="inherit" size={20} />}
                  {params.InputProps.endAdornment}
                </>
              ),
            },
          }}
        />
      )}
    />
  );
}
