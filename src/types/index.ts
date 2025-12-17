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
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> extends RHFBaseProps<TFieldValues, TName> {
  /** Label for the date picker */
  label?: string;
  /** Placeholder text */
  placeholder?: string;
  /** Minimum selectable date */
  minDate?: Date;
  /** Maximum selectable date */
  maxDate?: Date;
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
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> extends RHFBaseProps<TFieldValues, TName> {
  /** Label for the time picker */
  label?: string;
  /** Placeholder text */
  placeholder?: string;
  /** Use 12-hour format with AM/PM */
  ampm?: boolean;
  /** Minimum selectable time */
  minTime?: Date;
  /** Maximum selectable time */
  maxTime?: Date;
  /** Size variant */
  size?: 'small' | 'medium';
}

/**
 * Props for RHFDateTimePicker
 */
export interface RHFDateTimePickerProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> extends RHFBaseProps<TFieldValues, TName> {
  /** Label for the picker */
  label?: string;
  /** Placeholder text */
  placeholder?: string;
  /** Minimum selectable date/time */
  minDateTime?: Date;
  /** Maximum selectable date/time */
  maxDateTime?: Date;
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
