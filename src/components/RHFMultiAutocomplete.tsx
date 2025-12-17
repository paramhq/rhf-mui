import { Fragment, useMemo, SyntheticEvent } from 'react';
import { useController, useFormContext, FieldValues, FieldPath } from 'react-hook-form';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import type { RHFMultiAutocompleteProps, SelectOption } from '../types';
import { useFieldRequired } from '../context/SchemaContext';

/**
 * Multi-select autocomplete component integrated with React Hook Form
 * Stores an array of values
 *
 * @example
 * ```tsx
 * <RHFMultiAutocomplete
 *   name="skills"
 *   label="Skills"
 *   options={[
 *     { value: 'react', label: 'React' },
 *     { value: 'vue', label: 'Vue' },
 *     { value: 'angular', label: 'Angular' },
 *   ]}
 * />
 * ```
 *
 * @example With max selections
 * ```tsx
 * <RHFMultiAutocomplete
 *   name="tags"
 *   label="Tags (max 5)"
 *   options={tags}
 *   maxSelections={5}
 * />
 * ```
 */
export function RHFMultiAutocomplete<
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
  maxSelections,
  limitTags = 3,
  renderChip,
}: RHFMultiAutocompleteProps<TFieldValues, TName, TOption>) {
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

  // Convert array of values to array of options
  const selectedOptions = useMemo(() => {
    if (!Array.isArray(value)) return [];
    return value
      .map((v: TOption['value']) => options.find((opt) => opt.value === v))
      .filter((opt: TOption | undefined): opt is TOption => opt !== undefined);
  }, [value, options]);

  const isMaxReached = maxSelections ? selectedOptions.length >= maxSelections : false;

  return (
    <Autocomplete
      multiple
      options={options}
      value={selectedOptions}
      onChange={(_, newValue) => {
        const values = newValue.map((opt) => opt.value);
        onChange(values);
      }}
      onBlur={onBlur}
      getOptionLabel={(option) => option.label}
      isOptionEqualToValue={(option, val) => option.value === val.value}
      getOptionDisabled={(option: TOption) => {
        if (option.disabled) return true;
        // Disable options if max reached and not already selected
        if (isMaxReached && !selectedOptions.some((s: TOption) => s.value === option.value)) {
          return true;
        }
        return false;
      }}
      groupBy={groupBy}
      disableClearable={!clearable}
      disabled={disabled}
      loading={loading}
      loadingText={loadingText}
      noOptionsText={noOptionsText}
      fullWidth={fullWidth}
      size={size}
      limitTags={limitTags}
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
      renderTags={(tagValue, getTagProps) =>
        tagValue.map((option, index) => {
          const { key, ...tagProps } = getTagProps({ index });
          if (renderChip) {
            return (
              <Fragment key={key}>
                {renderChip(option as TOption, () => tagProps.onDelete({} as SyntheticEvent))}
              </Fragment>
            );
          }
          return (
            <Chip
              key={key}
              label={option.label}
              size={size}
              {...tagProps}
            />
          );
        })
      }
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          placeholder={selectedOptions.length === 0 ? placeholder : undefined}
          required={required}
          error={!!error}
          helperText={
            error?.message ??
            (maxSelections
              ? `${selectedOptions.length}/${maxSelections} selected${helperText ? ` - ${helperText}` : ''}`
              : helperText)
          }
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
