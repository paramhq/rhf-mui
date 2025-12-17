# Zod v4 Compatibility Notes

This document tracks known issues and workarounds for Zod v4 compatibility.

## Current Status

The library supports **both Zod v3 and Zod v4** through compatibility workarounds. Full type-safe support for Zod v4 is pending upstream fixes in `@hookform/resolvers`.

## Known Issues

### 1. zodResolver Type Incompatibility

**Issue**: `zodResolver(schema)` throws TypeScript errors when `schema` is typed as `ZodType` from Zod v4.

```typescript
// ❌ TypeScript error in Zod v4
const methods = useForm<TFieldValues>({
  resolver: zodResolver(schema), // Error: No overload matches this call
});
```

**Root Cause**: Zod v4 changed the generic structure of `ZodType`:

```typescript
// Zod v3
class ZodType<Output, Def extends z.ZodTypeDef, Input = Output>

// Zod v4
class ZodType<Output = unknown, Input = unknown>
```

The `@hookform/resolvers` package expects `Input extends FieldValues`, but Zod v4's `ZodType` defaults `Input` to `unknown`.

**Current Workaround** (in `src/components/Form.tsx`):

```typescript
// Type assertion needed for Zod v4 compatibility with @hookform/resolvers
// See: https://github.com/colinhacks/zod/issues/4992
// eslint-disable-next-line @typescript-eslint/no-explicit-any
resolver: zodResolver(schema as any) as Resolver<TFieldValues>,
```

**Proper Fix** (when available):
- Option 1: Wait for `@hookform/resolvers` to improve Zod v4 type inference
- Option 2: Use `standardSchemaResolver` instead of `zodResolver` (requires @hookform/resolvers v5+)

**References**:
- https://github.com/colinhacks/zod/issues/4992
- https://github.com/colinhacks/zod/discussions/5443

### 2. ZodEffects Removed

**Issue**: `ZodEffects` is no longer exported from Zod v4.

**Root Cause**: Zod v4 restructured transformations - they now live in `ZodPipe` instead of `ZodEffects`.

**Current Workaround** (in `src/utils/schema.ts`):

```typescript
// Handle ZodEffects (v3) - .refine, .transform
if (typeName === 'ZodEffects') {
  const innerSchema = def.schema;
  if (innerSchema) return isSchemaOptional(innerSchema);
}

// Handle ZodPipe (v4's transform replacement)
if (typeName === 'ZodPipe') {
  const innerSchema = def.in;
  if (innerSchema) return isSchemaOptional(innerSchema);
}
```

### 3. Internal Structure Changes

**Issue**: Zod v4 moved `._def` to `._zod.def`.

**Current Workaround** (in `src/utils/schema.ts`):

```typescript
function getZodDef(schema: ZodType): ZodDef | null {
  if (!schema) return null;

  // Try v4 structure first (._zod.def)
  const v4Def = (schema as ZodDef)?._zod?.def;
  if (v4Def) return v4Def;

  // Fall back to v3 structure (._def)
  return (schema as ZodDef)?._def ?? null;
}
```

## Migration Checklist for Future Proper Fix

When `@hookform/resolvers` has better Zod v4 support:

- [ ] Remove `as any` cast from `zodResolver(schema as any)`
- [ ] Update `FormProps` and `AsyncFormProps` to use proper Zod v4 types
- [ ] Consider using `standardSchemaResolver` for better type inference
- [ ] Test with schemas that have transforms to verify input/output type separation

## Zod v4 API Changes Used in This Library

| Pattern | Zod v3 | Zod v4 |
|---------|--------|--------|
| Email validation | `z.string().email()` | `z.email()` |
| URL validation | `z.string().url()` | `z.url()` |
| Error message | `{ message: 'msg' }` | `{ error: 'msg' }` |
| Internal def | `schema._def` | `schema._zod.def` |
| Transforms | `ZodEffects` | `ZodPipe` |

## Testing Both Versions

The library's peer dependencies support both:

```json
{
  "peerDependencies": {
    "zod": "^3.0.0 || ^4.0.0"
  }
}
```

When testing:
1. Test with `zod@3.x` to ensure v3 compatibility
2. Test with `zod@4.x` to ensure v4 compatibility
3. Verify schema utilities work with both internal structures
