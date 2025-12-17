import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useController, useFormContext, FieldValues, FieldPath } from 'react-hook-form';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';
import type { RHFAsyncAutocompleteProps, SelectOption } from '../types';
import { useFieldRequired } from '../context/SchemaContext';

// Simple cache implementation
const cache = new Map<string, { data: SelectOption[]; timestamp: number }>();
const CACHE_TTL = 60000; // 60 seconds

function getCached<T extends SelectOption>(key: string): T[] | null {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.timestamp < CACHE_TTL) {
    return entry.data as T[];
  }
  cache.delete(key);
  return null;
}

function setCache<T extends SelectOption>(key: string, data: T[]): void {
  cache.set(key, { data, timestamp: Date.now() });
}

/**
 * Async autocomplete component with server-side search
 *
 * @example
 * ```tsx
 * <RHFAsyncAutocomplete
 *   name="memberId"
 *   label="Member"
 *   fetchOptions={async (search, signal) => {
 *     const response = await fetch(`/api/members?search=${search}`, { signal });
 *     return response.json();
 *   }}
 * />
 * ```
 *
 * @example With initial value for edit forms
 * ```tsx
 * <RHFAsyncAutocomplete
 *   name="memberId"
 *   label="Member"
 *   fetchOptions={searchMembers}
 *   initialOption={{ value: member.id, label: member.name }}
 * />
 * ```
 *
 * @example With caching
 * ```tsx
 * <RHFAsyncAutocomplete
 *   name="product"
 *   label="Product"
 *   fetchOptions={searchProducts}
 *   cacheKey="products"
 *   debounceMs={500}
 *   minSearchLength={3}
 * />
 * ```
 */
export function RHFAsyncAutocomplete<
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
  label,
  placeholder,
  size = 'medium',
  renderOptionContent,
  groupBy,
  clearable = true,
  loadingText = 'Loading...',
  noOptionsText = 'No options',
  fetchOptions,
  debounceMs = 300,
  minSearchLength = 2,
  cacheKey,
  initialOption = null,
}: RHFAsyncAutocompleteProps<TFieldValues, TName, TOption>) {
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

  const [inputValue, setInputValue] = useState('');
  const [options, setOptions] = useState<TOption[]>(initialOption ? [initialOption] : []);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const abortControllerRef = useRef<AbortController | null>(null);
  const debounceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Find selected option
  const selectedOption = useMemo(() => {
    if (value === null || value === undefined || value === '') return null;
    const found = options.find((opt) => opt.value === value);
    if (found) return found;
    // Return initial option if it matches the value
    if (initialOption && initialOption.value === value) return initialOption;
    return null;
  }, [value, options, initialOption]);

  // Fetch options with debouncing
  const doFetch = useCallback(
    async (search: string) => {
      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Check cache first
      if (cacheKey) {
        const fullCacheKey = `${cacheKey}:${search}`;
        const cached = getCached<TOption>(fullCacheKey);
        if (cached) {
          setOptions(cached);
          setLoading(false);
          return;
        }
      }

      // Create new abort controller
      abortControllerRef.current = new AbortController();

      try {
        setLoading(true);
        const results = await fetchOptions(search, abortControllerRef.current.signal);

        // Cache results
        if (cacheKey) {
          setCache(`${cacheKey}:${search}`, results);
        }

        setOptions(results as TOption[]);
      } catch (err) {
        if (err instanceof Error && err.name !== 'AbortError') {
          console.error('Autocomplete fetch error:', err);
          setOptions([]);
        }
      } finally {
        setLoading(false);
      }
    },
    [fetchOptions, cacheKey]
  );

  // Handle input change with debouncing
  useEffect(() => {
    // Clear previous timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Don't fetch if below minimum length
    if (inputValue.length < minSearchLength) {
      setOptions(initialOption ? [initialOption] : []);
      setLoading(false);
      return;
    }

    // Debounce the fetch
    debounceTimeoutRef.current = setTimeout(() => {
      doFetch(inputValue);
    }, debounceMs);

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [inputValue, minSearchLength, debounceMs, doFetch, initialOption]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  return (
    <Autocomplete
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      options={options}
      value={selectedOption}
      onChange={(_, newValue) => {
        onChange(newValue?.value ?? null);
      }}
      onBlur={onBlur}
      inputValue={inputValue}
      onInputChange={(_, newInputValue, reason) => {
        if (reason === 'input') {
          setInputValue(newInputValue);
        } else if (reason === 'clear') {
          setInputValue('');
        }
      }}
      getOptionLabel={(option) => option.label}
      isOptionEqualToValue={(option, val) => option.value === val.value}
      getOptionDisabled={(option) => !!option.disabled}
      groupBy={groupBy}
      disableClearable={!clearable}
      disabled={disabled}
      loading={loading}
      loadingText={loadingText}
      noOptionsText={inputValue.length < minSearchLength ? `Type at least ${minSearchLength} characters` : noOptionsText}
      fullWidth={fullWidth}
      size={size}
      filterOptions={(x) => x} // Disable client-side filtering
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
