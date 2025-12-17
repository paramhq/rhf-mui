# MUI v7 Migration Checklist

This checklist tracks all breaking changes from MUI v6 to v7 that must be verified across the codebase.

## Package Updates

| Item | Status | Notes |
|------|--------|-------|
| `@mui/material` upgraded to ^7.0.0 | [ ] | peerDependencies |
| `@mui/icons-material` upgraded to ^7.0.0 | [ ] | devDependencies |
| `@mui/x-date-pickers` compatible version | [ ] | Check compatibility |
| TypeScript >= 4.9 | [ ] | Requirement |

## Breaking Changes Checklist

### 1. Package Layout (Deep Imports)

**Change:** Deep imports beyond one level no longer work.

| Pattern | Status |
|---------|--------|
| `import X from '@mui/material/Y/Z'` must be `import { X } from '@mui/material/Y'` | [ ] |

### 2. Grid Component

**Change:** `Grid2` promoted to `Grid`, old `Grid` renamed to `GridLegacy`.

| File | Status |
|------|--------|
| No `Grid2 as Grid` aliases needed | [ ] |
| Use `Grid` directly (new API with `size` prop) | [ ] |

### 3. InputLabel Size

**Change:** `size="normal"` changed to `size="medium"`.

| Pattern | Status |
|---------|--------|
| No `size="normal"` on InputLabel | [ ] |

### 4. Deprecated APIs Removed

| Deprecated API | Replacement | Status |
|----------------|-------------|--------|
| `createMuiTheme` | `createTheme` | [ ] |
| `experimentalStyled` | `styled` | [ ] |
| `Hidden` component | `sx` prop / `useMediaQuery` | [ ] |
| Dialog `onBackdropClick` | `onClose` with reason | [ ] |
| Rating `MuiRating-readOnly` | `Mui-readOnly` | [ ] |

### 5. Slot Props Migration

**Change:** `componentsProps` → `slotProps`, `components` → `slots`

| Old Pattern | New Pattern | Status |
|-------------|-------------|--------|
| `InputProps={}` | `slotProps={{ input: {} }}` | [ ] |
| `InputLabelProps={}` | `slotProps={{ inputLabel: {} }}` | [ ] |
| `FormHelperTextProps={}` | `slotProps={{ formHelperText: {} }}` | [ ] |
| `inputProps={}` | `slotProps={{ htmlInput: {} }}` | [ ] |
| `SelectProps={}` | `slotProps={{ select: {} }}` | [ ] |
| Direct `endAdornment` on Select | `slotProps.input.endAdornment` | [ ] |
| Direct `startAdornment` | `slotProps.input.startAdornment` | [ ] |
| `componentsProps={}` | `slotProps={}` | [ ] |
| `components={}` | `slots={}` | [ ] |

### 6. Lab Components

**Change:** Components moved from `@mui/lab` to `@mui/material`.

| Component | Status |
|-----------|--------|
| Alert | [ ] |
| Autocomplete | [ ] |
| Pagination | [ ] |
| Rating | [ ] |
| Skeleton | [ ] |
| SpeedDial | [ ] |
| ToggleButton | [ ] |

---

## Files to Check

### Core Components (`src/components/`)

| File | Deep Imports | slotProps | Grid | Deprecated | Status |
|------|--------------|-----------|------|------------|--------|
| Form.tsx | [ ] | [ ] | [ ] | [ ] | [ ] |
| RHFTextField.tsx | [ ] | [ ] | [ ] | [ ] | [ ] |
| RHFPasswordField.tsx | [ ] | [ ] | [ ] | [ ] | [ ] |
| RHFTextArea.tsx | [ ] | [ ] | [ ] | [ ] | [ ] |
| RHFNumberField.tsx | [ ] | [ ] | [ ] | [ ] | [ ] |
| RHFSelect.tsx | [ ] | [ ] | [ ] | [ ] | [ ] |
| RHFAutocomplete.tsx | [ ] | [ ] | [ ] | [ ] | [ ] |
| RHFAsyncAutocomplete.tsx | [ ] | [ ] | [ ] | [ ] | [ ] |
| RHFCreatableAutocomplete.tsx | [ ] | [ ] | [ ] | [ ] | [ ] |
| RHFMultiAutocomplete.tsx | [ ] | [ ] | [ ] | [ ] | [ ] |
| RHFCheckbox.tsx | [ ] | [ ] | [ ] | [ ] | [ ] |
| RHFCheckboxGroup.tsx | [ ] | [ ] | [ ] | [ ] | [ ] |
| RHFRadioGroup.tsx | [ ] | [ ] | [ ] | [ ] | [ ] |
| RHFSwitch.tsx | [ ] | [ ] | [ ] | [ ] | [ ] |
| RHFSlider.tsx | [ ] | [ ] | [ ] | [ ] | [ ] |
| RHFRating.tsx | [ ] | [ ] | [ ] | [ ] | [ ] |
| RHFDatePicker.tsx | [ ] | [ ] | [ ] | [ ] | [ ] |
| RHFTimePicker.tsx | [ ] | [ ] | [ ] | [ ] | [ ] |
| RHFDateTimePicker.tsx | [ ] | [ ] | [ ] | [ ] | [ ] |
| RHFFileUpload.tsx | [ ] | [ ] | [ ] | [ ] | [ ] |
| RHFFieldArray.tsx | [ ] | [ ] | [ ] | [ ] | [ ] |
| RHFAadhaarField.tsx | [ ] | [ ] | [ ] | [ ] | [ ] |
| RHFPanField.tsx | [ ] | [ ] | [ ] | [ ] | [ ] |
| RHFGstField.tsx | [ ] | [ ] | [ ] | [ ] | [ ] |
| RHFMobileField.tsx | [ ] | [ ] | [ ] | [ ] | [ ] |
| RHFAmountField.tsx | [ ] | [ ] | [ ] | [ ] | [ ] |
| RHFIfscField.tsx | [ ] | [ ] | [ ] | [ ] | [ ] |
| RHFPincodeField.tsx | [ ] | [ ] | [ ] | [ ] | [ ] |

### Demo Files (`apps/demo/src/demos/`)

| File | Grid | Imports | Status |
|------|------|---------|--------|
| AutocompleteDemo.tsx | [ ] | [ ] | [ ] |
| BasicFieldsDemo.tsx | [ ] | [ ] | [ ] |
| CompleteFormDemo.tsx | [ ] | [ ] | [ ] |
| DateTimeDemo.tsx | [ ] | [ ] | [ ] |
| FieldArrayDemo.tsx | [ ] | [ ] | [ ] |
| IndiaFieldsDemo.tsx | [ ] | [ ] | [ ] |
| SelectionFieldsDemo.tsx | [ ] | [ ] | [ ] |

### Package Files

| File | Change | Status |
|------|--------|--------|
| package.json (root) | MUI v7 deps | [ ] |
| apps/demo/package.json | MUI v7 deps | [ ] |

---

## Verification Commands

```bash
# Search for deep imports
grep -r "from '@mui/material/[^']*/" src/

# Search for Grid2
grep -r "Grid2" src/ apps/

# Search for deprecated props
grep -r "InputProps=" src/
grep -r "InputLabelProps=" src/
grep -r "inputProps=" src/
grep -r "componentsProps=" src/
grep -r "components={" src/

# Search for size="normal"
grep -r 'size="normal"' src/

# Build test
npm run build
```

---

## Migration Date

- **Started:** 2025-12-18
- **Completed:** 2025-12-18

## Summary of Changes

1. **Package Updates:**
   - `@mui/material`: ^6.4.0 → ^7.0.0 (peerDependencies & devDependencies)
   - `@mui/icons-material`: ^6.4.0 → ^7.0.0

2. **Code Changes:**
   - `Grid2 as Grid` → `Grid` (Grid2 promoted to Grid in v7)
   - `RHFSelect`: Changed `endAdornment` direct prop → `input` prop with `OutlinedInput`
   - Demo imports: `@rhf-mui/core` → `@paramhq/forms`

3. **Type Updates:**
   - Date picker props now use generic `TDate = unknown` for Dayjs/Date flexibility
