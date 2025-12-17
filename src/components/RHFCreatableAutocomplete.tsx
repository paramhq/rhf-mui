import { useMemo, useState } from 'react';
import { useController, useFormContext, FieldValues, FieldPath } from 'react-hook-form';
import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';
import type { RHFCreatableAutocompleteProps, SelectOption } from '../types';
import { useFieldRequired } from '../context/SchemaContext';

// Option type with optional inputValue for creatable options
type CreatableOption = SelectOption & { inputValue?: string };

// Create filter with "Add" option support
const filter = createFilterOptions<CreatableOption>();

/**
 * Creatable autocomplete component (FreeSolo) integrated with React Hook Form
 * Allows selecting from options or creating new values
 *
 * @example
 * ```tsx
 * <RHFCreatableAutocomplete
 *   name="loanPurpose"
 *   label="Loan Purpose"
 *   options={loanPurposes}
 * />
 * ```
 *
 * @example With onCreate callback
 * ```tsx
 * <RHFCreatableAutocomplete
 *   name="category"
 *   label="Category"
 *   options={categories}
 *   onCreate={async (inputValue) => {
 *     const newCategory = await api.createCategory(inputValue);
 *     return { value: newCategory.id, label: newCategory.name };
 *   }}
 * />
 * ```
 *
 * @example Custom "Add" text
 * ```tsx
 * <RHFCreatableAutocomplete
 *   name="tag"
 *   label="Tag"
 *   options={tags}
 *   addNewText="Create new tag"
 * />
 * ```
 */
export function RHFCreatableAutocomplete<
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
  onCreate,
  addNewText = 'Add',
}: RHFCreatableAutocompleteProps<TFieldValues, TName, TOption>) {
  const formContext = useFormContext<TFieldValues>();
  const control = controlProp ?? formContext?.control;

  const schemaRequired = useFieldRequired(name);
  const required = requiredProp ?? schemaRequired;

  const [isCreating, setIsCreating] = useState(false);

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

  // Cast options to creatable option type
  const creatableOptions: CreatableOption[] = options as CreatableOption[];

  // Find selected option or create one from string value
  const selectedOption = useMemo((): CreatableOption | null => {
    if (value === null || value === undefined || value === '') return null;

    // First try to find in options
    const found = creatableOptions.find((opt) => opt.value === value);
    if (found) return found;

    // If value is a string (custom typed value), create a pseudo-option
    if (typeof value === 'string') {
      return { value, label: value };
    }

    return null;
  }, [value, creatableOptions]);

  const handleChange = async (
    newValue: CreatableOption | string | null
  ) => {
    if (newValue === null) {
      onChange(null);
      return;
    }

    // Handle string input (freeSolo typing)
    if (typeof newValue === 'string') {
      if (onCreate) {
        setIsCreating(true);
        try {
          const created = await onCreate(newValue);
          onChange(created.value);
        } catch (err) {
          console.error('Failed to create option:', err);
          // Fall back to using the string value
          onChange(newValue);
        } finally {
          setIsCreating(false);
        }
      } else {
        onChange(newValue);
      }
      return;
    }

    // Handle "Add" option selection
    if (newValue.inputValue) {
      const inputValue = newValue.inputValue;
      if (onCreate) {
        setIsCreating(true);
        try {
          const created = await onCreate(inputValue);
          onChange(created.value);
        } catch (err) {
          console.error('Failed to create option:', err);
          onChange(inputValue);
        } finally {
          setIsCreating(false);
        }
      } else {
        onChange(inputValue);
      }
      return;
    }

    // Handle normal option selection
    onChange(newValue.value);
  };

  return (
    <Autocomplete<CreatableOption, false, boolean, true>
      freeSolo
      selectOnFocus
      clearOnBlur
      handleHomeEndKeys
      options={creatableOptions}
      value={selectedOption}
      onChange={(_, newValue) => handleChange(newValue as CreatableOption | string | null)}
      onBlur={onBlur}
      getOptionLabel={(option) => {
        if (typeof option === 'string') return option;
        if (option.inputValue) return option.inputValue;
        return option.label;
      }}
      isOptionEqualToValue={(option, val) => option.value === val.value}
      getOptionDisabled={(option) => !!option.disabled}
      groupBy={groupBy as ((option: CreatableOption) => string) | undefined}
      disableClearable={!clearable}
      disabled={disabled || isCreating}
      loading={loading || isCreating}
      loadingText={isCreating ? 'Creating...' : loadingText}
      noOptionsText={noOptionsText}
      fullWidth={fullWidth}
      size={size}
      filterOptions={(opts, params) => {
        const filtered = filter(opts, params);

        const { inputValue } = params;

        // Suggest creating a new value if it doesn't exist
        const isExisting = opts.some(
          (opt) => opt.label.toLowerCase() === inputValue.toLowerCase()
        );

        if (inputValue !== '' && !isExisting) {
          filtered.push({
            inputValue,
            value: inputValue,
            label: `${addNewText} "${inputValue}"`,
          });
        }

        return filtered;
      }}
      renderOption={(props, option) => {
        const { key, ...otherProps } = props;
        const isAddOption = !!option.inputValue;

        if (isAddOption) {
          return (
            <li key={key} {...otherProps} style={{ fontStyle: 'italic' }}>
              {option.label}
            </li>
          );
        }

        if (renderOptionContent) {
          return (
            <li key={key} {...otherProps}>
              {renderOptionContent(option as TOption)}
            </li>
          );
        }

        return (
          <li key={key} {...otherProps}>
            {option.label}
          </li>
        );
      }}
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
                  {(loading || isCreating) && <CircularProgress color="inherit" size={20} />}
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
