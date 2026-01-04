import type {
  Control,
  FieldPath,
  FieldValues,
  UseControllerProps,
  UseFormReturn,
  FieldArrayPath,
} from 'react-hook-form';
import type { TextFieldProps } from '@mui/material/TextField';
import type { SelectProps } from '@mui/material/Select';
import type { CheckboxProps } from '@mui/material/Checkbox';
import type { RadioGroupProps } from '@mui/material/RadioGroup';
import type { SwitchProps } from '@mui/material/Switch';
import type { SliderProps } from '@mui/material/Slider';
import type { RatingProps } from '@mui/material/Rating';
import type { ZodType } from 'zod';

// ============================================================================
// Base Props
// ============================================================================

/**
 * Base props shared by all RHF components
 */
export interface RHFBaseProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> extends Omit<UseControllerProps<TFieldValues, TName>, 'control'> {
  /** Form control from useForm - optional if using FormProvider */
  control?: Control<TFieldValues>;
  /** Helper text shown below the field */
  helperText?: string;
  /** Whether the field is required (auto-detected from schema if not provided) */
  required?: boolean;
  /** Whether the field is disabled */
  disabled?: boolean;
  /** Whether the field takes full width */
  fullWidth?: boolean;
}

// Type helper to omit conflicting props from MUI components
type OmitMUIConflicts<T> = Omit<T, 'name' | 'value' | 'onChange' | 'onBlur' | 'error' | 'required' | 'defaultValue' | 'helperText'>;

// ============================================================================
// Form Props
// ============================================================================

/**
 * Props for the Form component
 */
export interface FormProps<
  TFieldValues extends FieldValues,
  TSchema extends ZodType = ZodType
> {
  /** Zod schema for validation */
  schema: TSchema;
  /** Default values for the form */
  defaultValues?: Partial<TFieldValues>;
  /** Called on successful form submission */
  onSubmit: (data: TFieldValues) => void | Promise<void>;
  /** Called when form validation fails */
  onInvalid?: (errors: Record<string, unknown>) => void;
  /** Form content - can be ReactNode or render function */
  children: React.ReactNode | ((methods: UseFormReturn<TFieldValues>) => React.ReactNode);
  /** Validation mode */
  mode?: 'onChange' | 'onBlur' | 'onSubmit' | 'onTouched' | 'all';
  /** Reset form after successful submission */
  resetOnSuccess?: boolean;
  /** Show global error message at top of form */
  showGlobalError?: boolean;
  /** CSS class name for form element */
  className?: string;
  /** Form ID attribute */
  id?: string;
}

/**
 * Props for AsyncForm component
 */
export interface AsyncFormProps<
  TFieldValues extends FieldValues,
  TSchema extends ZodType = ZodType
> extends FormProps<TFieldValues, TSchema> {
  /** Component to show while loading */
  loadingComponent?: React.ReactNode;
}

// ============================================================================
// Text Field Props
// ============================================================================

/**
 * Props for RHFTextField
 */
export interface RHFTextFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> extends RHFBaseProps<TFieldValues, TName>,
    OmitMUIConflicts<TextFieldProps> {
  /** Transform functions for input/output */
  transform?: {
    input?: (value: unknown) => unknown;
    output?: (value: unknown) => unknown;
  };
}

/**
 * Props for RHFMaskedField
 *
 * Uses react-imask for input masking. Common mask patterns:
 * - `0` - any digit (0-9)
 * - `a` - any letter (a-z, A-Z)
 * - `*` - any character
 *
 * @example
 * ```tsx
 * // Phone number
 * <RHFMaskedField name="phone" mask="(000) 000-0000" />
 *
 * // Credit card
 * <RHFMaskedField name="card" mask="0000 0000 0000 0000" />
 *
 * // Custom pattern
 * <RHFMaskedField
 *   name="code"
 *   mask="AA-0000"
 *   definitions={{ A: /[A-Z]/ }}
 * />
 * ```
 */
export interface RHFMaskedFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> extends RHFBaseProps<TFieldValues, TName>,
    OmitMUIConflicts<TextFieldProps> {
  /**
   * Mask pattern string or IMask options object
   * - `0` - any digit
   * - `a` - any letter
   * - `*` - any character
   */
  mask: string | Record<string, unknown>;
  /**
   * Custom definitions for mask characters
   * @example { A: /[A-Z]/, '#': /[0-9]/ }
   */
  definitions?: Record<string, RegExp>;
  /** Whether to overwrite existing characters (default: undefined - uses IMask default) */
  overwrite?: boolean;
  /** Whether to show placeholder only when focused (default: true) */
  lazy?: boolean;
  /** Character to show for unfilled positions (default: '_') */
  placeholderChar?: string;
  /**
   * Whether to return unmasked value (default: true)
   * - `true` - returns value without mask characters (e.g., "1234567890")
   * - `false` - returns value with mask (e.g., "(123) 456-7890")
   * - `'typed'` - returns typed value
   */
  unmask?: boolean | 'typed';
  /** Callback when value is accepted */
  onAccept?: (value: string, maskRef: unknown) => void;
}

/**
 * Props for RHFNumberField
 */
export interface RHFNumberFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> extends RHFBaseProps<TFieldValues, TName>,
    Omit<OmitMUIConflicts<TextFieldProps>, 'type'> {
  /** Minimum value */
  min?: number;
  /** Maximum value */
  max?: number;
  /** Step increment */
  step?: number;
  /** Number of decimal places */
  decimalPlaces?: number;
  /** Allow negative numbers */
  allowNegative?: boolean;
}

/**
 * Props for RHFPasswordField
 */
export interface RHFPasswordFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> extends RHFBaseProps<TFieldValues, TName>,
    Omit<OmitMUIConflicts<TextFieldProps>, 'type'> {
  /** Show password visibility toggle */
  showToggle?: boolean;
}

/**
 * Props for RHFTextArea
 */
export interface RHFTextAreaProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> extends RHFBaseProps<TFieldValues, TName>,
    Omit<OmitMUIConflicts<TextFieldProps>, 'multiline'> {
  /** Minimum number of rows */
  minRows?: number;
  /** Maximum number of rows */
  maxRows?: number;
  /** Show character count */
  showCharacterCount?: boolean;
  /** Maximum character length */
  maxLength?: number;
}

// ============================================================================
// Select Props
// ============================================================================

/**
 * Option type for select/autocomplete components
 */
export interface SelectOption<TValue = string | number> {
  value: TValue;
  label: string;
  disabled?: boolean;
  group?: string;
  [key: string]: unknown;
}

/**
 * Props for RHFSelect
 */
export interface RHFSelectProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TValue = string | number
> extends RHFBaseProps<TFieldValues, TName>,
    OmitMUIConflicts<SelectProps> {
  /** Options to display */
  options: SelectOption<TValue>[];
  /** Label for the select */
  label?: string;
  /** Placeholder when no value selected */
  placeholder?: string;
  /** Allow clearing the selection */
  clearable?: boolean;
  /** Size variant */
  size?: 'small' | 'medium';
}

// ============================================================================
// Autocomplete Props
// ============================================================================

/**
 * Base props for autocomplete components
 */
export interface RHFAutocompleteBaseProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TOption extends SelectOption = SelectOption
> extends RHFBaseProps<TFieldValues, TName> {
  /** Label for the autocomplete */
  label?: string;
  /** Placeholder text */
  placeholder?: string;
  /** Size variant */
  size?: 'small' | 'medium';
  /** Custom option renderer */
  renderOptionContent?: (option: TOption) => React.ReactNode;
  /** Group options by this key */
  groupBy?: (option: TOption) => string;
  /** Allow clearing selection */
  clearable?: boolean;
  /** Loading state */
  loading?: boolean;
  /** Text to show when loading */
  loadingText?: string;
  /** Text to show when no options */
  noOptionsText?: string;
  /**
   * Callback when option selection changes
   * Provides both the value and the full option object
   * Useful for syncing related fields (e.g., copying label to another field)
   */
  onChangeOption?: (value: TOption['value'] | null, option: TOption | null) => void;
}

/**
 * Props for RHFAutocomplete (single select)
 */
export interface RHFAutocompleteProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TOption extends SelectOption = SelectOption
> extends RHFAutocompleteBaseProps<TFieldValues, TName, TOption> {
  /** Options to display */
  options: TOption[];
}

/**
 * Props for RHFMultiAutocomplete
 */
export interface RHFMultiAutocompleteProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TOption extends SelectOption = SelectOption
> extends RHFAutocompleteBaseProps<TFieldValues, TName, TOption> {
  /** Options to display */
  options: TOption[];
  /** Maximum number of selections */
  maxSelections?: number;
  /** Number of tags to show before "+N more" */
  limitTags?: number;
  /** Custom chip renderer */
  renderChip?: (option: TOption, onDelete: () => void) => React.ReactNode;
}

/**
 * Props for RHFAsyncAutocomplete
 */
export interface RHFAsyncAutocompleteProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TOption extends SelectOption = SelectOption
> extends RHFAutocompleteBaseProps<TFieldValues, TName, TOption> {
  /** Function to fetch options based on search term */
  fetchOptions: (search: string, signal: AbortSignal) => Promise<TOption[]>;
  /** Debounce delay in ms */
  debounceMs?: number;
  /** Minimum characters before searching */
  minSearchLength?: number;
  /** Cache key for storing results */
  cacheKey?: string;
  /** Initial option for edit forms */
  initialOption?: TOption | null;
}

/**
 * Props for RHFCreatableAutocomplete
 */
export interface RHFCreatableAutocompleteProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TOption extends SelectOption = SelectOption
> extends RHFAutocompleteBaseProps<TFieldValues, TName, TOption> {
  /** Options to display */
  options: TOption[];
  /** Called when creating a new option */
  onCreate?: (inputValue: string) => TOption | Promise<TOption>;
  /** Text for "Add new" option */
  addNewText?: string;
}

// ============================================================================
// Checkbox/Radio/Switch Props
// ============================================================================

/**
 * Props for RHFCheckbox
 */
export interface RHFCheckboxProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> extends RHFBaseProps<TFieldValues, TName>,
    Omit<CheckboxProps, 'name' | 'checked' | 'onChange' | 'onBlur' | 'required' | 'defaultValue' | 'defaultChecked'> {
  /** Label for the checkbox */
  label?: string;
  /** Label placement */
  labelPlacement?: 'end' | 'start' | 'top' | 'bottom';
}

/**
 * Props for RHFCheckboxGroup
 */
export interface RHFCheckboxGroupProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> extends RHFBaseProps<TFieldValues, TName> {
  /** Options to display */
  options: SelectOption[];
  /** Group label */
  label?: string;
  /** Layout direction */
  row?: boolean;
}

/**
 * Props for RHFRadioGroup
 */
export interface RHFRadioGroupProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> extends RHFBaseProps<TFieldValues, TName>,
    Omit<RadioGroupProps, 'name' | 'value' | 'onChange' | 'onBlur' | 'defaultValue'> {
  /** Options to display */
  options: SelectOption[];
  /** Group label */
  label?: string;
}

/**
 * Props for RHFSwitch
 */
export interface RHFSwitchProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> extends RHFBaseProps<TFieldValues, TName>,
    Omit<SwitchProps, 'name' | 'checked' | 'onChange' | 'onBlur' | 'required' | 'defaultValue' | 'defaultChecked'> {
  /** Label for the switch */
  label?: string;
  /** Label placement */
  labelPlacement?: 'end' | 'start' | 'top' | 'bottom';
}

// ============================================================================
// Date/Time Props
// ============================================================================

/**
 * Props for RHFDatePicker
 */
export interface RHFDatePickerProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TDate = unknown
> extends RHFBaseProps<TFieldValues, TName> {
  /** Label for the date picker */
  label?: string;
  /** Placeholder text */
  placeholder?: string;
  /** Minimum selectable date (Date, Dayjs, or any date adapter value) */
  minDate?: TDate;
  /** Maximum selectable date (Date, Dayjs, or any date adapter value) */
  maxDate?: TDate;
  /** Date format string */
  format?: string;
  /** Disable future dates */
  disableFuture?: boolean;
  /** Disable past dates */
  disablePast?: boolean;
  /** Size variant */
  size?: 'small' | 'medium';
  /** Open picker to this view initially */
  openTo?: 'day' | 'month' | 'year';
  /** Available views */
  views?: ('day' | 'month' | 'year')[];
}

/**
 * Props for RHFTimePicker
 */
export interface RHFTimePickerProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TDate = unknown
> extends RHFBaseProps<TFieldValues, TName> {
  /** Label for the time picker */
  label?: string;
  /** Placeholder text */
  placeholder?: string;
  /** Use 12-hour format with AM/PM */
  ampm?: boolean;
  /** Minimum selectable time (Date, Dayjs, or any date adapter value) */
  minTime?: TDate;
  /** Maximum selectable time (Date, Dayjs, or any date adapter value) */
  maxTime?: TDate;
  /** Size variant */
  size?: 'small' | 'medium';
}

/**
 * Props for RHFDateTimePicker
 */
export interface RHFDateTimePickerProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TDate = unknown
> extends RHFBaseProps<TFieldValues, TName> {
  /** Label for the picker */
  label?: string;
  /** Placeholder text */
  placeholder?: string;
  /** Minimum selectable date/time (Date, Dayjs, or any date adapter value) */
  minDateTime?: TDate;
  /** Maximum selectable date/time (Date, Dayjs, or any date adapter value) */
  maxDateTime?: TDate;
  /** Use 12-hour format with AM/PM */
  ampm?: boolean;
  /** Size variant */
  size?: 'small' | 'medium';
}

// ============================================================================
// Field Array Props
// ============================================================================

/**
 * Render props passed to field array children
 */
export interface FieldArrayRenderProps {
  /** Current index in the array */
  index: number;
  /** Total number of items */
  total: number;
  /** Remove this item */
  remove: () => void;
  /** Move item up */
  moveUp: () => void;
  /** Move item down */
  moveDown: () => void;
  /** Whether this is the first item */
  isFirst: boolean;
  /** Whether this is the last item */
  isLast: boolean;
  /** Name prefix for nested fields (e.g., "items.0") */
  namePrefix: string;
}

/**
 * Props for RHFFieldArray
 */
export interface RHFFieldArrayProps<
  TFieldValues extends FieldValues = FieldValues,
  TFieldArrayName extends FieldArrayPath<TFieldValues> = FieldArrayPath<TFieldValues>
> {
  /** Field array name */
  name: TFieldArrayName;
  /** Form control */
  control?: Control<TFieldValues>;
  /** Default value for new items */
  defaultValue: Record<string, unknown>;
  /** Minimum number of items */
  minItems?: number;
  /** Maximum number of items */
  maxItems?: number;
  /** Title displayed above the array */
  title?: string;
  /** Add button text */
  addButtonText?: string;
  /** Whether items can be reordered */
  reorderable?: boolean;
  /** Visual variant */
  variant?: 'default' | 'card' | 'compact';
  /** Callback when item count changes */
  onItemsChange?: (count: number) => void;
  /** Render function for each item */
  children: (props: FieldArrayRenderProps) => React.ReactNode;
}

// ============================================================================
// Utility Component Props
// ============================================================================

/**
 * Props for RHFSlider
 */
export interface RHFSliderProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> extends RHFBaseProps<TFieldValues, TName>,
    Omit<SliderProps, 'name' | 'value' | 'onChange' | 'onBlur' | 'defaultValue'> {
  /** Label for the slider */
  label?: string;
  /** Show current value */
  showValue?: boolean;
  /** Format function for displayed value */
  formatValue?: (value: number) => string;
}

/**
 * Props for RHFRating
 */
export interface RHFRatingProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> extends RHFBaseProps<TFieldValues, TName>,
    Omit<RatingProps, 'name' | 'value' | 'onChange' | 'onBlur' | 'defaultValue'> {
  /** Label for the rating */
  label?: string;
  /** Show numeric value */
  showValue?: boolean;
}

/**
 * Props for RHFOTP (One-Time Password)
 */
export interface RHFOTPProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> extends RHFBaseProps<TFieldValues, TName> {
  /** Number of OTP digits (default: 6) */
  length?: number;
  /** Auto-focus first input */
  autoFocus?: boolean;
  /** MUI TextField variant */
  variant?: 'outlined' | 'filled' | 'standard';
  /** Size of input boxes */
  size?: 'small' | 'medium';
  /** Input type - 'number' restricts to digits only */
  type?: 'text' | 'number';
  /** Label for the OTP input */
  label?: string;
  /** Called when all digits are entered */
  onComplete?: (otp: string) => void;
  /** Separator character between groups (e.g., "-") */
  separator?: string;
  /** Position(s) to show separator (e.g., "3" or "3,6") */
  separatorPosition?: string;
}

/**
 * Props for RHFColorPicker
 */
export interface RHFColorPickerProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> extends RHFBaseProps<TFieldValues, TName> {
  /** Label for the color picker */
  label?: string;
  /** Preset color options */
  presets?: string[];
  /** Show alpha channel slider */
  showAlpha?: boolean;
  /** Color format for value */
  format?: 'hex' | 'rgb' | 'hsl';
  /** Size variant */
  size?: 'small' | 'medium';
}

/**
 * Props for RHFPhoneInput
 */
export interface RHFPhoneInputProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> extends RHFBaseProps<TFieldValues, TName> {
  /** Label for the phone input */
  label?: string;
  /** Placeholder text */
  placeholder?: string;
  /** Default country code (e.g., "US", "IN") */
  defaultCountry?: string;
  /** Only allow these countries */
  countries?: string[];
  /** International or national format */
  international?: boolean;
  /** Size variant */
  size?: 'small' | 'medium';
  /** Called when country changes */
  onCountryChange?: (country: string | undefined) => void;
}

/**
 * Props for RHFRichText
 */
export interface RHFRichTextProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> extends RHFBaseProps<TFieldValues, TName> {
  /** Label for the editor */
  label?: string;
  /** Placeholder text */
  placeholder?: string;
  /** Minimum height of editor */
  minHeight?: number | string;
  /** Maximum height of editor (enables scroll) */
  maxHeight?: number | string;
  /** Output format */
  outputFormat?: 'html' | 'json' | 'text';
  /** Toolbar options to show */
  toolbar?: ('bold' | 'italic' | 'underline' | 'strike' | 'heading' | 'bulletList' | 'orderedList' | 'blockquote' | 'link' | 'code' | 'codeBlock')[];
  /** Enable mentions (@username) */
  mentions?: boolean;
  /** Mention suggestions */
  mentionSuggestions?: Array<{ id: string; label: string }>;
}

/**
 * Props for RHFSignature
 */
export interface RHFSignatureProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> extends RHFBaseProps<TFieldValues, TName> {
  /** Label for the signature pad */
  label?: string;
  /** Width of signature canvas */
  width?: number;
  /** Height of signature canvas */
  height?: number;
  /** Pen color */
  penColor?: string;
  /** Background color */
  backgroundColor?: string;
  /** Line width/thickness */
  lineWidth?: number;
  /** Output format */
  outputFormat?: 'base64' | 'svg' | 'blob';
  /** Show clear button */
  showClearButton?: boolean;
  /** Clear button text */
  clearButtonText?: string;
}

/**
 * Props for RHFFileUpload
 */
export interface RHFFileUploadProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> extends RHFBaseProps<TFieldValues, TName> {
  /** Label text */
  label?: string;
  /** Accepted file types (e.g., "image/*,.pdf") */
  accept?: string;
  /** Allow multiple files */
  multiple?: boolean;
  /** Maximum file size in bytes */
  maxSize?: number;
  /** Maximum number of files (when multiple) */
  maxFiles?: number;
  /** Variant style */
  variant?: 'button' | 'dropzone';
  /** Button text */
  buttonText?: string;
  /** Dropzone text */
  dropzoneText?: string;
  /** Show file preview */
  showPreview?: boolean;
}

// ============================================================================
// India-Specific Field Props
// ============================================================================

/**
 * Props for RHFAmountField (Indian currency)
 */
export interface RHFAmountFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> extends RHFBaseProps<TFieldValues, TName>,
    Omit<OmitMUIConflicts<TextFieldProps>, 'type'> {
  /** Currency symbol */
  currency?: string;
  /** Locale for formatting */
  locale?: string;
  /** Number of decimal places */
  decimalPlaces?: number;
}

/**
 * Props for RHFAadhaarField
 */
export interface RHFAadhaarFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> extends RHFBaseProps<TFieldValues, TName>,
    OmitMUIConflicts<TextFieldProps> {
  /** Enable masking (show only last 4 digits) */
  masked?: boolean;
}

/**
 * Props for RHFPanField
 */
export interface RHFPanFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> extends RHFBaseProps<TFieldValues, TName>,
    OmitMUIConflicts<TextFieldProps> {}

/**
 * Props for RHFMobileField
 */
export interface RHFMobileFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> extends RHFBaseProps<TFieldValues, TName>,
    OmitMUIConflicts<TextFieldProps> {
  /** Show country code prefix */
  showCountryCode?: boolean;
  /** Country code */
  countryCode?: string;
}

/**
 * Props for RHFIfscField
 */
export interface RHFIfscFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> extends RHFBaseProps<TFieldValues, TName>,
    OmitMUIConflicts<TextFieldProps> {
  /** Callback with bank details when valid IFSC entered */
  onBankDetails?: (details: { bank: string; branch: string } | null) => void;
}

/**
 * Props for RHFPincodeField
 */
export interface RHFPincodeFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> extends RHFBaseProps<TFieldValues, TName>,
    OmitMUIConflicts<TextFieldProps> {
  /** Callback with location details when valid pincode entered */
  onLocationDetails?: (details: { city: string; state: string; district: string } | null) => void;
}

/**
 * Props for RHFGstField
 */
export interface RHFGstFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> extends RHFBaseProps<TFieldValues, TName>,
    OmitMUIConflicts<TextFieldProps> {}

// ============================================================================
// Schema Context Types
// ============================================================================

/**
 * Field metadata extracted from Zod schema
 */
export interface FieldMeta {
  required: boolean;
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  description?: string;
}

/**
 * Schema context value
 */
export interface SchemaContextValue {
  schema: ZodType | null;
  getFieldMeta: (path: string) => FieldMeta;
  isFieldRequired: (path: string) => boolean;
}


// ============================================================================
// Transfer List Props
// ============================================================================

/**
 * Item for transfer list
 */
export interface TransferListItem {
  /** Unique value for the item */
  value: string | number;
  /** Display label */
  label: string;
  /** Optional description */
  description?: string;
  /** Whether item is disabled */
  disabled?: boolean;
}

/**
 * Props for RHFTransferList
 */
export interface RHFTransferListProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> extends RHFBaseProps<TFieldValues, TName> {
  /** Label for the component */
  label?: string;
  /** All available items */
  items: TransferListItem[];
  /** Title for left (available) list */
  leftTitle?: string;
  /** Title for right (selected) list */
  rightTitle?: string;
  /** Enable search in lists */
  searchable?: boolean;
  /** Search placeholder text */
  searchPlaceholder?: string;
  /** Height of each list */
  height?: number | string;
  /** Message when left list is empty */
  emptyLeftMessage?: string;
  /** Message when right list is empty */
  emptyRightMessage?: string;
}

// ============================================================================
// Tree Select Props
// ============================================================================

/**
 * Node for tree select
 */
export interface TreeNode {
  /** Unique value for the node */
  value: string | number;
  /** Display label */
  label: string;
  /** Optional description */
  description?: string;
  /** Whether node is disabled */
  disabled?: boolean;
  /** Child nodes */
  children?: TreeNode[];
}

/**
 * Props for RHFTreeSelect
 */
export interface RHFTreeSelectProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> extends RHFBaseProps<TFieldValues, TName> {
  /** Label for the select */
  label?: string;
  /** Placeholder text */
  placeholder?: string;
  /** Tree nodes to display */
  nodes: TreeNode[];
  /** Allow multiple selection */
  multiple?: boolean;
  /** Show checkboxes for selection */
  checkboxSelection?: boolean;
  /** Expand all nodes by default */
  expandAll?: boolean;
  /** Size variant */
  size?: 'small' | 'medium';
  /** Maximum height of dropdown */
  maxHeight?: number;
  /** Allow clearing selection */
  clearable?: boolean;
}

// ============================================================================
// Date Range Picker Props
// ============================================================================

/**
 * Date range value type
 */
export interface DateRange<TDate = unknown> {
  /** Start date */
  start: TDate | null;
  /** End date */
  end: TDate | null;
}

/**
 * Date range preset
 */
export interface DateRangePreset<TDate = unknown> {
  /** Display label for preset */
  label: string;
  /** Function to get the date range values */
  getValue: () => DateRange<TDate>;
}

/**
 * Props for RHFDateRangePicker
 */
export interface RHFDateRangePickerProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TDate = unknown
> extends RHFBaseProps<TFieldValues, TName> {
  /** Label for the component */
  label?: string;
  /** Label for start date picker */
  startLabel?: string;
  /** Label for end date picker */
  endLabel?: string;
  /** Date format string */
  format?: string;
  /** Minimum selectable date */
  minDate?: TDate;
  /** Maximum selectable date */
  maxDate?: TDate;
  /** Disable future dates */
  disableFuture?: boolean;
  /** Disable past dates */
  disablePast?: boolean;
  /** Size variant */
  size?: 'small' | 'medium';
  /** Layout direction */
  direction?: 'row' | 'column';
  /** Spacing between pickers */
  spacing?: number;
  /** Separator text between pickers */
  separator?: string;
  /** Show preset buttons */
  showPresets?: boolean;
  /** Preset date ranges */
  presets?: DateRangePreset<TDate>[];
}

// ============================================================================
// Credit Card Props
// ============================================================================

/**
 * Supported card types
 */
export type CardType = 'visa' | 'mastercard' | 'amex' | 'discover' | 'diners' | 'jcb' | 'rupay';

/**
 * Credit card value type
 */
export interface CreditCardValue {
  /** Card number (digits only) */
  number: string;
  /** Expiry date (MMYY format) */
  expiry: string;
  /** CVV/CVC code */
  cvv: string;
  /** Cardholder name (optional) */
  cardholderName?: string;
  /** Detected card type */
  cardType?: CardType | 'unknown';
}

/**
 * Props for RHFCreditCard
 */
export interface RHFCreditCardProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> extends RHFBaseProps<TFieldValues, TName> {
  /** Label for the component */
  label?: string;
  /** Size variant */
  size?: 'small' | 'medium';
  /** Show cardholder name field */
  showCardholderName?: boolean;
  /** Accepted card types */
  acceptedCards?: CardType[];
  /** Called when card type is detected */
  onCardTypeChange?: (cardType: CardType | 'unknown') => void;
}

// ============================================================================
// Address Autocomplete Props
// ============================================================================

/**
 * Address suggestion from autocomplete
 */
export interface AddressSuggestion {
  /** Place ID (for Google Places) */
  placeId: string;
  /** Full description/address text */
  description: string;
  /** Main text (usually street/place name) */
  mainText?: string;
  /** Secondary text (usually city, state) */
  secondaryText?: string;
}

/**
 * Parsed address value
 */
export interface AddressValue {
  /** Full formatted address */
  formatted: string;
  /** Street address */
  street?: string;
  /** City/locality */
  city?: string;
  /** State/province */
  state?: string;
  /** State/province code */
  stateCode?: string;
  /** Postal/ZIP code */
  postalCode?: string;
  /** Country name */
  country?: string;
  /** Country code (ISO 3166-1 alpha-2) */
  countryCode?: string;
  /** Latitude */
  lat?: number;
  /** Longitude */
  lng?: number;
  /** Place ID (for Google Places) */
  placeId?: string;
}

/**
 * Props for RHFAddressAutocomplete
 */
export interface RHFAddressAutocompleteProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> extends RHFBaseProps<TFieldValues, TName> {
  /** Label for the component */
  label?: string;
  /** Placeholder text */
  placeholder?: string;
  /** Size variant */
  size?: 'small' | 'medium';
  /** Google Maps API key (required for Google Places) */
  apiKey?: string;
  /** Restrict to specific countries (ISO 3166-1 alpha-2 codes) */
  countries?: string[];
  /** Place types to search for */
  types?: string[];
  /** Show parsed address fields below input */
  showParsedFields?: boolean;
  /** Debounce delay in ms */
  debounceMs?: number;
  /** Minimum characters before searching */
  minChars?: number;
  /** Custom function to fetch suggestions (for non-Google providers) */
  fetchSuggestions?: (input: string) => Promise<AddressSuggestion[]>;
  /** Custom function to get full address from suggestion */
  onSelectSuggestion?: (suggestion: AddressSuggestion) => Promise<AddressValue>;
  /** Called when address is selected */
  onAddressSelect?: (address: AddressValue) => void;
}
