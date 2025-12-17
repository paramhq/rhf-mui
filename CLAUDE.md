# AI Agent Instructions for @paramhq/forms

This file provides context for AI coding assistants working with this codebase.

## Project Overview

**@paramhq/forms** is a React form component library that integrates:
- React Hook Form (state management)
- Material-UI (UI components)  
- Zod (validation)

All form field components are **controlled components** using `useController` hook.

## Architecture

```
Form Component (provides RHF context)
  └─► Field Components (RHFTextField, RHFSelect, etc.)
        └─► useController hook
              └─► MUI Component (TextField, Select, etc.)
```

## Key Files

| File | Purpose |
|------|---------|
| `src/components/Form.tsx` | Main Form wrapper with Zod resolver |
| `src/components/RHF*.tsx` | Individual field wrappers |
| `src/types/index.ts` | All TypeScript interfaces |
| `src/utils/formatters.ts` | India-specific formatters |
| `apps/demo/` | Demo application |

## Creating New Components

Follow this pattern:

```tsx
import { useController, FieldValues, Path, Control } from 'react-hook-form';
import { TextField, TextFieldProps } from '@mui/material';

interface RHFNewFieldProps<T extends FieldValues> {
  name: Path<T>;
  control?: Control<T>;
  // ... other props
}

export function RHFNewField<T extends FieldValues>({
  name,
  control,
  ...props
}: RHFNewFieldProps<T>) {
  const {
    field: { value, onChange, onBlur, ref },
    fieldState: { error },
  } = useController({ name, control });

  return (
    <TextField
      value={value ?? ''}
      onChange={onChange}
      onBlur={onBlur}
      inputRef={ref}
      error={!!error}
      helperText={error?.message}
      {...props}
    />
  );
}
```

## Common Tasks

### Add a new field component
1. Create `src/components/RHFNewField.tsx`
2. Export from `src/components/index.ts`
3. Add types to `src/types/index.ts`
4. Add demo in `apps/demo/src/demos/`

### Fix validation issues
- Check Zod schema matches field names
- Ensure `defaultValues` has all fields
- For dates, use `z.any()` not `z.date()`

### Add India-specific field
- Add formatter in `src/utils/formatters.ts`
- Create component using formatter
- Add API lookup if needed (see RHFIfscField, RHFPincodeField)

## Testing Locally

```bash
# Root directory
pnpm install

# Run demo
cd apps/demo
pnpm dev
# Visit http://localhost:5173
```

## Build & Publish

```bash
# Build library
npm run build

# Publish (requires npm login)
npm run publish:npm
```

## Important Notes

1. **Controlled Components Required**: MUI components don't work with `register()`, must use `useController()`

2. **Date Pickers**: 
   - Require `@mui/x-date-pickers` + `dayjs`
   - Pass dayjs objects, not JavaScript Date
   - Use `z.any()` in Zod schema

3. **Performance**: Re-renders are isolated per field, not whole form

4. **India Fields**: Have built-in formatting and validation (Aadhaar checksum, PAN format, GST format, IFSC/Pincode API lookups)

## Documentation

- `docs/01-architecture.md` - Why controlled components
- `docs/02-performance.md` - Performance optimization
- `docs/03-components.md` - Component reference
- `docs/04-llm-integration.md` - LLM-friendly quick reference
