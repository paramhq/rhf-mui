/**
 * Formatting utilities for form fields
 */

// ============================================================================
// Indian Currency Formatting
// ============================================================================

/**
 * Format a number as Indian currency (e.g., 1,00,000.00)
 */
export function formatIndianCurrency(
  value: number | null | undefined,
  decimalPlaces = 2,
  locale = 'en-IN'
): string {
  if (value === null || value === undefined || isNaN(value)) return '';

  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces,
  }).format(value);
}

/**
 * Parse Indian currency string to number
 */
export function parseIndianCurrency(value: string): number | null {
  if (!value) return null;

  // Remove currency symbol and whitespace
  const cleaned = value.replace(/[₹$€£\s]/g, '').replace(/,/g, '');
  const parsed = parseFloat(cleaned);

  return isNaN(parsed) ? null : parsed;
}

// ============================================================================
// Aadhaar Formatting
// ============================================================================

/**
 * Format Aadhaar number with spaces (XXXX XXXX XXXX)
 */
export function formatAadhaar(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 12);
  const parts = [];

  for (let i = 0; i < digits.length; i += 4) {
    parts.push(digits.slice(i, i + 4));
  }

  return parts.join(' ');
}

/**
 * Format Aadhaar with masking (XXXX XXXX 1234)
 */
export function formatAadhaarMasked(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 12);
  if (digits.length !== 12) return formatAadhaar(digits);

  return `XXXX XXXX ${digits.slice(8)}`;
}

/**
 * Get raw Aadhaar digits (remove formatting)
 */
export function parseAadhaar(value: string): string {
  return value.replace(/\D/g, '').slice(0, 12);
}

/**
 * Validate Aadhaar using Verhoeff algorithm
 */
export function validateAadhaarChecksum(aadhaar: string): boolean {
  const digits = aadhaar.replace(/\D/g, '');
  if (digits.length !== 12) return false;

  // Verhoeff algorithm tables
  const d = [
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    [1, 2, 3, 4, 0, 6, 7, 8, 9, 5],
    [2, 3, 4, 0, 1, 7, 8, 9, 5, 6],
    [3, 4, 0, 1, 2, 8, 9, 5, 6, 7],
    [4, 0, 1, 2, 3, 9, 5, 6, 7, 8],
    [5, 9, 8, 7, 6, 0, 4, 3, 2, 1],
    [6, 5, 9, 8, 7, 1, 0, 4, 3, 2],
    [7, 6, 5, 9, 8, 2, 1, 0, 4, 3],
    [8, 7, 6, 5, 9, 3, 2, 1, 0, 4],
    [9, 8, 7, 6, 5, 4, 3, 2, 1, 0],
  ];

  const p = [
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
    [5, 8, 0, 3, 7, 9, 6, 1, 4, 2],
    [8, 9, 1, 6, 0, 4, 3, 5, 2, 7],
    [9, 4, 5, 3, 1, 2, 6, 8, 7, 0],
    [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
    [2, 7, 9, 3, 8, 0, 6, 4, 1, 5],
    [7, 0, 4, 6, 9, 1, 3, 2, 5, 8],
  ];

  let c = 0;
  const reversedDigits = digits.split('').reverse().map(Number);

  for (let i = 0; i < reversedDigits.length; i++) {
    c = d[c][p[i % 8][reversedDigits[i]]];
  }

  return c === 0;
}

// ============================================================================
// PAN Formatting
// ============================================================================

/**
 * Format PAN to uppercase with position validation
 * PAN format: ABCDE1234F (5 letters, 4 digits, 1 letter)
 */
export function formatPan(value: string): string {
  const upper = value.toUpperCase();
  let result = '';

  for (let i = 0; i < upper.length && result.length < 10; i++) {
    const char = upper[i];
    const pos = result.length;

    // Positions 0-4: Letters only
    if (pos < 5 && /[A-Z]/.test(char)) {
      result += char;
    }
    // Positions 5-8: Digits only
    else if (pos >= 5 && pos < 9 && /\d/.test(char)) {
      result += char;
    }
    // Position 9: Letter only
    else if (pos === 9 && /[A-Z]/.test(char)) {
      result += char;
    }
  }

  return result;
}

/**
 * Validate PAN format
 */
export function validatePanFormat(pan: string): boolean {
  return /^[A-Z]{5}\d{4}[A-Z]$/.test(pan.toUpperCase());
}

// ============================================================================
// Mobile Number Formatting
// ============================================================================

/**
 * Format Indian mobile number
 */
export function formatMobile(value: string, includeCountryCode = false): string {
  const digits = value.replace(/\D/g, '');

  // Remove leading country code if present
  let mobile = digits;
  if (digits.startsWith('91') && digits.length > 10) {
    mobile = digits.slice(2);
  }

  mobile = mobile.slice(0, 10);

  if (includeCountryCode && mobile.length === 10) {
    return `+91 ${mobile.slice(0, 5)} ${mobile.slice(5)}`;
  }

  return mobile;
}

/**
 * Parse mobile number to 10 digits
 */
export function parseMobile(value: string): string {
  const digits = value.replace(/\D/g, '');

  if (digits.startsWith('91') && digits.length > 10) {
    return digits.slice(2, 12);
  }

  return digits.slice(0, 10);
}

// ============================================================================
// IFSC Code Formatting
// ============================================================================

/**
 * Format IFSC code (e.g., HDFC0001234)
 */
export function formatIfsc(value: string): string {
  const upper = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
  return upper.slice(0, 11);
}

/**
 * Validate IFSC format
 * Format: 4 letters (bank code) + 0 + 6 alphanumeric (branch code)
 */
export function validateIfscFormat(ifsc: string): boolean {
  return /^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc.toUpperCase());
}

// ============================================================================
// Pincode Formatting
// ============================================================================

/**
 * Format Indian pincode (6 digits)
 */
export function formatPincode(value: string): string {
  return value.replace(/\D/g, '').slice(0, 6);
}

/**
 * Validate pincode format
 */
export function validatePincodeFormat(pincode: string): boolean {
  const digits = pincode.replace(/\D/g, '');
  // Indian pincodes start with 1-9 (not 0)
  return /^[1-9]\d{5}$/.test(digits);
}

// ============================================================================
// GST Number Formatting
// ============================================================================

/**
 * Format GSTIN (15 characters)
 * Format: 2 digits (state) + 10 chars (PAN) + 1 char (entity) + 1 char (Z default) + 1 checksum
 */
export function formatGst(value: string): string {
  const upper = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
  return upper.slice(0, 15);
}

/**
 * Validate GSTIN format
 */
export function validateGstFormat(gst: string): boolean {
  return /^\d{2}[A-Z]{5}\d{4}[A-Z]\d[Z][A-Z\d]$/.test(gst.toUpperCase());
}

// ============================================================================
// General Number Formatting
// ============================================================================

/**
 * Format number with specified decimal places
 */
export function formatNumber(
  value: number | null | undefined,
  decimalPlaces = 2,
  locale = 'en-IN'
): string {
  if (value === null || value === undefined || isNaN(value)) return '';

  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces,
  }).format(value);
}

/**
 * Parse formatted number string to number
 */
export function parseNumber(value: string): number | null {
  if (!value) return null;
  const cleaned = value.replace(/,/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? null : parsed;
}
