import * as React from 'react';
import {
  useForm,
  FormProvider as RHFFormProvider,
  type UseFormProps,
  type UseFormReturn,
  type FieldValues,
  type SubmitHandler,
  type SubmitErrorHandler,
} from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { ZodType, ZodTypeDef } from 'zod';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';

// Props for the Form component
interface FormProps<TFieldValues extends FieldValues, TSchema extends ZodType<TFieldValues, ZodTypeDef>> {
  schema: TSchema;
  defaultValues?: UseFormProps<TFieldValues>['defaultValues'];
  onSubmit: SubmitHandler<TFieldValues>;
  onError?: SubmitErrorHandler<TFieldValues>;
  children: React.ReactNode | ((methods: UseFormReturn<TFieldValues>) => React.ReactNode);
  mode?: UseFormProps<TFieldValues>['mode'];
  reValidateMode?: UseFormProps<TFieldValues>['reValidateMode'];
  resetOnSuccess?: boolean;
  showGlobalError?: boolean;
  id?: string;
  className?: string;
}

export function Form<TFieldValues extends FieldValues, TSchema extends ZodType<TFieldValues, ZodTypeDef>>({
  schema,
  defaultValues,
  onSubmit,
  onError,
  children,
  mode = 'onBlur',
  reValidateMode = 'onChange',
  resetOnSuccess = false,
  showGlobalError = true,
  id,
  className,
}: FormProps<TFieldValues, TSchema>) {
  const [globalError, setGlobalError] = React.useState<string | null>(null);

  const methods = useForm<TFieldValues>({
    resolver: zodResolver(schema),
    defaultValues,
    mode,
    reValidateMode,
  });

  const handleSubmit = async (data: TFieldValues) => {
    try {
      setGlobalError(null);
      await onSubmit(data);
      if (resetOnSuccess) {
        methods.reset();
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      setGlobalError(message);
    }
  };

  const handleError: SubmitErrorHandler<TFieldValues> = (errors) => {
    // Set a global error message for multiple field errors
    const errorCount = Object.keys(errors).length;
    if (errorCount > 0) {
      setGlobalError(`Please fix ${errorCount} validation error${errorCount > 1 ? 's' : ''}`);
    }
    onError?.(errors);
  };

  return (
    <RHFFormProvider {...methods}>
      <Box
        component="form"
        id={id}
        className={className}
        onSubmit={methods.handleSubmit(handleSubmit, handleError)}
        noValidate
      >
        {showGlobalError && globalError && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setGlobalError(null)}>
            {globalError}
          </Alert>
        )}
        {typeof children === 'function' ? children(methods) : children}
      </Box>
    </RHFFormProvider>
  );
}

// Async form with loading state management
interface AsyncFormProps<TFieldValues extends FieldValues, TSchema extends ZodType<TFieldValues, ZodTypeDef>>
  extends Omit<FormProps<TFieldValues, TSchema>, 'onSubmit'> {
  onSubmit: (data: TFieldValues) => Promise<void>;
  loadingComponent?: React.ReactNode;
}

export function AsyncForm<TFieldValues extends FieldValues, TSchema extends ZodType<TFieldValues, ZodTypeDef>>({
  onSubmit,
  loadingComponent,
  children,
  ...props
}: AsyncFormProps<TFieldValues, TSchema>) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (data: TFieldValues) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...props} onSubmit={handleSubmit}>
      {(methods) => (
        <>
          {typeof children === 'function' ? children(methods) : children}
          {isSubmitting && (
            loadingComponent ?? (
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'rgba(255, 255, 255, 0.7)',
                  zIndex: 1,
                }}
              >
                <CircularProgress />
              </Box>
            )
          )}
        </>
      )}
    </Form>
  );
}

// Hook for accessing form context in nested components
export { useFormContext } from 'react-hook-form';

// Type-safe form field component that automatically gets control from context
import { useFormContext } from 'react-hook-form';

export function useFormField<TFieldValues extends FieldValues>() {
  const { control, formState } = useFormContext<TFieldValues>();
  return { control, formState };
}

// Dev tools for form debugging (only in development)
interface FormDevToolsProps {
  control: UseFormReturn['control'];
}

export function FormDevTools({ control }: FormDevToolsProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  // Dynamically import DevTool in development only
  const DevTool = React.lazy(() =>
    import('@hookform/devtools').then((mod) => ({ default: mod.DevTool }))
  );

  return (
    <React.Suspense fallback={null}>
      <DevTool control={control} />
    </React.Suspense>
  );
}
