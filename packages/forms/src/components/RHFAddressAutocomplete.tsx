import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { useController, useFormContext, FieldValues, FieldPath } from 'react-hook-form';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import CircularProgress from '@mui/material/CircularProgress';
import InputAdornment from '@mui/material/InputAdornment';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import FormHelperText from '@mui/material/FormHelperText';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import type { RHFAddressAutocompleteProps, AddressValue, AddressSuggestion } from '../types';
import { useFieldRequired } from '../context/SchemaContext';

// Type declarations for Google Maps
interface GoogleMapsWindow extends Window {
  google?: {
    maps: {
      places: {
        AutocompleteService: new () => GoogleAutocompleteService;
        PlacesService: new (attrContainer: HTMLDivElement) => GooglePlacesService;
        PlacesServiceStatus: {
          OK: string;
        };
      };
    };
  };
}

interface GoogleAutocompleteService {
  getPlacePredictions: (
    request: GoogleAutocompleteRequest,
    callback: (predictions: GoogleAutocompletePrediction[] | null, status: string) => void
  ) => void;
}

interface GooglePlacesService {
  getDetails: (
    request: GooglePlaceDetailsRequest,
    callback: (place: GooglePlaceResult | null, status: string) => void
  ) => void;
}

interface GoogleAutocompleteRequest {
  input: string;
  types?: string[];
  componentRestrictions?: { country: string | string[] };
}

interface GoogleAutocompletePrediction {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}

interface GooglePlaceDetailsRequest {
  placeId: string;
  fields: string[];
}

interface GooglePlaceResult {
  formatted_address?: string;
  place_id?: string;
  geometry?: {
    location?: {
      lat: () => number;
      lng: () => number;
    };
  };
  address_components?: Array<{
    long_name: string;
    short_name: string;
    types: string[];
  }>;
}

declare const window: GoogleMapsWindow;

// Debounce utility
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Load Google Places API script
let googleScriptLoadPromise: Promise<void> | null = null;

function loadGooglePlacesScript(apiKey: string): Promise<void> {
  if (googleScriptLoadPromise) return googleScriptLoadPromise;

  googleScriptLoadPromise = new Promise((resolve, reject) => {
    // Check if already loaded
    if (window.google?.maps?.places) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Google Places API'));
    document.head.appendChild(script);
  });

  return googleScriptLoadPromise;
}

// Parse Google Places result into address components
function parseGooglePlaceResult(place: GooglePlaceResult): AddressValue {
  const address: AddressValue = {
    formatted: place.formatted_address ?? '',
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    lat: place.geometry?.location?.lat(),
    lng: place.geometry?.location?.lng(),
    placeId: place.place_id,
  };

  if (place.address_components) {
    for (const component of place.address_components) {
      const types = component.types;

      if (types.includes('street_number')) {
        address.street = component.long_name;
      }
      if (types.includes('route')) {
        address.street = address.street
          ? `${address.street} ${component.long_name}`
          : component.long_name;
      }
      if (types.includes('sublocality') || types.includes('sublocality_level_1')) {
        address.street = address.street
          ? `${address.street}, ${component.long_name}`
          : component.long_name;
      }
      if (types.includes('locality')) {
        address.city = component.long_name;
      }
      if (types.includes('administrative_area_level_1')) {
        address.state = component.long_name;
        address.stateCode = component.short_name;
      }
      if (types.includes('country')) {
        address.country = component.long_name;
        address.countryCode = component.short_name;
      }
      if (types.includes('postal_code')) {
        address.postalCode = component.long_name;
      }
    }
  }

  return address;
}

/**
 * Address autocomplete component with Google Places integration
 *
 * Requires Google Maps JavaScript API with Places library.
 * Set up: Add your API key via the `apiKey` prop or via `googlePlacesApiKey` in your app config.
 *
 * Stores value as AddressValue object with parsed components.
 *
 * @example Basic usage
 * ```tsx
 * <RHFAddressAutocomplete
 *   name="address"
 *   label="Address"
 *   apiKey={process.env.GOOGLE_MAPS_API_KEY}
 * />
 * ```
 *
 * @example With country restriction
 * ```tsx
 * <RHFAddressAutocomplete
 *   name="shippingAddress"
 *   label="Shipping Address"
 *   apiKey={apiKey}
 *   countries={['US', 'CA']}
 *   types={['address']}
 * />
 * ```
 *
 * @example Show parsed fields
 * ```tsx
 * <RHFAddressAutocomplete
 *   name="address"
 *   label="Address"
 *   apiKey={apiKey}
 *   showParsedFields
 *   onAddressSelect={(address) => {
 *     console.log('Selected:', address);
 *   }}
 * />
 * ```
 *
 * @example Custom fetch function (for other providers)
 * ```tsx
 * <RHFAddressAutocomplete
 *   name="address"
 *   label="Address"
 *   fetchSuggestions={async (input) => {
 *     const response = await fetch(`/api/address-lookup?q=${input}`);
 *     return response.json();
 *   }}
 *   onSelectSuggestion={async (suggestion) => {
 *     const response = await fetch(`/api/address-details/${suggestion.placeId}`);
 *     return response.json();
 *   }}
 * />
 * ```
 */
export function RHFAddressAutocomplete<
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
  label,
  placeholder = 'Start typing an address...',
  size = 'medium',
  apiKey,
  countries,
  types: typesProp,
  showParsedFields = false,
  debounceMs = 300,
  minChars = 3,
  fetchSuggestions: customFetchSuggestions,
  onSelectSuggestion: customOnSelectSuggestion,
  onAddressSelect,
}: RHFAddressAutocompleteProps<TFieldValues, TName>) {
  const [inputValue, setInputValue] = useState('');
  const [options, setOptions] = useState<AddressSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);

  const autocompleteService = useRef<GoogleAutocompleteService | null>(null);
  const placesService = useRef<GooglePlacesService | null>(null);
  const dummyDiv = useRef<HTMLDivElement | null>(null);

  const debouncedInput = useDebounce(inputValue, debounceMs);

  // Stabilize array props to prevent infinite loops
  const types = useMemo(() => typesProp ?? ['geocode'], [typesProp]);
  const countriesKey = useMemo(() => JSON.stringify(countries), [countries]);
  const typesKey = useMemo(() => JSON.stringify(types), [types]);

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

  const addressValue = useMemo<AddressValue | null>(() => {
    if (value && typeof value === 'object' && 'formatted' in value) {
      return value as AddressValue;
    }
    return null;
  }, [value]);

  // Load Google Places API
  useEffect(() => {
    if (customFetchSuggestions) {
      setIsGoogleLoaded(true);
      return;
    }

    if (!apiKey) {
      console.warn('RHFAddressAutocomplete: apiKey is required for Google Places integration');
      return;
    }

    loadGooglePlacesScript(apiKey)
      .then(() => {
        if (window.google?.maps?.places) {
          autocompleteService.current = new window.google.maps.places.AutocompleteService();
          
          // Create a dummy div for PlacesService
          if (!dummyDiv.current) {
            dummyDiv.current = document.createElement('div');
          }
          placesService.current = new window.google.maps.places.PlacesService(dummyDiv.current);
          
          setIsGoogleLoaded(true);
        }
      })
      .catch((err) => {
        console.error('Failed to load Google Places API:', err);
      });
  }, [apiKey, customFetchSuggestions]);

  // Fetch suggestions when input changes
  useEffect(() => {
    if (!debouncedInput || debouncedInput.length < minChars) {
      setOptions([]);
      return;
    }

    const fetchSuggestions = async () => {
      setLoading(true);

      try {
        if (customFetchSuggestions) {
          const suggestions = await customFetchSuggestions(debouncedInput);
          setOptions(suggestions);
        } else if (autocompleteService.current && isGoogleLoaded && window.google?.maps?.places) {
          const request: GoogleAutocompleteRequest = {
            input: debouncedInput,
            types,
          };

          if (countries && countries.length > 0) {
            request.componentRestrictions = { country: countries };
          }

          autocompleteService.current.getPlacePredictions(
            request,
            (predictions, status) => {
              if (status === window.google?.maps?.places?.PlacesServiceStatus?.OK && predictions) {
                setOptions(
                  predictions.map((p) => ({
                    placeId: p.place_id,
                    description: p.description,
                    mainText: p.structured_formatting.main_text,
                    secondaryText: p.structured_formatting.secondary_text,
                  }))
                );
              } else {
                setOptions([]);
              }
            }
          );
        }
      } catch (err) {
        console.error('Error fetching address suggestions:', err);
        setOptions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSuggestions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedInput, minChars, customFetchSuggestions, isGoogleLoaded, countriesKey, typesKey]);

  const handleSuggestionSelect = useCallback(
    async (suggestion: AddressSuggestion | null) => {
      if (!suggestion) {
        onChange(null);
        return;
      }

      try {
        let address: AddressValue;

        if (customOnSelectSuggestion) {
          address = await customOnSelectSuggestion(suggestion);
        } else if (placesService.current && suggestion.placeId && window.google?.maps?.places) {
          // Get place details from Google
          address = await new Promise((resolve, reject) => {
            placesService.current!.getDetails(
              {
                placeId: suggestion.placeId,
                fields: ['address_components', 'formatted_address', 'geometry', 'place_id'],
              },
              (place, status) => {
                if (status === window.google?.maps?.places?.PlacesServiceStatus?.OK && place) {
                  resolve(parseGooglePlaceResult(place));
                } else {
                  reject(new Error('Failed to get place details'));
                }
              }
            );
          });
        } else {
          // Fallback: just use the description
          address = {
            formatted: suggestion.description,
            street: '',
            city: '',
            state: '',
            postalCode: '',
            country: '',
            placeId: suggestion.placeId,
          };
        }

        onChange(address);
        onAddressSelect?.(address);
        setInputValue(address.formatted);
      } catch (err) {
        console.error('Error getting address details:', err);
      }
    },
    [onChange, customOnSelectSuggestion, onAddressSelect]
  );

  // Get error message
  const errorMessage = useMemo(() => {
    if (error?.message) return error.message;
    return undefined;
  }, [error]);

  return (
    <FormControl error={!!error} disabled={disabled} fullWidth={fullWidth}>
      {label && (
        <FormLabel required={required} sx={{ mb: 1 }}>
          {label}
        </FormLabel>
      )}

      <Autocomplete
        freeSolo
        options={options}
        getOptionLabel={(option) => {
          if (typeof option === 'string') return option;
          return option.description;
        }}
        inputValue={inputValue}
        onInputChange={(_, newValue, reason) => {
          setInputValue(newValue);
          if (reason === 'clear') {
            onChange(null);
          }
        }}
        onChange={(_, newValue) => {
          if (typeof newValue === 'string') {
            // User typed and pressed enter without selecting
            onChange({ formatted: newValue });
          } else {
            handleSuggestionSelect(newValue);
          }
        }}
        loading={loading}
        disabled={disabled}
        renderInput={(params) => (
          <TextField
            {...params}
            inputRef={ref}
            placeholder={placeholder}
            error={!!error}
            size={size}
            onBlur={onBlur}
            slotProps={{
              input: {
                ...params.InputProps,
                startAdornment: (
                  <InputAdornment position="start">
                    <Box component="span" sx={{ fontSize: '1rem' }}>📍</Box>
                  </InputAdornment>
                ),
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
        renderOption={(props, option) => {
          const { key, ...restProps } = props;
          return (
            <li key={key} {...restProps}>
              <Box>
                <Typography variant="body1">{option.mainText ?? option.description}</Typography>
                {option.secondaryText && (
                  <Typography variant="body2" color="text.secondary">
                    {option.secondaryText}
                  </Typography>
                )}
              </Box>
            </li>
          );
        }}
        filterOptions={(x) => x} // Disable built-in filtering since API does it
        noOptionsText={
          inputValue.length < minChars
            ? `Type at least ${minChars} characters`
            : 'No addresses found'
        }
      />

      {/* Show parsed address fields */}
      {showParsedFields && addressValue && (
        <Box sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <TextField
                label="Street Address"
                value={addressValue.street ?? ''}
                size="small"
                fullWidth
                disabled
                slotProps={{
                  input: { readOnly: true },
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="City"
                value={addressValue.city ?? ''}
                size="small"
                fullWidth
                disabled
                slotProps={{
                  input: { readOnly: true },
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="State/Province"
                value={addressValue.state ?? ''}
                size="small"
                fullWidth
                disabled
                slotProps={{
                  input: { readOnly: true },
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Postal Code"
                value={addressValue.postalCode ?? ''}
                size="small"
                fullWidth
                disabled
                slotProps={{
                  input: { readOnly: true },
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Country"
                value={addressValue.country ?? ''}
                size="small"
                fullWidth
                disabled
                slotProps={{
                  input: { readOnly: true },
                }}
              />
            </Grid>
          </Grid>
        </Box>
      )}

      {(errorMessage || helperText) && (
        <FormHelperText sx={{ mt: 1 }}>
          {errorMessage ?? helperText}
        </FormHelperText>
      )}
    </FormControl>
  );
}
