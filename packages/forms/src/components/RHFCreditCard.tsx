import React, { useState, useCallback, useMemo } from 'react';
import { useController, useFormContext, FieldValues, FieldPath } from 'react-hook-form';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import FormHelperText from '@mui/material/FormHelperText';
import InputAdornment from '@mui/material/InputAdornment';
import Grid from '@mui/material/Grid';
import type { RHFCreditCardProps, CreditCardValue, CardType } from '../types';
import { useFieldRequired } from '../context/SchemaContext';

// Card type detection patterns
const CARD_PATTERNS: { type: CardType; pattern: RegExp; lengths: number[]; cvvLength: number }[] = [
  { type: 'visa', pattern: /^4/, lengths: [16], cvvLength: 3 },
  { type: 'mastercard', pattern: /^(5[1-5]|2[2-7])/, lengths: [16], cvvLength: 3 },
  { type: 'amex', pattern: /^3[47]/, lengths: [15], cvvLength: 4 },
  { type: 'discover', pattern: /^(6011|65|64[4-9]|622)/, lengths: [16], cvvLength: 3 },
  { type: 'diners', pattern: /^(36|38|30[0-5])/, lengths: [14], cvvLength: 3 },
  { type: 'jcb', pattern: /^35/, lengths: [16], cvvLength: 3 },
  { type: 'rupay', pattern: /^(60|65|81|82|508)/, lengths: [16], cvvLength: 3 },
];

// Card type display names and icons
const CARD_DISPLAY: Record<CardType | 'unknown', { name: string; icon: string }> = {
  visa: { name: 'Visa', icon: '💳' },
  mastercard: { name: 'Mastercard', icon: '💳' },
  amex: { name: 'American Express', icon: '💳' },
  discover: { name: 'Discover', icon: '💳' },
  diners: { name: 'Diners Club', icon: '💳' },
  jcb: { name: 'JCB', icon: '💳' },
  rupay: { name: 'RuPay', icon: '💳' },
  unknown: { name: 'Card', icon: '💳' },
};

/**
 * Detect card type from card number
 */
function detectCardType(number: string): CardType | 'unknown' {
  const cleaned = number.replace(/\D/g, '');
  for (const card of CARD_PATTERNS) {
    if (card.pattern.test(cleaned)) {
      return card.type;
    }
  }
  return 'unknown';
}

/**
 * Validate card number using Luhn algorithm
 */
function validateLuhn(number: string): boolean {
  const cleaned = number.replace(/\D/g, '');
  if (cleaned.length < 13) return false;

  let sum = 0;
  let isEven = false;

  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned[i], 10);

    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
}

/**
 * Format card number with spaces
 */
function formatCardNumber(value: string, cardType: CardType | 'unknown'): string {
  const cleaned = value.replace(/\D/g, '');
  
  // AMEX format: 4-6-5
  if (cardType === 'amex') {
    const parts = [
      cleaned.slice(0, 4),
      cleaned.slice(4, 10),
      cleaned.slice(10, 15),
    ].filter(Boolean);
    return parts.join(' ');
  }
  
  // Standard format: 4-4-4-4
  const parts = [];
  for (let i = 0; i < cleaned.length; i += 4) {
    parts.push(cleaned.slice(i, i + 4));
  }
  return parts.join(' ');
}

/**
 * Format expiry date as MM/YY
 */
function formatExpiry(value: string): string {
  const cleaned = value.replace(/\D/g, '');
  if (cleaned.length >= 2) {
    return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`;
  }
  return cleaned;
}

/**
 * Validate expiry date
 */
function validateExpiry(value: string): boolean {
  const cleaned = value.replace(/\D/g, '');
  if (cleaned.length !== 4) return false;

  const month = parseInt(cleaned.slice(0, 2), 10);
  const year = parseInt(cleaned.slice(2, 4), 10);

  if (month < 1 || month > 12) return false;

  const now = new Date();
  const currentYear = now.getFullYear() % 100;
  const currentMonth = now.getMonth() + 1;

  if (year < currentYear || (year === currentYear && month < currentMonth)) {
    return false;
  }

  return true;
}

/**
 * Credit card input component with validation
 *
 * Stores value as: { number: string, expiry: string, cvv: string, cardType: string }
 *
 * Features:
 * - Auto-detection of card type (Visa, Mastercard, Amex, etc.)
 * - Luhn algorithm validation for card number
 * - Expiry date validation
 * - Auto-formatting with spaces
 * - RuPay support for Indian cards
 *
 * @example
 * ```tsx
 * <RHFCreditCard
 *   name="paymentCard"
 *   label="Payment Card"
 * />
 * ```
 *
 * @example With cardholder name
 * ```tsx
 * <RHFCreditCard
 *   name="card"
 *   label="Card Details"
 *   showCardholderName
 *   onCardTypeChange={(type) => console.log('Card type:', type)}
 * />
 * ```
 */
export function RHFCreditCard<
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
  size = 'medium',
  showCardholderName = false,
  acceptedCards = ['visa', 'mastercard', 'amex', 'discover', 'rupay'],
  onCardTypeChange,
}: RHFCreditCardProps<TFieldValues, TName>) {
  const [cardType, setCardType] = useState<CardType | 'unknown'>('unknown');

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

  const cardValue = useMemo<CreditCardValue>(() => {
    if (value && typeof value === 'object') {
      return value as CreditCardValue;
    }
    return {
      number: '',
      expiry: '',
      cvv: '',
      cardholderName: '',
    };
  }, [value]);

  const updateValue = useCallback(
    (field: keyof CreditCardValue, fieldValue: string) => {
      onChange({
        ...cardValue,
        [field]: fieldValue,
        cardType: field === 'number' ? detectCardType(fieldValue) : cardValue.cardType,
      });
    },
    [cardValue, onChange]
  );

  const handleNumberChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const input = e.target.value.replace(/\D/g, '');
      const detectedType = detectCardType(input);
      
      // Limit length based on card type
      const maxLength = detectedType === 'amex' ? 15 : 16;
      const limited = input.slice(0, maxLength);
      
      setCardType(detectedType);
      onCardTypeChange?.(detectedType);
      
      updateValue('number', limited);
    },
    [updateValue, onCardTypeChange]
  );

  const handleExpiryChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const input = e.target.value.replace(/\D/g, '');
      updateValue('expiry', input.slice(0, 4));
    },
    [updateValue]
  );

  const handleCvvChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const input = e.target.value.replace(/\D/g, '');
      const maxLength = cardType === 'amex' ? 4 : 3;
      updateValue('cvv', input.slice(0, maxLength));
    },
    [updateValue, cardType]
  );

  const handleNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      updateValue('cardholderName', e.target.value.toUpperCase());
    },
    [updateValue]
  );

  // Validation states
  const isNumberValid = cardValue.number.length > 0 && validateLuhn(cardValue.number);
  const isExpiryValid = cardValue.expiry.length === 4 && validateExpiry(cardValue.expiry);
  const isCvvValid = cardValue.cvv.length >= 3;
  const isCardAccepted = cardType === 'unknown' || acceptedCards.includes(cardType);

  // Get card-specific error messages
  const errorMessage = useMemo(() => {
    if (error?.message) return error.message;
    if (error && typeof error === 'object') {
      const errObj = error as Record<string, { message?: string }>;
      if (errObj.number?.message) return errObj.number.message;
      if (errObj.expiry?.message) return errObj.expiry.message;
      if (errObj.cvv?.message) return errObj.cvv.message;
    }
    return undefined;
  }, [error]);

  const cardDisplay = CARD_DISPLAY[cardType];

  return (
    <FormControl error={!!error} disabled={disabled} fullWidth={fullWidth}>
      {label && (
        <FormLabel required={required} sx={{ mb: 1 }}>
          {label}
        </FormLabel>
      )}

      <Box onBlur={onBlur}>
        <Grid container spacing={2}>
          {/* Card Number */}
          <Grid size={{ xs: 12 }}>
            <TextField
              label="Card Number"
              value={formatCardNumber(cardValue.number, cardType)}
              onChange={handleNumberChange}
              error={!!error || (cardValue.number.length > 0 && (!isNumberValid || !isCardAccepted))}
              disabled={disabled}
              fullWidth
              size={size}
              placeholder="1234 5678 9012 3456"
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Box component="span" sx={{ fontSize: '1.2rem' }}>
                        {cardDisplay.icon}
                      </Box>
                    </InputAdornment>
                  ),
                  endAdornment: cardType !== 'unknown' && (
                    <InputAdornment position="end">
                      <Box
                        component="span"
                        sx={{
                          fontSize: '0.75rem',
                          color: isCardAccepted ? 'text.secondary' : 'error.main',
                          fontWeight: 500,
                        }}
                      >
                        {cardDisplay.name}
                        {!isCardAccepted && ' (not accepted)'}
                      </Box>
                    </InputAdornment>
                  ),
                },
                htmlInput: {
                  inputMode: 'numeric',
                  autoComplete: 'cc-number',
                },
              }}
            />
          </Grid>

          {/* Expiry Date */}
          <Grid size={{ xs: 6, sm: 4 }}>
            <TextField
              label="Expiry (MM/YY)"
              value={formatExpiry(cardValue.expiry)}
              onChange={handleExpiryChange}
              error={!!error || (cardValue.expiry.length === 4 && !isExpiryValid)}
              disabled={disabled}
              fullWidth
              size={size}
              placeholder="MM/YY"
              slotProps={{
                htmlInput: {
                  inputMode: 'numeric',
                  autoComplete: 'cc-exp',
                  maxLength: 5,
                },
              }}
            />
          </Grid>

          {/* CVV */}
          <Grid size={{ xs: 6, sm: 4 }}>
            <TextField
              label={cardType === 'amex' ? 'CVV (4 digits)' : 'CVV'}
              value={cardValue.cvv}
              onChange={handleCvvChange}
              error={!!error || (cardValue.cvv.length > 0 && !isCvvValid)}
              disabled={disabled}
              fullWidth
              size={size}
              placeholder={cardType === 'amex' ? '1234' : '123'}
              type="password"
              slotProps={{
                htmlInput: {
                  inputMode: 'numeric',
                  autoComplete: 'cc-csc',
                  maxLength: cardType === 'amex' ? 4 : 3,
                },
              }}
            />
          </Grid>

          {/* Cardholder Name (optional) */}
          {showCardholderName && (
            <Grid size={{ xs: 12, sm: showCardholderName ? 4 : 12 }}>
              <TextField
                label="Cardholder Name"
                value={cardValue.cardholderName ?? ''}
                onChange={handleNameChange}
                error={!!error}
                disabled={disabled}
                fullWidth
                size={size}
                placeholder="JOHN DOE"
                slotProps={{
                  htmlInput: {
                    autoComplete: 'cc-name',
                    style: { textTransform: 'uppercase' },
                  },
                }}
              />
            </Grid>
          )}
        </Grid>
      </Box>

      {(errorMessage || helperText) && (
        <FormHelperText sx={{ mt: 1 }}>
          {errorMessage ?? helperText}
        </FormHelperText>
      )}
    </FormControl>
  );
}

// Export validation utilities
export { validateLuhn, validateExpiry, detectCardType };
