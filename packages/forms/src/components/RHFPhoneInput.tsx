import { useState, useEffect, useMemo } from 'react';
import { useController, useFormContext, FieldValues, FieldPath } from 'react-hook-form';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormHelperText from '@mui/material/FormHelperText';
import FormLabel from '@mui/material/FormLabel';
import type { RHFPhoneInputProps } from '../types';
import { useFieldRequired } from '../context/SchemaContext';

// Country data with dial codes
interface CountryData {
  code: string;
  name: string;
  dialCode: string;
  flag: string;
}

// Common countries list (expandable)
const COUNTRIES: CountryData[] = [
  { code: 'US', name: 'United States', dialCode: '+1', flag: '🇺🇸' },
  { code: 'CA', name: 'Canada', dialCode: '+1', flag: '🇨🇦' },
  { code: 'GB', name: 'United Kingdom', dialCode: '+44', flag: '🇬🇧' },
  { code: 'AU', name: 'Australia', dialCode: '+61', flag: '🇦🇺' },
  { code: 'DE', name: 'Germany', dialCode: '+49', flag: '🇩🇪' },
  { code: 'FR', name: 'France', dialCode: '+33', flag: '🇫🇷' },
  { code: 'IN', name: 'India', dialCode: '+91', flag: '🇮🇳' },
  { code: 'JP', name: 'Japan', dialCode: '+81', flag: '🇯🇵' },
  { code: 'CN', name: 'China', dialCode: '+86', flag: '🇨🇳' },
  { code: 'BR', name: 'Brazil', dialCode: '+55', flag: '🇧🇷' },
  { code: 'MX', name: 'Mexico', dialCode: '+52', flag: '🇲🇽' },
  { code: 'ES', name: 'Spain', dialCode: '+34', flag: '🇪🇸' },
  { code: 'IT', name: 'Italy', dialCode: '+39', flag: '🇮🇹' },
  { code: 'NL', name: 'Netherlands', dialCode: '+31', flag: '🇳🇱' },
  { code: 'BE', name: 'Belgium', dialCode: '+32', flag: '🇧🇪' },
  { code: 'SE', name: 'Sweden', dialCode: '+46', flag: '🇸🇪' },
  { code: 'NO', name: 'Norway', dialCode: '+47', flag: '🇳🇴' },
  { code: 'DK', name: 'Denmark', dialCode: '+45', flag: '🇩🇰' },
  { code: 'FI', name: 'Finland', dialCode: '+358', flag: '🇫🇮' },
  { code: 'CH', name: 'Switzerland', dialCode: '+41', flag: '🇨🇭' },
  { code: 'AT', name: 'Austria', dialCode: '+43', flag: '🇦🇹' },
  { code: 'IE', name: 'Ireland', dialCode: '+353', flag: '🇮🇪' },
  { code: 'NZ', name: 'New Zealand', dialCode: '+64', flag: '🇳🇿' },
  { code: 'SG', name: 'Singapore', dialCode: '+65', flag: '🇸🇬' },
  { code: 'HK', name: 'Hong Kong', dialCode: '+852', flag: '🇭🇰' },
  { code: 'KR', name: 'South Korea', dialCode: '+82', flag: '🇰🇷' },
  { code: 'AE', name: 'UAE', dialCode: '+971', flag: '🇦🇪' },
  { code: 'SA', name: 'Saudi Arabia', dialCode: '+966', flag: '🇸🇦' },
  { code: 'ZA', name: 'South Africa', dialCode: '+27', flag: '🇿🇦' },
  { code: 'RU', name: 'Russia', dialCode: '+7', flag: '🇷🇺' },
  { code: 'PL', name: 'Poland', dialCode: '+48', flag: '🇵🇱' },
  { code: 'PT', name: 'Portugal', dialCode: '+351', flag: '🇵🇹' },
  { code: 'GR', name: 'Greece', dialCode: '+30', flag: '🇬🇷' },
  { code: 'CZ', name: 'Czech Republic', dialCode: '+420', flag: '🇨🇿' },
  { code: 'HU', name: 'Hungary', dialCode: '+36', flag: '🇭🇺' },
  { code: 'IL', name: 'Israel', dialCode: '+972', flag: '🇮🇱' },
  { code: 'TH', name: 'Thailand', dialCode: '+66', flag: '🇹🇭' },
  { code: 'MY', name: 'Malaysia', dialCode: '+60', flag: '🇲🇾' },
  { code: 'PH', name: 'Philippines', dialCode: '+63', flag: '🇵🇭' },
  { code: 'ID', name: 'Indonesia', dialCode: '+62', flag: '🇮🇩' },
  { code: 'VN', name: 'Vietnam', dialCode: '+84', flag: '🇻🇳' },
  { code: 'PK', name: 'Pakistan', dialCode: '+92', flag: '🇵🇰' },
  { code: 'BD', name: 'Bangladesh', dialCode: '+880', flag: '🇧🇩' },
  { code: 'NG', name: 'Nigeria', dialCode: '+234', flag: '🇳🇬' },
  { code: 'EG', name: 'Egypt', dialCode: '+20', flag: '🇪🇬' },
  { code: 'AR', name: 'Argentina', dialCode: '+54', flag: '🇦🇷' },
  { code: 'CL', name: 'Chile', dialCode: '+56', flag: '🇨🇱' },
  { code: 'CO', name: 'Colombia', dialCode: '+57', flag: '🇨🇴' },
  { code: 'PE', name: 'Peru', dialCode: '+51', flag: '🇵🇪' },
];

// Validation helper - basic phone validation
export function isValidPhoneNumber(value: string): boolean {
  // Remove non-digit characters except +
  const cleaned = value.replace(/[^\d+]/g, '');
  // Check if it starts with + and has 8-15 digits
  return /^\+?\d{8,15}$/.test(cleaned);
}

/**
 * International phone number input with country code selection using MUI components
 *
 * @example
 * ```tsx
 * <RHFPhoneInput
 *   name="phone"
 *   label="Phone Number"
 *   defaultCountry="US"
 * />
 * ```
 *
 * @example
 * ```tsx
 * // Restrict to specific countries
 * <RHFPhoneInput
 *   name="phone"
 *   label="Phone"
 *   countries={['US', 'CA', 'GB']}
 *   defaultCountry="US"
 * />
 * ```
 */
export function RHFPhoneInput<
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
  placeholder = 'Enter phone number',
  defaultCountry = 'US',
  countries: allowedCountries,
  size = 'medium',
  onCountryChange,
}: RHFPhoneInputProps<TFieldValues, TName>) {
  const [selectedCountry, setSelectedCountry] = useState<string>(defaultCountry);
  const [localNumber, setLocalNumber] = useState<string>('');
  
  const formContext = useFormContext<TFieldValues>();
  const control = controlProp ?? formContext?.control;

  const schemaRequired = useFieldRequired(name);
  const required = requiredProp ?? schemaRequired;

  const {
    field: { value, onChange, onBlur },
    fieldState: { error },
  } = useController({
    name,
    control,
    rules,
    defaultValue,
    shouldUnregister,
  });

  // Filter countries if specific list provided
  const availableCountries = useMemo(() => {
    if (!allowedCountries || allowedCountries.length === 0) {
      return COUNTRIES;
    }
    return COUNTRIES.filter(c => allowedCountries.includes(c.code));
  }, [allowedCountries]);

  // Get selected country data
  const countryData = useMemo(() => {
    return availableCountries.find(c => c.code === selectedCountry) || availableCountries[0];
  }, [selectedCountry, availableCountries]);

  // Parse initial value to extract country and number
  useEffect(() => {
    if (value && typeof value === 'string') {
      // Try to find matching country by dial code
      const matchedCountry = availableCountries.find(c => 
        value.startsWith(c.dialCode)
      );
      if (matchedCountry) {
        setSelectedCountry(matchedCountry.code);
        const numberPart = value.slice(matchedCountry.dialCode.length).replace(/[^\d]/g, '');
        setLocalNumber(numberPart);
      } else {
        // Just use the number as-is
        setLocalNumber(value.replace(/[^\d]/g, ''));
      }
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Update form value when country or local number changes
  const handleNumberChange = (newNumber: string) => {
    // Only allow digits
    const digits = newNumber.replace(/[^\d]/g, '');
    setLocalNumber(digits);
    
    // Combine with dial code for form value
    const fullNumber = digits ? `${countryData.dialCode}${digits}` : '';
    onChange(fullNumber as TFieldValues[TName]);
  };

  const handleCountryChange = (newCountryCode: string) => {
    setSelectedCountry(newCountryCode);
    onCountryChange?.(newCountryCode);
    
    // Update form value with new dial code
    const newCountry = availableCountries.find(c => c.code === newCountryCode);
    if (newCountry && localNumber) {
      onChange(`${newCountry.dialCode}${localNumber}` as TFieldValues[TName]);
    }
  };

  return (
    <Box sx={{ width: fullWidth ? '100%' : 'auto' }}>
      {label && (
        <FormLabel
          required={required}
          error={!!error}
          sx={{ display: 'block', mb: 0.5 }}
        >
          {label}
        </FormLabel>
      )}

      <Box sx={{ display: 'flex', gap: 0 }}>
        {/* Country Select */}
        <Select
          value={selectedCountry}
          onChange={(e) => handleCountryChange(e.target.value)}
          disabled={disabled}
          size={size}
          error={!!error}
          sx={{
            minWidth: 120,
            borderTopRightRadius: 0,
            borderBottomRightRadius: 0,
            '& .MuiOutlinedInput-notchedOutline': {
              borderRight: 'none',
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderRight: 'none',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderRight: 'none',
            },
          }}
          renderValue={(code) => {
            const country = availableCountries.find(c => c.code === code);
            return country ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <span style={{ fontSize: '1.2em' }}>{country.flag}</span>
                <span>{country.dialCode}</span>
              </Box>
            ) : code;
          }}
          MenuProps={{
            PaperProps: {
              sx: { maxHeight: 300 },
            },
          }}
        >
          {availableCountries.map((country) => (
            <MenuItem key={country.code} value={country.code}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                <span style={{ fontSize: '1.2em' }}>{country.flag}</span>
                <span style={{ flex: 1 }}>{country.name}</span>
                <Box component="span" sx={{ color: 'text.secondary', fontSize: '0.875em' }}>
                  {country.dialCode}
                </Box>
              </Box>
            </MenuItem>
          ))}
        </Select>

        {/* Phone Number Input */}
        <TextField
          value={localNumber}
          onChange={(e) => handleNumberChange(e.target.value)}
          onBlur={onBlur}
          error={!!error}
          disabled={disabled}
          fullWidth
          size={size}
          placeholder={placeholder}
          type="tel"
          sx={{
            '& .MuiOutlinedInput-root': {
              borderTopLeftRadius: 0,
              borderBottomLeftRadius: 0,
            },
          }}
          slotProps={{
            htmlInput: {
              inputMode: 'tel',
              autoComplete: 'tel-national',
            },
          }}
        />
      </Box>

      {(error?.message || helperText) && (
        <FormHelperText error={!!error} sx={{ mt: 0.5 }}>
          {error?.message ?? helperText}
        </FormHelperText>
      )}
    </Box>
  );
}
