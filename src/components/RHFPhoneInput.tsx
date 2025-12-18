import React, { useState, useEffect } from 'react';
import { useController, useFormContext, FieldValues, FieldPath } from 'react-hook-form';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import FormLabel from '@mui/material/FormLabel';
import FormHelperText from '@mui/material/FormHelperText';
import type { RHFPhoneInputProps } from '../types';
import { useFieldRequired } from '../context/SchemaContext';

// Type for react-phone-number-input (optional peer dependency)
interface PhoneInputComponentProps {
  value?: string;
  onChange: (value: string | undefined) => void;
  defaultCountry?: string;
  countries?: string[];
  international?: boolean;
  inputComponent?: React.ForwardRefExoticComponent<React.InputHTMLAttributes<HTMLInputElement>>;
  onCountryChange?: (country: string | undefined) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

// Validation helper export - will be null if library not installed
export let isValidPhoneNumber: ((value: string) => boolean) | null = null;

/**
 * International phone number input with country code selection
 *
 * Requires react-phone-number-input:
 * `npm install react-phone-number-input`
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
  countries,
  international = true,
  size = 'medium',
  onCountryChange,
}: RHFPhoneInputProps<TFieldValues, TName>) {
  const [PhoneInputComponent, setPhoneInputComponent] = useState<React.ComponentType<PhoneInputComponentProps> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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

  // Try to load react-phone-number-input dynamically
  useEffect(() => {
    let mounted = true;

    const loadPhoneInput = async () => {
      try {
        // @ts-expect-error - Optional peer dependency, types not available at build time
        const phoneInputModule = await import('react-phone-number-input');
        if (mounted) {
          setPhoneInputComponent(() => phoneInputModule.default as React.ComponentType<PhoneInputComponentProps>);
          isValidPhoneNumber = phoneInputModule.isValidPhoneNumber;
        }
      } catch {
        // Library not installed
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    loadPhoneInput();

    return () => {
      mounted = false;
    };
  }, []);

  // Fallback if react-phone-number-input is not installed or loading
  if (isLoading || !PhoneInputComponent) {
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
        <TextField
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          error={!!error}
          disabled={disabled}
          fullWidth={fullWidth}
          size={size}
          placeholder={placeholder}
          type="tel"
          helperText={
            error?.message ??
            helperText ??
            (!isLoading ? 'Install react-phone-number-input for full functionality' : undefined)
          }
        />
      </Box>
    );
  }

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

      <Box
        sx={{
          '& .PhoneInput': {
            display: 'flex',
            alignItems: 'stretch',
          },
          '& .PhoneInputCountry': {
            display: 'flex',
            alignItems: 'center',
            padding: size === 'small' ? '8px 12px' : '12px 14px',
            border: '1px solid',
            borderColor: error ? 'error.main' : 'rgba(0, 0, 0, 0.23)',
            borderRadius: '4px 0 0 4px',
            borderRight: 'none',
            backgroundColor: 'background.paper',
            cursor: disabled ? 'default' : 'pointer',
            '&:hover': {
              borderColor: disabled ? undefined : 'text.primary',
            },
          },
          '& .PhoneInputCountryIcon': {
            width: 24,
            height: 18,
            marginRight: 1,
          },
          '& .PhoneInputCountrySelectArrow': {
            marginLeft: 0.5,
            borderStyle: 'solid',
            borderWidth: '4px 4px 0',
            borderColor: 'text.secondary transparent transparent',
          },
          '& .PhoneInputInput': {
            flex: 1,
            padding: size === 'small' ? '8.5px 14px' : '16.5px 14px',
            border: '1px solid',
            borderColor: error ? 'error.main' : 'rgba(0, 0, 0, 0.23)',
            borderRadius: '0 4px 4px 0',
            fontSize: '1rem',
            fontFamily: 'inherit',
            outline: 'none',
            '&:focus': {
              borderColor: 'primary.main',
              borderWidth: 2,
              padding: size === 'small' ? '7.5px 13px' : '15.5px 13px',
            },
            '&:hover': {
              borderColor: disabled ? undefined : 'text.primary',
            },
            '&:disabled': {
              backgroundColor: 'action.disabledBackground',
            },
          },
        }}
      >
        <PhoneInputComponent
          value={value ?? ''}
          onChange={(newValue) => {
            onChange(newValue ?? '');
            onBlur();
          }}
          defaultCountry={defaultCountry}
          countries={countries}
          international={international}
          disabled={disabled}
          placeholder={placeholder}
          onCountryChange={onCountryChange}
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
