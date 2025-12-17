import * as React from 'react';
import {
  useFieldArray,
  useFormContext,
  type Control,
  type FieldValues,
  type FieldArrayPath,
  type ArrayPath,
  type FieldArray as RHFFieldArrayType,
  type UseFieldArrayReturn,
} from 'react-hook-form';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Collapse from '@mui/material/Collapse';
import Add from '@mui/icons-material/Add';
import Delete from '@mui/icons-material/Delete';
import DragIndicator from '@mui/icons-material/DragIndicator';
import KeyboardArrowUp from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDown from '@mui/icons-material/KeyboardArrowDown';

// =============================================================================
// Types
// =============================================================================

export interface FieldArrayRenderProps<
  TFieldValues extends FieldValues = FieldValues,
  TFieldArrayName extends FieldArrayPath<TFieldValues> = FieldArrayPath<TFieldValues>
> {
  /** Current field data with id */
  field: RHFFieldArrayType<TFieldValues, TFieldArrayName> & { id: string };
  /** Index in the array */
  index: number;
  /** Total count of items */
  total: number;
  /** Remove this item */
  remove: () => void;
  /** Move up (swap with previous) */
  moveUp: () => void;
  /** Move down (swap with next) */
  moveDown: () => void;
  /** Is first item */
  isFirst: boolean;
  /** Is last item */
  isLast: boolean;
  /** Field name prefix for nested fields */
  namePrefix: `${TFieldArrayName}.${number}`;
}

export interface RHFFieldArrayProps<
  TFieldValues extends FieldValues = FieldValues,
  TFieldArrayName extends FieldArrayPath<TFieldValues> = FieldArrayPath<TFieldValues>
> {
  /** Field array name */
  name: TFieldArrayName;
  /** Form control (optional if inside FormProvider) */
  control?: Control<TFieldValues>;
  /** Render function for each item */
  children: (props: FieldArrayRenderProps<TFieldValues, TFieldArrayName>) => React.ReactNode;
  /** Default value for new items */
  defaultValue: RHFFieldArrayType<TFieldValues, TFieldArrayName>;
  /** Minimum items (disables remove when reached) */
  minItems?: number;
  /** Maximum items (disables add when reached) */
  maxItems?: number;
  /** Section title */
  title?: string;
  /** Add button text */
  addButtonText?: string;
  /** Show reorder controls */
  reorderable?: boolean;
  /** Variant style */
  variant?: 'default' | 'card' | 'compact';
  /** Disable all interactions */
  disabled?: boolean;
  /** Empty state message */
  emptyMessage?: string;
  /** Called when items change */
  onItemsChange?: (count: number) => void;
}

// =============================================================================
// Main Component
// =============================================================================

export function RHFFieldArray<
  TFieldValues extends FieldValues = FieldValues,
  TFieldArrayName extends FieldArrayPath<TFieldValues> = FieldArrayPath<TFieldValues>
>({
  name,
  control: controlProp,
  children,
  defaultValue,
  minItems = 0,
  maxItems,
  title,
  addButtonText = 'Add',
  reorderable = false,
  variant = 'default',
  disabled = false,
  emptyMessage = 'No items added',
  onItemsChange,
}: RHFFieldArrayProps<TFieldValues, TFieldArrayName>) {
  // Get control from context if not provided
  const formContext = useFormContext<TFieldValues>();
  const control = controlProp ?? formContext?.control;

  if (!control) {
    throw new Error('RHFFieldArray must be used within FormProvider or receive control prop');
  }

  const { fields, append, remove, move } = useFieldArray({
    control,
    name,
  });

  // Notify parent of count changes
  React.useEffect(() => {
    onItemsChange?.(fields.length);
  }, [fields.length, onItemsChange]);

  const canAdd = !disabled && (!maxItems || fields.length < maxItems);
  const canRemove = !disabled && fields.length > minItems;

  const handleAdd = () => {
    if (canAdd) {
      append(defaultValue as any);
    }
  };

  const handleRemove = (index: number) => {
    if (canRemove) {
      remove(index);
    }
  };

  const handleMoveUp = (index: number) => {
    if (index > 0) {
      move(index, index - 1);
    }
  };

  const handleMoveDown = (index: number) => {
    if (index < fields.length - 1) {
      move(index, index + 1);
    }
  };

  const renderItem = (field: typeof fields[number], index: number) => {
    const props: FieldArrayRenderProps<TFieldValues, TFieldArrayName> = {
      field: field as any,
      index,
      total: fields.length,
      remove: () => handleRemove(index),
      moveUp: () => handleMoveUp(index),
      moveDown: () => handleMoveDown(index),
      isFirst: index === 0,
      isLast: index === fields.length - 1,
      namePrefix: `${name}.${index}` as `${TFieldArrayName}.${number}`,
    };

    return children(props);
  };

  // Variant styles
  const getItemWrapper = (field: typeof fields[number], index: number, content: React.ReactNode) => {
    switch (variant) {
      case 'card':
        return (
          <Paper key={field.id} variant="outlined" sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {reorderable && (
                <Box sx={{ display: 'flex', flexDirection: 'column', mr: 1 }}>
                  <IconButton
                    size="small"
                    onClick={() => handleMoveUp(index)}
                    disabled={disabled || index === 0}
                  >
                    <KeyboardArrowUp fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleMoveDown(index)}
                    disabled={disabled || index === fields.length - 1}
                  >
                    <KeyboardArrowDown fontSize="small" />
                  </IconButton>
                </Box>
              )}
              <Box sx={{ flexGrow: 1 }}>{content}</Box>
              <IconButton
                onClick={() => handleRemove(index)}
                disabled={!canRemove}
                color="error"
                size="small"
                sx={{ alignSelf: 'flex-start' }}
              >
                <Delete fontSize="small" />
              </IconButton>
            </Box>
          </Paper>
        );

      case 'compact':
        return (
          <Box key={field.id} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
            {reorderable && (
              <DragIndicator sx={{ mt: 1.5, color: 'action.disabled', cursor: 'grab' }} />
            )}
            <Box sx={{ flexGrow: 1 }}>{content}</Box>
            <IconButton
              onClick={() => handleRemove(index)}
              disabled={!canRemove}
              size="small"
              sx={{ mt: 0.5 }}
            >
              <Delete fontSize="small" />
            </IconButton>
          </Box>
        );

      default:
        return (
          <Box key={field.id}>
            {index > 0 && <Divider sx={{ my: 2 }} />}
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
              {reorderable && (
                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                  <IconButton
                    size="small"
                    onClick={() => handleMoveUp(index)}
                    disabled={disabled || index === 0}
                  >
                    <KeyboardArrowUp fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleMoveDown(index)}
                    disabled={disabled || index === fields.length - 1}
                  >
                    <KeyboardArrowDown fontSize="small" />
                  </IconButton>
                </Box>
              )}
              <Box sx={{ flexGrow: 1 }}>{content}</Box>
              <IconButton
                onClick={() => handleRemove(index)}
                disabled={!canRemove}
                color="error"
              >
                <Delete />
              </IconButton>
            </Box>
          </Box>
        );
    }
  };

  return (
    <Box>
      {/* Header */}
      {(title || maxItems) && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          {title && (
            <Typography variant="subtitle1" fontWeight={500}>
              {title}
            </Typography>
          )}
          {maxItems && (
            <Typography variant="caption" color="text.secondary">
              {fields.length} / {maxItems}
            </Typography>
          )}
        </Box>
      )}

      {/* Items */}
      {fields.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
          {emptyMessage}
        </Typography>
      ) : (
        <Stack spacing={variant === 'card' ? 2 : 0}>
          {fields.map((field, index) => getItemWrapper(field, index, renderItem(field, index)))}
        </Stack>
      )}

      {/* Add Button */}
      <Button
        startIcon={<Add />}
        onClick={handleAdd}
        disabled={!canAdd}
        variant="outlined"
        size="small"
        sx={{ mt: 2 }}
      >
        {addButtonText}
        {maxItems && ` (${maxItems - fields.length} remaining)`}
      </Button>
    </Box>
  );
}

// =============================================================================
// Hook for external control
// =============================================================================

export function useRHFFieldArray<
  TFieldValues extends FieldValues = FieldValues,
  TFieldArrayName extends FieldArrayPath<TFieldValues> = FieldArrayPath<TFieldValues>
>(
  name: TFieldArrayName,
  control?: Control<TFieldValues>
): UseFieldArrayReturn<TFieldValues, TFieldArrayName> & {
  isEmpty: boolean;
  count: number;
} {
  const formContext = useFormContext<TFieldValues>();
  const resolvedControl = control ?? formContext?.control;

  if (!resolvedControl) {
    throw new Error('useRHFFieldArray must be used within FormProvider or receive control prop');
  }

  const fieldArray = useFieldArray({
    control: resolvedControl,
    name,
  });

  return {
    ...fieldArray,
    isEmpty: fieldArray.fields.length === 0,
    count: fieldArray.fields.length,
  };
}
