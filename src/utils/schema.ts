import { ZodType, ZodObject, ZodArray, ZodEffects, ZodOptional, ZodNullable, ZodDefault } from 'zod';
import type { FieldMeta } from '../types';

// Helper to safely access zod internals
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ZodDef = any;

/**
 * Check if a Zod schema represents an optional field
 */
export function isSchemaOptional(schema: ZodType): boolean {
  if (!schema || !(schema as ZodDef)._def) return false;

  const def = (schema as ZodDef)._def as ZodDef;
  const typeName = def.typeName as string | undefined;

  // Directly optional types
  if (typeName === 'ZodOptional' || typeName === 'ZodNullable' || typeName === 'ZodDefault') {
    return true;
  }

  // Unwrap ZodEffects (.refine, .transform, etc.)
  if (typeName === 'ZodEffects') {
    const effects = schema as ZodEffects<ZodType>;
    return isSchemaOptional(effects._def.schema);
  }

  // Check ZodUnion for optional (union with undefined)
  if (typeName === 'ZodUnion') {
    const options = def.options as ZodType[];
    return options.some((opt: ZodType) => {
      const optDef = (opt as ZodDef)._def;
      return optDef?.typeName === 'ZodUndefined' || optDef?.typeName === 'ZodNull';
    });
  }

  return false;
}

/**
 * Unwrap a schema to get the inner type (removes Optional, Nullable, Default, Effects)
 */
export function unwrapSchema(schema: ZodType): ZodType {
  if (!schema || !(schema as ZodDef)._def) return schema;

  const def = (schema as ZodDef)._def;
  const typeName = def.typeName as string | undefined;

  if (typeName === 'ZodOptional') {
    return unwrapSchema((schema as ZodOptional<ZodType>)._def.innerType);
  }

  if (typeName === 'ZodNullable') {
    return unwrapSchema((schema as ZodNullable<ZodType>)._def.innerType);
  }

  if (typeName === 'ZodDefault') {
    return unwrapSchema((schema as ZodDefault<ZodType>)._def.innerType);
  }

  if (typeName === 'ZodEffects') {
    return unwrapSchema((schema as ZodEffects<ZodType>)._def.schema);
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

    if (!current || !(current as ZodDef)._def) return null;

    const def = (current as ZodDef)._def;
    const typeName = def.typeName as string | undefined;

    // Handle array index (e.g., "0", "1")
    if (/^\d+$/.test(part)) {
      if (typeName === 'ZodArray') {
        current = (current as ZodArray<ZodType>)._def.type;
        continue;
      }
      return null;
    }

    // Handle object property
    if (typeName === 'ZodObject') {
      const shape = (current as ZodObject<Record<string, ZodType>>).shape;
      if (!(part in shape)) return null;
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
  if (!unwrapped || !(unwrapped as ZodDef)._def) return meta;

  const def = (unwrapped as ZodDef)._def;
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
