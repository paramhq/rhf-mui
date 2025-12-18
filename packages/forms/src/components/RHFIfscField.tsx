import { ChangeEvent, useCallback, useEffect, useState } from 'react';
import { useController, useFormContext, FieldValues, FieldPath } from 'react-hook-form';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';
import InputAdornment from '@mui/material/InputAdornment';
import Box from '@mui/material/Box';
import type { RHFIfscFieldProps } from '../types';
import { useFieldRequired } from '../context/SchemaContext';
import { formatIfsc, validateIfscFormat } from '../utils/formatters';

/**
 * IFSC code field with format validation
 * Format: 4 letters (bank) + 0 + 6 alphanumeric (branch)
 *
 * @example
 * ```tsx
 * <RHFIfscField
 *   name="ifsc"
 *   label="IFSC Code"
 * />
 * ```
 *
 * @example With bank details callback
 * ```tsx
 * <RHFIfscField
 *   name="ifsc"
 *   label="IFSC Code"
 *   onBankDetails={(details) => {
 *     if (details) {
 *       setValue('bankName', details.bank);
 *       setValue('branchName', details.branch);
 *     }
 *   }}
 * />
 * ```
 */
export function RHFIfscField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  name,
  control: controlProp,
  rules,
  defaultValue,
  shouldUnregister,
  helperText = 'e.g., HDFC0001234',
  required: requiredProp,
  disabled,
  fullWidth = true,
  onBankDetails,
  ...textFieldProps
}: RHFIfscFieldProps<TFieldValues, TName>) {
  const formContext = useFormContext<TFieldValues>();
  const control = controlProp ?? formContext?.control;

  const schemaRequired = useFieldRequired(name);
  const required = requiredProp ?? schemaRequired;

  const [isValidating, setIsValidating] = useState(false);
  const [bankInfo, setBankInfo] = useState<{ bank: string; branch: string } | null>(null);

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
    const formatted = formatIfsc(input);
    onChange(formatted);
    setBankInfo(null);
  };

  // Validate IFSC and fetch bank details when complete
  const validateAndFetch = useCallback(async () => {
    const ifscValue = (value as string) ?? '';

    if (!validateIfscFormat(ifscValue)) {
      setBankInfo(null);
      onBankDetails?.(null);
      return;
    }

    setIsValidating(true);
    try {
      // Using Razorpay's IFSC API (free, no auth required)
      const response = await fetch(`https://ifsc.razorpay.com/${ifscValue}`);

      if (response.ok) {
        const data = await response.json();
        const details = {
          bank: data.BANK || '',
          branch: data.BRANCH || '',
        };
        setBankInfo(details);
        onBankDetails?.(details);
      } else {
        setBankInfo(null);
        onBankDetails?.(null);
      }
    } catch {
      setBankInfo(null);
      onBankDetails?.(null);
    } finally {
      setIsValidating(false);
    }
  }, [value, onBankDetails]);

  // Validate on blur if IFSC is complete
  useEffect(() => {
    const ifscValue = (value as string) ?? '';
    if (ifscValue.length === 11 && validateIfscFormat(ifscValue) && onBankDetails) {
      validateAndFetch();
    }
  }, [value, validateAndFetch, onBankDetails]);

  const displayHelperText = () => {
    if (error?.message) return error.message;
    if (bankInfo) {
      return `${bankInfo.bank} - ${bankInfo.branch}`;
    }
    return helperText;
  };

  return (
    <Box>
      <TextField
        {...textFieldProps}
        type="text"
        name={name}
        value={(value as string) ?? ''}
        onChange={handleChange}
        onBlur={() => {
          onBlur();
          if (onBankDetails) {
            validateAndFetch();
          }
        }}
        inputRef={ref}
        error={!!error}
        helperText={displayHelperText()}
        required={required}
        disabled={disabled}
        fullWidth={fullWidth}
        placeholder="HDFC0001234"
        slotProps={{
          ...textFieldProps.slotProps,
          htmlInput: {
            ...textFieldProps.slotProps?.htmlInput,
            maxLength: 11,
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
            sx: bankInfo ? { color: 'success.main' } : undefined,
          },
        }}
        sx={{ '& input': { textTransform: 'uppercase' } }}
      />
    </Box>
  );
}
