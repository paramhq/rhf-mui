import { ChangeEvent, useCallback, useEffect, useState } from 'react';
import { useController, useFormContext, FieldValues, FieldPath } from 'react-hook-form';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';
import InputAdornment from '@mui/material/InputAdornment';
import type { RHFPincodeFieldProps } from '../types';
import { useFieldRequired } from '../context/SchemaContext';
import { formatPincode, validatePincodeFormat } from '../utils/formatters';

/**
 * Indian pincode field (6 digits)
 *
 * @example
 * ```tsx
 * <RHFPincodeField
 *   name="pincode"
 *   label="Pincode"
 * />
 * ```
 *
 * @example With location details callback
 * ```tsx
 * <RHFPincodeField
 *   name="pincode"
 *   label="Pincode"
 *   onLocationDetails={(details) => {
 *     if (details) {
 *       setValue('city', details.city);
 *       setValue('state', details.state);
 *       setValue('district', details.district);
 *     }
 *   }}
 * />
 * ```
 */
export function RHFPincodeField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  name,
  control: controlProp,
  rules,
  defaultValue,
  shouldUnregister,
  helperText = '6-digit pincode',
  required: requiredProp,
  disabled,
  fullWidth = true,
  onLocationDetails,
  ...textFieldProps
}: RHFPincodeFieldProps<TFieldValues, TName>) {
  const formContext = useFormContext<TFieldValues>();
  const control = controlProp ?? formContext?.control;

  const schemaRequired = useFieldRequired(name);
  const required = requiredProp ?? schemaRequired;

  const [isValidating, setIsValidating] = useState(false);
  const [locationInfo, setLocationInfo] = useState<{
    city: string;
    state: string;
    district: string;
  } | null>(null);

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

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const input = event.target.value;
    const formatted = formatPincode(input);
    onChange(formatted);
    setLocationInfo(null);
  };

  // Validate pincode and fetch location details when complete
  const validateAndFetch = useCallback(async () => {
    const pincodeValue = (value as string) ?? '';

    if (!validatePincodeFormat(pincodeValue)) {
      setLocationInfo(null);
      onLocationDetails?.(null);
      return;
    }

    setIsValidating(true);
    try {
      // Using Indian Post Office API
      const response = await fetch(
        `https://api.postalpincode.in/pincode/${pincodeValue}`
      );

      if (response.ok) {
        const data = await response.json();
        if (data[0]?.Status === 'Success' && data[0]?.PostOffice?.length > 0) {
          const postOffice = data[0].PostOffice[0];
          const details = {
            city: postOffice.Block || postOffice.Name || '',
            state: postOffice.State || '',
            district: postOffice.District || '',
          };
          setLocationInfo(details);
          onLocationDetails?.(details);
        } else {
          setLocationInfo(null);
          onLocationDetails?.(null);
        }
      } else {
        setLocationInfo(null);
        onLocationDetails?.(null);
      }
    } catch {
      setLocationInfo(null);
      onLocationDetails?.(null);
    } finally {
      setIsValidating(false);
    }
  }, [value, onLocationDetails]);

  // Validate on blur if pincode is complete
  useEffect(() => {
    const pincodeValue = (value as string) ?? '';
    if (pincodeValue.length === 6 && validatePincodeFormat(pincodeValue) && onLocationDetails) {
      validateAndFetch();
    }
  }, [value, validateAndFetch, onLocationDetails]);

  const displayHelperText = () => {
    if (error?.message) return error.message;
    if (locationInfo) {
      return `${locationInfo.city}, ${locationInfo.district}, ${locationInfo.state}`;
    }
    return helperText;
  };

  return (
    <TextField
      {...textFieldProps}
      type="text"
      inputMode="numeric"
      name={name}
      value={(value as string) ?? ''}
      onChange={handleChange}
      onBlur={() => {
        onBlur();
        if (onLocationDetails) {
          validateAndFetch();
        }
      }}
      inputRef={ref}
      error={!!error}
      helperText={displayHelperText()}
      required={required}
      disabled={disabled}
      fullWidth={fullWidth}
      placeholder="400001"
      slotProps={{
        ...textFieldProps.slotProps,
        htmlInput: {
          ...textFieldProps.slotProps?.htmlInput,
          maxLength: 6,
        },
        input: {
          ...textFieldProps.slotProps?.input,
          endAdornment: isValidating ? (
            <InputAdornment position="end">
              <CircularProgress size={20} />
            </InputAdornment>
          ) : undefined,
        },
        formHelperText: {
          sx: locationInfo ? { color: 'success.main' } : undefined,
        },
      }}
    />
  );
}
