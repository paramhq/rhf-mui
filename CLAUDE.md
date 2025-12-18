# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**@paramhq/forms** is a React form component library that integrates:
- React Hook Form (state management)
- Material-UI v7 (UI components)
- Zod v3/v4 (validation)

All form field components are **controlled components** using `useController` hook.

## Commands

```bash
# Install dependencies (pnpm monorepo)
pnpm install

# Build library
pnpm build           # or: npm run build

# Development mode (watch)
pnpm dev             # or: npm run dev

# Type checking
pnpm typecheck       # or: npm run typecheck

# Linting
pnpm lint            # or: npm run lint

# Run demo app
cd apps/demo && pnpm dev
# Visit http://localhost:5173

# Publish to npm
npm run publish:npm
```

## Architecture

```
Form Component (provides RHF context + SchemaProvider)
  └─► Field Components (RHFTextField, RHFSelect, etc.)
        └─► useController hook
              └─► MUI Component (TextField, Select, etc.)
```

### Key Directories

| Directory | Purpose |
|-----------|---------|
| `src/components/` | RHF-wrapped MUI field components |
| `src/types/` | TypeScript interfaces for all components |
| `src/utils/` | Schema utilities & India-specific formatters |
| `src/context/` | SchemaProvider for field metadata |
| `src/hooks/` | Custom hooks |
| `apps/demo/` | Vite demo application |

## Creating New Components

Follow this pattern for all new field components:

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

After creating a component:
1. Export from `src/components/index.ts`
2. Add types to `src/types/index.ts`
3. Add demo in `apps/demo/src/demos/`

## MUI v7 Requirements

This library requires **MUI v7+**. Use MUI v7 patterns:

| Pattern | Correct (v7) | Deprecated (v6) |
|---------|--------------|-----------------|
| Input props | `slotProps={{ input: {} }}` | `InputProps={}` |
| HTML input | `slotProps={{ htmlInput: {} }}` | `inputProps={}` |
| Adornments | `slotProps={{ input: { endAdornment: ... }}}` | `endAdornment={}` |
| Grid layout | `<Grid size={{ xs: 12 }}>` | `<Grid2 as Grid>` |
| Components | `slots={{}}` | `components={{}}` |

## Zod v4 Compatibility

The library supports both Zod v3 and v4. Known workarounds:

1. **zodResolver type cast**: `zodResolver(schema as any) as Resolver<TFieldValues>` - needed due to Zod v4 generic changes
2. **Internal structure**: Use `getZodDef()` helper which handles both `._def` (v3) and `._zod.def` (v4)
3. **Transforms**: Handle both `ZodEffects` (v3) and `ZodPipe` (v4)

See `docs/06-zod-v4-compatibility.md` for full details.

## Important Notes

1. **Controlled Components Required**: MUI components don't work with RHF's `register()`, must use `useController()`

2. **Date Pickers**:
   - Require `@mui/x-date-pickers` + `dayjs`
   - Pass dayjs objects, not JavaScript Date
   - Use `z.any()` in Zod schema for dates

3. **Performance**: Re-renders are isolated per field, not whole form

4. **India Fields**: Have built-in formatting and validation (Aadhaar checksum, PAN format, GST format, IFSC/Pincode API lookups)

5. **Masked Input**: Requires `react-imask` (optional peer dependency)
