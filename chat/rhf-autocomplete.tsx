import * as React from 'react';
import { useController, type FieldPath, type FieldValues, type UseControllerProps } from 'react-hook-form';
import Autocomplete from '@mui/material/Autocomplete';
import TextField, { type TextFieldProps } from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';
import Chip from '@mui/material/Chip';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

// =============================================================================
// Types
// =============================================================================

export interface AutocompleteOption {
  value: string | number;
  label: string;
  disabled?: boolean;
  /** Any additional data to display or use */
  [key: string]: unknown;
}

interface BaseAutocompleteProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> extends Omit<UseControllerProps<TFieldValues, TName>, 'control'> {
  control: UseControllerProps<TFieldValues, TName>['control'];
  label?: string;
  placeholder?: string;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  size?: 'small' | 'medium';
  textFieldProps?: Omit<TextFieldProps, 'label' | 'placeholder' | 'error' | 'helperText' | 'required' | 'disabled' | 'size'>;
}

// =============================================================================
// 1. Single Select Autocomplete
// =============================================================================

export interface RHFAutocompleteProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TOption extends AutocompleteOption = AutocompleteOption
> extends BaseAutocompleteProps<TFieldValues, TName> {
  options: TOption[];
  loading?: boolean;
  /** Render custom option content */
  renderOptionContent?: (option: TOption) => React.ReactNode;
  /** Group options by this key */
  groupBy?: (option: TOption) => string;
  /** Allow clearing selection */
  clearable?: boolean;
  /** Show "No options" when empty */
  noOptionsText?: string;
}

export function RHFAutocomplete<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TOption extends AutocompleteOption = AutocompleteOption
>({
  name,
  control,
  rules,
  defaultValue,
  shouldUnregister,
  options,
  loading = false,
  label,
  placeholder,
  helperText,
  required,
  disabled,
  fullWidth = true,
  size,
  textFieldProps,
  renderOptionContent,
  groupBy,
  clearable = true,
  noOptionsText = 'No options',
}: RHFAutocompleteProps<TFieldValues, TName, TOption>) {
  const {
    field: { value, onChange, onBlur, ref },
    fieldState: { error },
  } = useController({ name, control, rules, defaultValue, shouldUnregister });

  // Find selected option from value
  const selectedOption = React.useMemo(
    () => options.find((opt) => opt.value === value) ?? null,
    [options, value]
  );

  const handleChange = (_event: React.SyntheticEvent, newValue: TOption | null) => {
    onChange(newValue?.value ?? null);
  };

  return (
    <Autocomplete
      value={selectedOption}
      onChange={handleChange}
      onBlur={onBlur}
      options={options}
      loading={loading}
      disabled={disabled}
      disableClearable={!clearable}
      fullWidth={fullWidth}
      size={size}
      getOptionLabel={(option) => option.label}
      getOptionDisabled={(option) => !!option.disabled}
      isOptionEqualToValue={(option, val) => option.value === val.value}
      groupBy={groupBy}
      noOptionsText={noOptionsText}
      renderOption={(props, option) => (
        <Box component="li" {...props} key={option.value}>
          {renderOptionContent ? renderOptionContent(option) : option.label}
        </Box>
      )}
      renderInput={(params) => (
        <TextField
          {...params}
          {...textFieldProps}
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

// =============================================================================
// 2. Multiple Select Autocomplete
// =============================================================================

export interface RHFMultiAutocompleteProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TOption extends AutocompleteOption = AutocompleteOption
> extends Omit<RHFAutocompleteProps<TFieldValues, TName, TOption>, 'clearable'> {
  /** Maximum selections allowed */
  maxSelections?: number;
  /** Render chips with custom content */
  renderChip?: (option: TOption, onDelete: () => void) => React.ReactNode;
  /** Limit visible tags, show "+N more" */
  limitTags?: number;
}

export function RHFMultiAutocomplete<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TOption extends AutocompleteOption = AutocompleteOption
>({
  name,
  control,
  rules,
  defaultValue,
  shouldUnregister,
  options,
  loading = false,
  label,
  placeholder,
  helperText,
  required,
  disabled,
  fullWidth = true,
  size,
  textFieldProps,
  renderOptionContent,
  groupBy,
  noOptionsText = 'No options',
  maxSelections,
  renderChip,
  limitTags = -1,
}: RHFMultiAutocompleteProps<TFieldValues, TName, TOption>) {
  const {
    field: { value, onChange, onBlur, ref },
    fieldState: { error },
  } = useController({ name, control, rules, defaultValue, shouldUnregister });

  // Value is array of option values
  const selectedValues: (string | number)[] = Array.isArray(value) ? value : [];

  // Find selected options from values
  const selectedOptions = React.useMemo(
    () => selectedValues.map((v) => options.find((opt) => opt.value === v)).filter((opt): opt is TOption => !!opt),
    [options, selectedValues]
  );

  const handleChange = (_event: React.SyntheticEvent, newValue: TOption[]) => {
    // Enforce max selections
    if (maxSelections && newValue.length > maxSelections) {
      return;
    }
    onChange(newValue.map((opt) => opt.value));
  };

  // Disable options if max reached
  const getOptionDisabled = (option: TOption) => {
    if (option.disabled) return true;
    if (maxSelections && selectedValues.length >= maxSelections) {
      return !selectedValues.includes(option.value);
    }
    return false;
  };

  return (
    <Autocomplete
      multiple
      value={selectedOptions}
      onChange={handleChange}
      onBlur={onBlur}
      options={options}
      loading={loading}
      disabled={disabled}
      fullWidth={fullWidth}
      size={size}
      limitTags={limitTags}
      getOptionLabel={(option) => option.label}
      getOptionDisabled={getOptionDisabled}
      isOptionEqualToValue={(option, val) => option.value === val.value}
      groupBy={groupBy}
      noOptionsText={noOptionsText}
      renderOption={(props, option) => (
        <Box component="li" {...props} key={option.value}>
          {renderOptionContent ? renderOptionContent(option) : option.label}
        </Box>
      )}
      renderTags={(tagValue, getTagProps) =>
        tagValue.map((option, index) => {
          const { key, ...tagProps } = getTagProps({ index });
          if (renderChip) {
            return <React.Fragment key={key}>{renderChip(option, tagProps.onDelete)}</React.Fragment>;
          }
          return <Chip key={key} label={option.label} size="small" {...tagProps} />;
        })
      }
      renderInput={(params) => (
        <TextField
          {...params}
          {...textFieldProps}
          label={label}
          placeholder={selectedOptions.length === 0 ? placeholder : undefined}
          required={required}
          error={!!error}
          helperText={error?.message ?? helperText ?? (maxSelections ? `Max ${maxSelections} selections` : undefined)}
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

// =============================================================================
// 3. Async Autocomplete (Server-side search)
// =============================================================================

export interface RHFAsyncAutocompleteProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TOption extends AutocompleteOption = AutocompleteOption
> extends Omit<BaseAutocompleteProps<TFieldValues, TName>, never> {
  /** Fetch options based on search term */
  fetchOptions: (searchTerm: string) => Promise<TOption[]>;
  /** Debounce delay in ms (default: 300) */
  debounceMs?: number;
  /** Minimum characters to trigger search (default: 2) */
  minSearchLength?: number;
  /** Render custom option content */
  renderOptionContent?: (option: TOption) => React.ReactNode;
  /** Text shown while loading */
  loadingText?: string;
  /** Text shown when no results */
  noOptionsText?: string;
  /** Cache results for this key to avoid refetching */
  cacheKey?: string;
  /** Initial option when value exists but options not loaded */
  initialOption?: TOption;
}

// Simple in-memory cache
const optionsCache = new Map<string, { data: AutocompleteOption[]; timestamp: number }>();
const CACHE_TTL = 60000; // 1 minute

export function RHFAsyncAutocomplete<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TOption extends AutocompleteOption = AutocompleteOption
>({
  name,
  control,
  rules,
  defaultValue,
  shouldUnregister,
  fetchOptions,
  debounceMs = 300,
  minSearchLength = 2,
  label,
  placeholder,
  helperText,
  required,
  disabled,
  fullWidth = true,
  size,
  textFieldProps,
  renderOptionContent,
  loadingText = 'Loading...',
  noOptionsText = 'No results found',
  cacheKey,
  initialOption,
}: RHFAsyncAutocompleteProps<TFieldValues, TName, TOption>) {
  const {
    field: { value, onChange, onBlur, ref },
    fieldState: { error },
  } = useController({ name, control, rules, defaultValue, shouldUnregister });

  const [open, setOpen] = React.useState(false);
  const [options, setOptions] = React.useState<TOption[]>(initialOption ? [initialOption] : []);
  const [loading, setLoading] = React.useState(false);
  const [inputValue, setInputValue] = React.useState('');

  const debounceRef = React.useRef<ReturnType<typeof setTimeout>>();
  const abortControllerRef = React.useRef<AbortController>();

  // Find selected option
  const selectedOption = React.useMemo(() => {
    if (!value) return null;
    return options.find((opt) => opt.value === value) ?? initialOption ?? null;
  }, [options, value, initialOption]);

  // Fetch with debounce
  React.useEffect(() => {
    // Clear previous debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Abort previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Don't search if closed or below min length
    if (!open || inputValue.length < minSearchLength) {
      if (inputValue.length < minSearchLength && inputValue.length > 0) {
        setOptions([]);
      }
      return;
    }

    // Check cache
    if (cacheKey) {
      const cached = optionsCache.get(`${cacheKey}:${inputValue}`);
      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        setOptions(cached.data as TOption[]);
        return;
      }
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      abortControllerRef.current = new AbortController();

      try {
        const results = await fetchOptions(inputValue);
        setOptions(results);

        // Cache results
        if (cacheKey) {
          optionsCache.set(`${cacheKey}:${inputValue}`, {
            data: results,
            timestamp: Date.now(),
          });
        }
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.error('Autocomplete fetch error:', err);
          setOptions([]);
        }
      } finally {
        setLoading(false);
      }
    }, debounceMs);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [inputValue, open, fetchOptions, debounceMs, minSearchLength, cacheKey]);

  const handleChange = (_event: React.SyntheticEvent, newValue: TOption | null) => {
    onChange(newValue?.value ?? null);
  };

  const getNoOptionsText = () => {
    if (inputValue.length < minSearchLength) {
      return `Type at least ${minSearchLength} characters`;
    }
    return noOptionsText;
  };

  return (
    <Autocomplete
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      value={selectedOption}
      onChange={handleChange}
      onBlur={onBlur}
      inputValue={inputValue}
      onInputChange={(_e, newInputValue) => setInputValue(newInputValue)}
      options={options}
      loading={loading}
      disabled={disabled}
      fullWidth={fullWidth}
      size={size}
      filterOptions={(x) => x} // Disable client-side filtering
      getOptionLabel={(option) => option.label}
      isOptionEqualToValue={(option, val) => option.value === val.value}
      loadingText={loadingText}
      noOptionsText={getNoOptionsText()}
      renderOption={(props, option) => (
        <Box component="li" {...props} key={option.value}>
          {renderOptionContent ? renderOptionContent(option) : option.label}
        </Box>
      )}
      renderInput={(params) => (
        <TextField
          {...params}
          {...textFieldProps}
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

// =============================================================================
// 4. Creatable Autocomplete (FreeSolo)
// =============================================================================

export interface RHFCreatableAutocompleteProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TOption extends AutocompleteOption = AutocompleteOption
> extends Omit<RHFAutocompleteProps<TFieldValues, TName, TOption>, 'clearable'> {
  /** Text to show for "Add new" option */
  addNewText?: string;
  /** Called when user creates new option, return the value to store */
  onCreate?: (inputValue: string) => string | number;
}

export function RHFCreatableAutocomplete<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TOption extends AutocompleteOption = AutocompleteOption
>({
  name,
  control,
  rules,
  defaultValue,
  shouldUnregister,
  options,
  loading = false,
  label,
  placeholder,
  helperText,
  required,
  disabled,
  fullWidth = true,
  size,
  textFieldProps,
  renderOptionContent,
  noOptionsText = 'No options',
  addNewText = 'Add',
  onCreate,
}: RHFCreatableAutocompleteProps<TFieldValues, TName, TOption>) {
  const {
    field: { value, onChange, onBlur, ref },
    fieldState: { error },
  } = useController({ name, control, rules, defaultValue, shouldUnregister });

  const selectedOption = React.useMemo(
    () => options.find((opt) => opt.value === value) ?? null,
    [options, value]
  );

  const handleChange = (_event: React.SyntheticEvent, newValue: string | TOption | null) => {
    if (typeof newValue === 'string') {
      // User typed and pressed enter
      const createdValue = onCreate ? onCreate(newValue) : newValue;
      onChange(createdValue);
    } else if (newValue && 'inputValue' in newValue) {
      // User selected "Add <value>" option
      const createdValue = onCreate ? onCreate((newValue as any).inputValue) : (newValue as any).inputValue;
      onChange(createdValue);
    } else {
      onChange(newValue?.value ?? null);
    }
  };

  return (
    <Autocomplete
      freeSolo
      selectOnFocus
      clearOnBlur
      handleHomeEndKeys
      value={selectedOption}
      onChange={handleChange}
      onBlur={onBlur}
      options={options}
      loading={loading}
      disabled={disabled}
      fullWidth={fullWidth}
      size={size}
      getOptionLabel={(option) => {
        if (typeof option === 'string') return option;
        if ('inputValue' in option) return (option as any).inputValue;
        return option.label;
      }}
      isOptionEqualToValue={(option, val) => {
        if (typeof option === 'string' || typeof val === 'string') return false;
        return option.value === val.value;
      }}
      filterOptions={(opts, params) => {
        const filtered = opts.filter((opt) =>
          opt.label.toLowerCase().includes(params.inputValue.toLowerCase())
        );

        const { inputValue } = params;
        const isExisting = opts.some((opt) => opt.label.toLowerCase() === inputValue.toLowerCase());

        if (inputValue !== '' && !isExisting) {
          filtered.push({
            inputValue,
            label: `${addNewText} "${inputValue}"`,
            value: inputValue,
          } as TOption);
        }

        return filtered;
      }}
      noOptionsText={noOptionsText}
      renderOption={(props, option) => {
        const { key, ...rest } = props;
        return (
          <Box component="li" key={key ?? option.value} {...rest}>
            {renderOptionContent && !('inputValue' in option)
              ? renderOptionContent(option)
              : option.label}
          </Box>
        );
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          {...textFieldProps}
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
