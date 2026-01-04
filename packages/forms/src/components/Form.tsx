import { useState, useCallback } from 'react';
import {
  useForm,
  FormProvider,
  FieldValues,
  FieldErrors,
  FieldPath,
  useFormContext,
  DefaultValues,
} from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { ZodType } from 'zod';
import type { Resolver } from 'react-hook-form';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Backdrop from '@mui/material/Backdrop';
import Typography from '@mui/material/Typography';
import type { FormProps, AsyncFormProps } from '../types';
import { SchemaProvider } from '../context/SchemaContext';

// ============================================================================
// Form Component
// ============================================================================

/**
 * Form wrapper that integrates React Hook Form with Zod validation and MUI
 *
 * @example
 * ```tsx
 * <Form schema={userSchema} onSubmit={handleSubmit}>
 *   <RHFTextField name="email" label="Email" />
 *   <RHFTextField name="password" label="Password" type="password" />
 *   <Button type="submit">Submit</Button>
 * </Form>
 * ```
 */
export function Form<
  TFieldValues extends FieldValues,
  TSchema extends ZodType = ZodType
>({
  schema,
  defaultValues,
  onSubmit,
  onInvalid,
  children,
  mode = 'onBlur',
  resetOnSuccess = false,
  showGlobalError = true,
  className,
  id,
}: FormProps<TFieldValues, TSchema>) {
  const [globalError, setGlobalError] = useState<string | null>(null);

  const methods = useForm<TFieldValues>({
    // Type assertion needed for Zod v4 compatibility with @hookform/resolvers
    // See: https://github.com/colinhacks/zod/issues/4992
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema as any) as Resolver<TFieldValues>,
    defaultValues: defaultValues as DefaultValues<TFieldValues>,
    mode,
    shouldFocusError: true,
  });

  const handleSubmit = useCallback(
    async (data: TFieldValues) => {
      setGlobalError(null);
      try {
        await onSubmit(data);
        if (resetOnSuccess) {
          methods.reset();
        }
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'An unexpected error occurred';
        setGlobalError(message);
      }
    },
    [onSubmit, resetOnSuccess, methods]
  );

  // Wrapper for onInvalid that handles scrolling to first error
  const handleInvalid = useCallback(
    (errors: FieldErrors<TFieldValues>) => {
      // Get first error field and scroll to it
      const errorFields = Object.keys(errors);
      if (errorFields.length > 0) {
        const firstField = errorFields[0] as FieldPath<TFieldValues>;
        // Use setFocus which handles both focus and scroll
        methods.setFocus(firstField);
      }
      // Call user's onInvalid callback if provided
      onInvalid?.(errors);
    },
    [methods, onInvalid]
  );

  const errorCount = Object.keys(methods.formState.errors).length;

  return (
    <SchemaProvider schema={schema}>
      <FormProvider {...methods}>
        <Box
          component="form"
          id={id}
          className={className}
          onSubmit={methods.handleSubmit(handleSubmit, handleInvalid)}
          noValidate
        >
          {showGlobalError && globalError && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setGlobalError(null)}>
              {globalError}
            </Alert>
          )}

          {showGlobalError && errorCount > 0 && methods.formState.isSubmitted && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              Please fix {errorCount} validation error{errorCount > 1 ? 's' : ''} below
            </Alert>
          )}

          {typeof children === 'function' ? children(methods) : children}
        </Box>
      </FormProvider>
    </SchemaProvider>
  );
}

// ============================================================================
// AsyncForm Component
// ============================================================================

/**
 * Form wrapper with loading state support for async submissions
 *
 * @example
 * ```tsx
 * <AsyncForm
 *   schema={userSchema}
 *   onSubmit={async (data) => {
 *     await api.createUser(data);
 *   }}
 * >
 *   <RHFTextField name="email" label="Email" />
 *   <Button type="submit">Submit</Button>
 * </AsyncForm>
 * ```
 */
export function AsyncForm<
  TFieldValues extends FieldValues,
  TSchema extends ZodType = ZodType
>({
  schema,
  defaultValues,
  onSubmit,
  onInvalid,
  children,
  mode = 'onBlur',
  resetOnSuccess = false,
  showGlobalError = true,
  loadingComponent,
  className,
  id,
}: AsyncFormProps<TFieldValues, TSchema>) {
  const [isLoading, setIsLoading] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const methods = useForm<TFieldValues>({
    // Type assertion needed for Zod v4 compatibility with @hookform/resolvers
    // See: https://github.com/colinhacks/zod/issues/4992
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema as any) as Resolver<TFieldValues>,
    defaultValues: defaultValues as DefaultValues<TFieldValues>,
    mode,
    shouldFocusError: true,
  });

  const handleSubmit = useCallback(
    async (data: TFieldValues) => {
      setGlobalError(null);
      setIsLoading(true);
      try {
        await onSubmit(data);
        if (resetOnSuccess) {
          methods.reset();
        }
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'An unexpected error occurred';
        setGlobalError(message);
      } finally {
        setIsLoading(false);
      }
    },
    [onSubmit, resetOnSuccess, methods]
  );

  // Wrapper for onInvalid that handles scrolling to first error
  const handleInvalid = useCallback(
    (errors: FieldErrors<TFieldValues>) => {
      // Get first error field and scroll to it
      const errorFields = Object.keys(errors);
      if (errorFields.length > 0) {
        const firstField = errorFields[0] as FieldPath<TFieldValues>;
        // Use setFocus which handles both focus and scroll
        methods.setFocus(firstField);
      }
      // Call user's onInvalid callback if provided
      onInvalid?.(errors);
    },
    [methods, onInvalid]
  );

  const errorCount = Object.keys(methods.formState.errors).length;

  const defaultLoadingComponent = (
    <Backdrop
      open={isLoading}
      sx={{
        position: 'absolute',
        zIndex: (theme) => theme.zIndex.drawer + 1,
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
      }}
    >
      <CircularProgress />
      <Typography variant="body2" color="text.secondary">
        Submitting...
      </Typography>
    </Backdrop>
  );

  return (
    <SchemaProvider schema={schema}>
      <FormProvider {...methods}>
        <Box
          component="form"
          id={id}
          className={className}
          onSubmit={methods.handleSubmit(handleSubmit, handleInvalid)}
          noValidate
          sx={{ position: 'relative' }}
        >
          {isLoading && (loadingComponent ?? defaultLoadingComponent)}

          {showGlobalError && globalError && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setGlobalError(null)}>
              {globalError}
            </Alert>
          )}

          {showGlobalError && errorCount > 0 && methods.formState.isSubmitted && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              Please fix {errorCount} validation error{errorCount > 1 ? 's' : ''} below
            </Alert>
          )}

          {typeof children === 'function' ? children(methods) : children}
        </Box>
      </FormProvider>
    </SchemaProvider>
  );
}

// ============================================================================
// useFormField Hook
// ============================================================================

/**
 * Hook to access form context in nested components
 */
export function useFormField<TFieldValues extends FieldValues = FieldValues>() {
  const { control, formState } = useFormContext<TFieldValues>();
  return { control, formState };
}

// ============================================================================
// FormDevTools Component (Dev only)
// ============================================================================

/**
 * Development-only form devtools component
 * Note: Requires @hookform/devtools to be installed as a dev dependency
 *
 * @example
 * ```tsx
 * import { DevTool } from '@hookform/devtools';
 *
 * <Form schema={schema} onSubmit={onSubmit}>
 *   {({ control }) => (
 *     <>
 *       <RHFTextField name="email" />
 *       {process.env.NODE_ENV === 'development' && <DevTool control={control} />}
 *     </>
 *   )}
 * </Form>
 * ```
 */
export function FormDevTools() {
  // This is a placeholder component - for actual devtools usage,
  // import DevTool from @hookform/devtools directly in your app
  const isDev = typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

  if (!isDev) {
    return null;
  }

  const { formState } = useFormContext();

  // Simple debug view instead of full devtools
  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 16,
        right: 16,
        p: 2,
        bgcolor: 'background.paper',
        border: 1,
        borderColor: 'divider',
        borderRadius: 1,
        fontSize: '0.75rem',
        maxWidth: 300,
        zIndex: 9999,
      }}
    >
      <Typography variant="caption" fontWeight="bold">Form Debug</Typography>
      <Box component="pre" sx={{ m: 0, fontSize: 'inherit', overflow: 'auto' }}>
        {JSON.stringify(
          {
            isDirty: formState.isDirty,
            isValid: formState.isValid,
            isSubmitting: formState.isSubmitting,
            errors: Object.keys(formState.errors),
          },
          null,
          2
        )}
      </Box>
    </Box>
  );
}
