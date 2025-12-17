import * as React from 'react';
import { useFormContext, type FieldPath, type FieldValues } from 'react-hook-form';
import {
  type ZodType,
  type ZodObject,
  type ZodOptional,
  type ZodNullable,
  type ZodDefault,
  type ZodEffects,
  type ZodArray,
  ZodFirstPartyTypeKind,
} from 'zod';

// =============================================================================
// Approach 1: Schema Context (Recommended)
// =============================================================================

/**
 * Context to pass Zod schema down to form fields
 */
interface FormSchemaContextValue {
  schema: ZodType<any> | null;
}

const FormSchemaContext = React.createContext<FormSchemaContextValue>({ schema: null });

/**
 * Provider to wrap form with schema access
 */
export function FormSchemaProvider({
  schema,
  children,
}: {
  schema: ZodType<any>;
  children: React.ReactNode;
}) {
  const value = React.useMemo(() => ({ schema }), [schema]);
  return (
    <FormSchemaContext.Provider value={value}>
      {children}
    </FormSchemaContext.Provider>
  );
}

/**
 * Check if a Zod schema is optional/nullable at the leaf level
 */
function isSchemaOptional(schema: ZodType<any>): boolean {
  const typeName = (schema as any)._def?.typeName;

  // Explicitly optional or nullable
  if (
    typeName === ZodFirstPartyTypeKind.ZodOptional ||
    typeName === ZodFirstPartyTypeKind.ZodNullable
  ) {
    return true;
  }

  // Has default value (not required from user)
  if (typeName === ZodFirstPartyTypeKind.ZodDefault) {
    return true;
  }

  // Unwrap effects (.refine, .transform) and check inner
  if (typeName === ZodFirstPartyTypeKind.ZodEffects) {
    const innerSchema = (schema as ZodEffects<any>)._def.schema;
    return isSchemaOptional(innerSchema);
  }

  // Union with undefined (e.g., z.string().optional() compiles to union)
  if (typeName === ZodFirstPartyTypeKind.ZodUnion) {
    const options = (schema as any)._def.options as ZodType<any>[];
    return options.some(
      (opt) => (opt as any)._def?.typeName === ZodFirstPartyTypeKind.ZodUndefined
    );
  }

  return false;
}

/**
 * Navigate nested schema by path (supports dot notation and array indices)
 * e.g., "nominees.0.name" or "address.city"
 */
function getSchemaAtPath(schema: ZodType<any>, path: string): ZodType<any> | null {
  if (!path) return schema;

  const parts = path.split('.');
  let current: ZodType<any> = schema;

  for (const part of parts) {
    // Unwrap effects
    while ((current as any)._def?.typeName === ZodFirstPartyTypeKind.ZodEffects) {
      current = (current as ZodEffects<any>)._def.schema;
    }

    // Unwrap optional/nullable/default
    while (
      [
        ZodFirstPartyTypeKind.ZodOptional,
        ZodFirstPartyTypeKind.ZodNullable,
        ZodFirstPartyTypeKind.ZodDefault,
      ].includes((current as any)._def?.typeName)
    ) {
      current = (current as any)._def.innerType;
    }

    const typeName = (current as any)._def?.typeName;

    // Handle array index (e.g., "0", "1")
    if (typeName === ZodFirstPartyTypeKind.ZodArray && /^\d+$/.test(part)) {
      current = (current as ZodArray<any>)._def.type;
      continue;
    }

    // Handle object property
    if (typeName === ZodFirstPartyTypeKind.ZodObject) {
      const shape = (current as ZodObject<any>).shape;
      if (!(part in shape)) {
        return null; // Path not found
      }
      current = shape[part];
      continue;
    }

    // Can't navigate further
    return null;
  }

  return current;
}

/**
 * Hook to check if a field is required based on Zod schema
 */
export function useFieldRequired<
  TFieldValues extends FieldValues = FieldValues
>(name: FieldPath<TFieldValues>): boolean {
  const { schema } = React.useContext(FormSchemaContext);

  return React.useMemo(() => {
    if (!schema) return false;

    const fieldSchema = getSchemaAtPath(schema, name);
    if (!fieldSchema) return false;

    return !isSchemaOptional(fieldSchema);
  }, [schema, name]);
}

/**
 * Hook to get field metadata (required, min, max, etc.)
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

export function useFieldMeta<
  TFieldValues extends FieldValues = FieldValues
>(name: FieldPath<TFieldValues>): FieldMeta {
  const { schema } = React.useContext(FormSchemaContext);

  return React.useMemo(() => {
    const meta: FieldMeta = { required: false };

    if (!schema) return meta;

    const fieldSchema = getSchemaAtPath(schema, name);
    if (!fieldSchema) return meta;

    meta.required = !isSchemaOptional(fieldSchema);

    // Extract constraints from schema
    const def = (fieldSchema as any)._def;
    const checks = def?.checks as Array<{ kind: string; value?: any }> | undefined;

    if (checks) {
      for (const check of checks) {
        switch (check.kind) {
          case 'min':
            if (def.typeName === ZodFirstPartyTypeKind.ZodString) {
              meta.minLength = check.value;
            } else {
              meta.min = check.value;
            }
            break;
          case 'max':
            if (def.typeName === ZodFirstPartyTypeKind.ZodString) {
              meta.maxLength = check.value;
            } else {
              meta.max = check.value;
            }
            break;
          case 'regex':
            meta.pattern = check.value;
            break;
        }
      }
    }

    // Description from .describe()
    if (def?.description) {
      meta.description = def.description;
    }

    return meta;
  }, [schema, name]);
}

// =============================================================================
// Approach 2: Enhanced Form Wrapper (Alternative)
// =============================================================================

import { useForm, FormProvider, type UseFormProps } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

interface FormProps<TFieldValues extends FieldValues, TSchema extends ZodType<TFieldValues>> {
  schema: TSchema;
  defaultValues?: UseFormProps<TFieldValues>['defaultValues'];
  onSubmit: (data: TFieldValues) => void | Promise<void>;
  children: React.ReactNode;
  mode?: UseFormProps<TFieldValues>['mode'];
}

export function Form<TFieldValues extends FieldValues, TSchema extends ZodType<TFieldValues>>({
  schema,
  defaultValues,
  onSubmit,
  children,
  mode = 'onBlur',
}: FormProps<TFieldValues, TSchema>) {
  const methods = useForm<TFieldValues>({
    resolver: zodResolver(schema),
    defaultValues,
    mode,
  });

  return (
    <FormSchemaProvider schema={schema}>
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)} noValidate>
          {children}
        </form>
      </FormProvider>
    </FormSchemaProvider>
  );
}

// =============================================================================
// Approach 3: Auto-Required TextField
// =============================================================================

import { useController, type UseControllerProps } from 'react-hook-form';
import TextField, { type TextFieldProps } from '@mui/material/TextField';

interface RHFTextFieldAutoProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> extends Omit<TextFieldProps, 'name' | 'value' | 'onChange' | 'onBlur' | 'error' | 'required'>,
    Omit<UseControllerProps<TFieldValues, TName>, 'control'> {
  control: UseControllerProps<TFieldValues, TName>['control'];
  helperText?: string;
  /** Override auto-detected required (use when schema detection fails) */
  required?: boolean;
}

export function RHFTextFieldAuto<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  name,
  control,
  rules,
  defaultValue,
  shouldUnregister,
  helperText,
  required: requiredOverride,
  ...textFieldProps
}: RHFTextFieldAutoProps<TFieldValues, TName>) {
  const {
    field: { value, onChange, onBlur, ref },
    fieldState: { error },
  } = useController({ name, control, rules, defaultValue, shouldUnregister });

  // Auto-detect required from schema
  const schemaRequired = useFieldRequired<TFieldValues>(name);
  const isRequired = requiredOverride ?? schemaRequired;

  // Get additional metadata
  const meta = useFieldMeta<TFieldValues>(name);

  return (
    <TextField
      {...textFieldProps}
      name={name}
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onBlur}
      inputRef={ref}
      error={!!error}
      helperText={error?.message ?? helperText ?? meta.description}
      required={isRequired}
      slotProps={{
        ...textFieldProps.slotProps,
        htmlInput: {
          ...textFieldProps.slotProps?.htmlInput,
          minLength: meta.minLength,
          maxLength: meta.maxLength,
          min: meta.min,
          max: meta.max,
        },
      }}
    />
  );
}

// =============================================================================
// Usage Example
// =============================================================================

/*
import { z } from 'zod';

const memberSchema = z.object({
  firstName: z.string().min(1, 'Required').max(50),
  middleName: z.string().optional(),
  lastName: z.string().min(1, 'Required'),
  email: z.string().email().optional(),
  mobile: z.string().length(10, 'Must be 10 digits'),
  age: z.number().min(18).max(100).optional(),
  nominees: z.array(
    z.object({
      name: z.string().min(1),
      percentage: z.number().min(1).max(100),
    })
  ),
});

type MemberFormData = z.infer<typeof memberSchema>;

function MemberForm() {
  return (
    <Form
      schema={memberSchema}
      defaultValues={{ firstName: '', lastName: '', mobile: '', nominees: [] }}
      onSubmit={console.log}
    >
      {/* These auto-detect required from schema *}
      <RHFTextFieldAuto name="firstName" label="First Name" />      {/* required=true  *}
      <RHFTextFieldAuto name="middleName" label="Middle Name" />    {/* required=false *}
      <RHFTextFieldAuto name="lastName" label="Last Name" />        {/* required=true  *}
      <RHFTextFieldAuto name="email" label="Email" />               {/* required=false *}
      <RHFTextFieldAuto name="mobile" label="Mobile" />             {/* required=true  *}
      
      {/* Works with nested fields too *}
      <RHFTextFieldAuto name="nominees.0.name" label="Nominee Name" /> {/* required=true *}
    </Form>
  );
}
*/
