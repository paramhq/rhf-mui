import { ZodType, ZodObject, ZodArray, ZodOptional, ZodNullable, ZodDefault } from 'zod';
import type { FieldMeta } from '../types';

// Helper to safely access zod internals (works with both v3 and v4)
// In v4, internals are at ._zod.def, but compat layer maintains ._def
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ZodDef = any;

/**
 * Get the internal def from a Zod schema (supports v3 and v4)
 */
function getZodDef(schema: ZodType): ZodDef | null {
  if (!schema) return null;

  // Try v4 structure first (._zod.def)
  const v4Def = (schema as ZodDef)?._zod?.def;
  if (v4Def) return v4Def;

  // Fall back to v3 structure (._def)
  return (schema as ZodDef)?._def ?? null;
}

/**
 * Check if a Zod schema represents an optional field
 */
export function isSchemaOptional(schema: ZodType): boolean {
  const def = getZodDef(schema);
  if (!def) return false;

  const typeName = def.typeName as string | undefined;

  // Directly optional types
  if (typeName === 'ZodOptional' || typeName === 'ZodNullable' || typeName === 'ZodDefault') {
    return true;
  }

  // Unwrap ZodEffects (.refine, .transform, etc.) - for v3 compatibility
  if (typeName === 'ZodEffects') {
    const innerSchema = def.schema;
    if (innerSchema) return isSchemaOptional(innerSchema);
  }

  // Handle ZodPipe (v4's transform replacement)
  if (typeName === 'ZodPipe') {
    const innerSchema = def.in;
    if (innerSchema) return isSchemaOptional(innerSchema);
  }

  // Check ZodUnion for optional (union with undefined)
  if (typeName === 'ZodUnion') {
    const options = def.options as ZodType[];
    return options?.some((opt: ZodType) => {
      const optDef = getZodDef(opt);
      return optDef?.typeName === 'ZodUndefined' || optDef?.typeName === 'ZodNull';
    }) ?? false;
  }

  return false;
}

/**
 * Unwrap a schema to get the inner type (removes Optional, Nullable, Default, Effects)
 */
export function unwrapSchema(schema: ZodType): ZodType {
  const def = getZodDef(schema);
  if (!def) return schema;

  const typeName = def.typeName as string | undefined;

  if (typeName === 'ZodOptional') {
    return unwrapSchema((schema as ZodOptional<ZodType>)._def?.innerType ?? def.innerType);
  }

  if (typeName === 'ZodNullable') {
    return unwrapSchema((schema as ZodNullable<ZodType>)._def?.innerType ?? def.innerType);
  }

  if (typeName === 'ZodDefault') {
    return unwrapSchema((schema as ZodDefault<ZodType>)._def?.innerType ?? def.innerType);
  }

  // Handle ZodEffects (v3) - .refine, .transform
  if (typeName === 'ZodEffects') {
    const innerSchema = def.schema;
    if (innerSchema) return unwrapSchema(innerSchema);
  }

  // Handle ZodPipe (v4's transform)
  if (typeName === 'ZodPipe') {
    const innerSchema = def.in;
    if (innerSchema) return unwrapSchema(innerSchema);
  }

  return schema;
}

/**
 * Navigate to a schema at a specific path (supports dot notation and array indices)
 * @example getSchemaAtPath(schema, 'address.city') -> ZodString
 * @example getSchemaAtPath(schema, 'items.0.name') -> ZodString
 */
export function getSchemaAtPath(schema: ZodType, path: string): ZodType | null {
  if (!path) return schema;

  const parts = path.split('.');
  let current: ZodType = schema;

  for (const part of parts) {
    current = unwrapSchema(current);

    const def = getZodDef(current);
    if (!def) return null;

    const typeName = def.typeName as string | undefined;

    // Handle array index (e.g., "0", "1")
    if (/^\d+$/.test(part)) {
      if (typeName === 'ZodArray') {
        // Get array element type - works with both v3 and v4
        const elementType = (current as ZodArray<ZodType>)._def?.type ?? def.type ?? def.element;
        if (elementType && typeof elementType === 'object') {
          current = elementType as unknown as ZodType;
          continue;
        }
      }
      return null;
    }

    // Handle object property
    if (typeName === 'ZodObject') {
      const shape = (current as ZodObject<Record<string, ZodType>>).shape ?? def.shape?.();
      if (!shape || !(part in shape)) return null;
      current = shape[part];
      continue;
    }

    return null;
  }

  return current;
}

/**
 * Extract metadata from a Zod schema
 */
export function extractFieldMeta(schema: ZodType | null): FieldMeta {
  const meta: FieldMeta = {
    required: true,
  };

  if (!schema) return meta;

  // Check if optional before unwrapping
  meta.required = !isSchemaOptional(schema);

  // Unwrap to get the inner schema
  const unwrapped = unwrapSchema(schema);
  const def = getZodDef(unwrapped);
  if (!def) return meta;

  const typeName = def.typeName as string | undefined;

  // Extract description
  if (def.description) {
    meta.description = def.description as string;
  }

  // Extract string constraints
  if (typeName === 'ZodString') {
    const checks = (def.checks as Array<{ kind: string; value?: unknown }>) || [];
    for (const check of checks) {
      if (check.kind === 'min') meta.minLength = check.value as number;
      if (check.kind === 'max') meta.maxLength = check.value as number;
      if (check.kind === 'regex') meta.pattern = check.value as RegExp;
    }
  }

  // Extract number constraints
  if (typeName === 'ZodNumber') {
    const checks = (def.checks as Array<{ kind: string; value?: unknown }>) || [];
    for (const check of checks) {
      if (check.kind === 'min') meta.min = check.value as number;
      if (check.kind === 'max') meta.max = check.value as number;
    }
  }

  return meta;
}

/**
 * Get field metadata at a specific path
 */
export function getFieldMeta(schema: ZodType, path: string): FieldMeta {
  const fieldSchema = getSchemaAtPath(schema, path);
  return extractFieldMeta(fieldSchema);
}

/**
 * Check if a field at a specific path is required
 */
export function isFieldRequired(schema: ZodType, path: string): boolean {
  const fieldSchema = getSchemaAtPath(schema, path);
  if (!fieldSchema) return false;
  return !isSchemaOptional(fieldSchema);
}
