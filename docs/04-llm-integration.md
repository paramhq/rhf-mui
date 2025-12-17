# LLM Integration Guide

This document is optimized for AI coding assistants (Claude, GPT, Copilot, etc.) to quickly understand and use @paramhq/forms.

## Quick Reference

### Package Info
- **Name**: `@paramhq/forms`
- **Purpose**: React Hook Form + MUI + Zod form components
- **Peer Dependencies**: react, react-hook-form, @hookform/resolvers, zod, @mui/material, @emotion/react, @emotion/styled

### Installation Command
```bash
npm install @paramhq/forms react-hook-form @hookform/resolvers zod @mui/material @emotion/react @emotion/styled
```

---

## Component Patterns

### Pattern 1: Basic Form
```tsx
import { Form, RHFTextField, RHFSelect } from '@paramhq/forms';
import { z } from 'zod';
import { Button } from '@mui/material';

const schema = z.object({
  fieldName: z.string().min(1, 'Required'),
});

<Form schema={schema} defaultValues={{ fieldName: '' }} onSubmit={(data) => console.log(data)}>
  <RHFTextField name="fieldName" label="Label" />
  <Button type="submit">Submit</Button>
</Form>
```

### Pattern 2: Select/Dropdown
```tsx
<RHFSelect
  name="fieldName"
  label="Label"
  options={[
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
  ]}
/>
```

### Pattern 3: Checkbox/Switch
```tsx
<RHFCheckbox name="acceptTerms" label="I accept the terms" />
<RHFSwitch name="enableNotifications" label="Enable notifications" />
```

### Pattern 4: Date Picker (requires @mui/x-date-pickers + dayjs)
```tsx
import dayjs from 'dayjs';

<RHFDatePicker name="date" label="Date" disableFuture />
<RHFDatePicker name="date" label="Date" minDate={dayjs()} />
<RHFTimePicker name="time" label="Time" ampm={false} />
<RHFDateTimePicker name="dateTime" label="Date & Time" />
```

### Pattern 5: Autocomplete
```tsx
<RHFAutocomplete
  name="item"
  label="Search"
  options={[{ id: 1, name: 'Item 1' }, { id: 2, name: 'Item 2' }]}
  getOptionLabel={(opt) => opt.name}
/>
```

### Pattern 6: Multi-select Autocomplete
```tsx
<RHFMultiAutocomplete
  name="tags"
  label="Tags"
  options={['tag1', 'tag2', 'tag3']}
/>
```

### Pattern 7: Async Autocomplete
```tsx
<RHFAsyncAutocomplete
  name="user"
  label="Search User"
  loadOptions={async (query) => {
    const res = await fetch(`/api/users?q=${query}`);
    return res.json();
  }}
  getOptionLabel={(opt) => opt.name}
/>
```

### Pattern 8: Field Array (Dynamic Fields)
```tsx
<RHFFieldArray
  name="items"
  render={({ fields, append, remove }) => (
    <>
      {fields.map((field, index) => (
        <Box key={field.id}>
          <RHFTextField name={`items.${index}.name`} label="Name" />
          <IconButton onClick={() => remove(index)}><DeleteIcon /></IconButton>
        </Box>
      ))}
      <Button onClick={() => append({ name: '' })}>Add Item</Button>
    </>
  )}
/>
```

---

## Zod Schema Patterns

### String Fields
```tsx
z.string()                           // Optional string
z.string().min(1, 'Required')        // Required string
z.string().email('Invalid email')    // Email validation
z.string().url('Invalid URL')        // URL validation
z.string().regex(/pattern/, 'msg')   // Regex validation
```

### Number Fields
```tsx
z.number()                           // Number
z.number().min(0, 'Must be positive')
z.number().max(100)
z.coerce.number()                    // Coerce string to number
```

### Boolean Fields
```tsx
z.boolean()                          // Checkbox/Switch
z.boolean().refine(v => v === true, 'Must accept')  // Required checkbox
```

### Arrays
```tsx
z.array(z.string())                  // Array of strings
z.array(z.object({ name: z.string() }))  // Array of objects
```

### Date Fields
```tsx
z.any()                              // For dayjs objects
z.any().refine(val => val !== null, 'Date required')
```

### Optional Fields
```tsx
z.string().optional()                // Optional
z.string().nullable()                // Can be null
```

---

## Complete Form Example

```tsx
import { Form, RHFTextField, RHFSelect, RHFCheckbox, RHFDatePicker } from '@paramhq/forms';
import { z } from 'zod';
import { Button, Stack } from '@mui/material';

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  role: z.string().min(1, 'Select a role'),
  birthDate: z.any().refine(v => v !== null, 'Birth date required'),
  acceptTerms: z.boolean().refine(v => v === true, 'Must accept terms'),
});

type FormData = z.infer<typeof schema>;

function UserForm() {
  const handleSubmit = (data: FormData) => {
    console.log(data);
  };

  return (
    <Form
      schema={schema}
      defaultValues={{
        name: '',
        email: '',
        role: '',
        birthDate: null,
        acceptTerms: false,
      }}
      onSubmit={handleSubmit}
    >
      <Stack spacing={2}>
        <RHFTextField name="name" label="Name" />
        <RHFTextField name="email" label="Email" type="email" />
        <RHFSelect
          name="role"
          label="Role"
          options={[
            { value: 'admin', label: 'Admin' },
            { value: 'user', label: 'User' },
          ]}
        />
        <RHFDatePicker name="birthDate" label="Birth Date" disableFuture />
        <RHFCheckbox name="acceptTerms" label="I accept the terms and conditions" />
        <Button type="submit" variant="contained">Submit</Button>
      </Stack>
    </Form>
  );
}
```

---

## Component Quick Reference Table

| Component | Use For | Key Props |
|-----------|---------|-----------|
| `RHFTextField` | Text input | `name`, `label`, `type`, `placeholder` |
| `RHFNumberField` | Numeric input | `name`, `label`, `min`, `max`, `step` |
| `RHFPasswordField` | Password | `name`, `label`, `showToggle` |
| `RHFTextArea` | Multiline text | `name`, `label`, `rows`, `maxRows` |
| `RHFSelect` | Dropdown | `name`, `label`, `options` |
| `RHFRadioGroup` | Radio buttons | `name`, `label`, `options`, `row` |
| `RHFCheckbox` | Single checkbox | `name`, `label` |
| `RHFCheckboxGroup` | Multiple checkboxes | `name`, `label`, `options` |
| `RHFSwitch` | Toggle switch | `name`, `label` |
| `RHFAutocomplete` | Search/select | `name`, `label`, `options`, `getOptionLabel` |
| `RHFMultiAutocomplete` | Multi-select | `name`, `label`, `options` |
| `RHFAsyncAutocomplete` | Async search | `name`, `label`, `loadOptions`, `getOptionLabel` |
| `RHFDatePicker` | Date selection | `name`, `label`, `disableFuture`, `disablePast` |
| `RHFTimePicker` | Time selection | `name`, `label`, `ampm` |
| `RHFDateTimePicker` | Date + time | `name`, `label`, `minDateTime` |
| `RHFFieldArray` | Dynamic list | `name`, `render` |
| `RHFSlider` | Range slider | `name`, `label`, `min`, `max` |
| `RHFRating` | Star rating | `name`, `label`, `max` |

---

## India-Specific Components

| Component | Purpose | Auto-Validation |
|-----------|---------|-----------------|
| `RHFAmountField` | Indian currency (₹) | Lakh/Crore formatting |
| `RHFAadhaarField` | 12-digit Aadhaar | Verhoeff checksum |
| `RHFPanField` | PAN card | AAAAA9999A format |
| `RHFMobileField` | Indian mobile | +91 prefix, 10 digits |
| `RHFIfscField` | IFSC code | Bank lookup via API |
| `RHFPincodeField` | 6-digit pincode | Location lookup via API |
| `RHFGstField` | 15-char GST | State code + checksum |

### IFSC with Bank Details
```tsx
<RHFIfscField
  name="ifsc"
  label="IFSC Code"
  onBankDetails={(details) => {
    // details.bank, details.branch, details.address
    setValue('bankName', details.bank);
  }}
/>
```

### Pincode with Location
```tsx
<RHFPincodeField
  name="pincode"
  label="Pincode"
  onLocationDetails={(details) => {
    // details.city, details.state, details.district
    setValue('city', details.city);
    setValue('state', details.state);
  }}
/>
```

---

## Common Prop Interface

All RHF components accept these common props:

```typescript
interface CommonProps<T> {
  name: Path<T>;              // Field name (required)
  control?: Control<T>;       // RHF control (auto-injected inside Form)
  rules?: RegisterOptions;    // Validation rules
  defaultValue?: any;         // Default value
  shouldUnregister?: boolean; // Unregister on unmount
  disabled?: boolean;         // Disable field
  helperText?: string;        // Helper text
  ...MUIComponentProps;       // All MUI props for underlying component
}
```

---

## Error Handling

Errors are automatically displayed from Zod validation:

```tsx
const schema = z.object({
  email: z.string()
    .min(1, 'Email is required')      // Shows if empty
    .email('Invalid email format'),   // Shows if not valid email
});
```

Custom async validation:
```tsx
const schema = z.object({
  username: z.string().refine(
    async (val) => {
      const res = await fetch(`/api/check-username?u=${val}`);
      return res.ok;
    },
    { message: 'Username already taken' }
  ),
});
```

---

## File Structure for AI Reference

```
src/
├── components/
│   ├── Form.tsx              # Main Form wrapper
│   ├── RHFTextField.tsx      # Text input
│   ├── RHFSelect.tsx         # Dropdown select
│   ├── RHFAutocomplete.tsx   # Autocomplete
│   ├── RHFDatePicker.tsx     # Date picker
│   ├── RHFFieldArray.tsx     # Dynamic fields
│   └── ...                   # Other components
├── types/
│   └── index.ts              # All TypeScript interfaces
├── utils/
│   ├── formatters.ts         # Value formatters
│   └── schema.ts             # Schema utilities
└── index.ts                  # Main exports
```

---

## AI Instructions

When implementing forms with @paramhq/forms:

1. **Always define a Zod schema first** - It drives validation and TypeScript types
2. **Use `z.infer<typeof schema>`** - For type-safe form data
3. **Pass `defaultValues` matching schema shape** - Every field needs a default
4. **Use `name` prop matching schema keys** - Field names must match schema exactly
5. **For dates, use `z.any()`** - Dayjs objects don't have a Zod type
6. **Wrap app with LocalizationProvider** - Required for date pickers

### Common Mistakes to Avoid
- Don't use `z.date()` for date pickers (use `z.any()`)
- Don't forget `defaultValues` for all fields
- Don't pass JavaScript Date to date pickers (use dayjs objects)
- Don't forget to wrap options in `{ value, label }` format for Select
