import React, { createContext, useContext, useMemo, useCallback } from 'react';
import type { ZodType } from 'zod';
import type { SchemaContextValue, FieldMeta } from '../types';
import { getFieldMeta, isFieldRequired } from '../utils/schema';

const SchemaContext = createContext<SchemaContextValue>({
  schema: null,
  getFieldMeta: () => ({ required: false }),
  isFieldRequired: () => false,
});

export interface SchemaProviderProps {
  schema: ZodType;
  children: React.ReactNode;
}

/**
 * Provider that exposes Zod schema for field introspection
 */
export function SchemaProvider({ schema, children }: SchemaProviderProps) {
  const getFieldMetaFn = useCallback(
    (path: string): FieldMeta => {
      if (!schema) return { required: false };
      return getFieldMeta(schema, path);
    },
    [schema]
  );

  const isFieldRequiredFn = useCallback(
    (path: string): boolean => {
      if (!schema) return false;
      return isFieldRequired(schema, path);
    },
    [schema]
  );

  const value = useMemo<SchemaContextValue>(
    () => ({
      schema,
      getFieldMeta: getFieldMetaFn,
      isFieldRequired: isFieldRequiredFn,
    }),
    [schema, getFieldMetaFn, isFieldRequiredFn]
  );

  return <SchemaContext.Provider value={value}>{children}</SchemaContext.Provider>;
}

/**
 * Hook to access schema context
 */
export function useSchemaContext(): SchemaContextValue {
  return useContext(SchemaContext);
}

/**
 * Hook to check if a field is required based on schema
 */
export function useFieldRequired(path: string): boolean {
  const { isFieldRequired } = useSchemaContext();
  return isFieldRequired(path);
}

/**
 * Hook to get field metadata from schema
 */
export function useFieldMeta(path: string): FieldMeta {
  const { getFieldMeta } = useSchemaContext();
  return getFieldMeta(path);
}
