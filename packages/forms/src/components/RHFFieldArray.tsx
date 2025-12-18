import { Fragment, useCallback, useEffect } from 'react';
import {
  useFieldArray,
  useFormContext,
  FieldValues,
  FieldArrayPath,
  ArrayPath,
  FieldArray,
} from 'react-hook-form';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import type { RHFFieldArrayProps, FieldArrayRenderProps } from '../types';

/**
 * Field array component for managing dynamic lists of form fields
 *
 * @example Basic usage
 * ```tsx
 * <RHFFieldArray
 *   name="phones"
 *   title="Phone Numbers"
 *   defaultValue={{ type: 'mobile', number: '' }}
 *   minItems={1}
 *   maxItems={5}
 * >
 *   {({ namePrefix, remove, isFirst }) => (
 *     <Box sx={{ display: 'flex', gap: 2 }}>
 *       <RHFSelect name={`${namePrefix}.type`} label="Type" options={phoneTypes} />
 *       <RHFTextField name={`${namePrefix}.number`} label="Number" />
 *     </Box>
 *   )}
 * </RHFFieldArray>
 * ```
 *
 * @example Card variant with reordering
 * ```tsx
 * <RHFFieldArray
 *   name="nominees"
 *   title="Nominees"
 *   variant="card"
 *   reorderable
 *   defaultValue={{ name: '', relation: '', percentage: 0 }}
 * >
 *   {({ namePrefix, index, total }) => (
 *     <Grid container spacing={2}>
 *       <Grid size={6}>
 *         <RHFTextField name={`${namePrefix}.name`} label="Name" />
 *       </Grid>
 *       <Grid size={3}>
 *         <RHFTextField name={`${namePrefix}.relation`} label="Relation" />
 *       </Grid>
 *       <Grid size={3}>
 *         <RHFNumberField name={`${namePrefix}.percentage`} label="%" />
 *       </Grid>
 *     </Grid>
 *   )}
 * </RHFFieldArray>
 * ```
 *
 * @example Compact variant
 * ```tsx
 * <RHFFieldArray
 *   name="items"
 *   variant="compact"
 *   defaultValue={{ sku: '', quantity: 1 }}
 *   addButtonText="Add Item"
 * >
 *   {({ namePrefix }) => (
 *     <Box sx={{ display: 'flex', gap: 1 }}>
 *       <RHFTextField name={`${namePrefix}.sku`} size="small" />
 *       <RHFNumberField name={`${namePrefix}.quantity`} size="small" />
 *     </Box>
 *   )}
 * </RHFFieldArray>
 * ```
 */
export function RHFFieldArray<
  TFieldValues extends FieldValues = FieldValues,
  TFieldArrayName extends FieldArrayPath<TFieldValues> = FieldArrayPath<TFieldValues>
>({
  name,
  control: controlProp,
  defaultValue,
  minItems = 0,
  maxItems,
  title,
  addButtonText = 'Add',
  reorderable = false,
  variant = 'default',
  onItemsChange,
  children,
}: RHFFieldArrayProps<TFieldValues, TFieldArrayName>) {
  const formContext = useFormContext<TFieldValues>();
  const control = controlProp ?? formContext?.control;

  const { fields, append, remove, move } = useFieldArray({
    control,
    name,
  });

  // Notify parent of item count changes
  useEffect(() => {
    onItemsChange?.(fields.length);
  }, [fields.length, onItemsChange]);

  const canAdd = maxItems === undefined || fields.length < maxItems;
  const canRemove = fields.length > minItems;
  const remainingSlots = maxItems ? maxItems - fields.length : undefined;

  const handleAdd = useCallback(() => {
    if (canAdd) {
      append(defaultValue as FieldArray<TFieldValues, ArrayPath<TFieldValues>>);
    }
  }, [append, defaultValue, canAdd]);

  const handleRemove = useCallback(
    (index: number) => {
      if (canRemove) {
        remove(index);
      }
    },
    [remove, canRemove]
  );

  const handleMoveUp = useCallback(
    (index: number) => {
      if (index > 0) {
        move(index, index - 1);
      }
    },
    [move]
  );

  const handleMoveDown = useCallback(
    (index: number) => {
      if (index < fields.length - 1) {
        move(index, index + 1);
      }
    },
    [move, fields.length]
  );

  const renderItem = (field: Record<'id', string>, index: number) => {
    const renderProps: FieldArrayRenderProps = {
      index,
      total: fields.length,
      remove: () => handleRemove(index),
      moveUp: () => handleMoveUp(index),
      moveDown: () => handleMoveDown(index),
      isFirst: index === 0,
      isLast: index === fields.length - 1,
      namePrefix: `${name}.${index}` as string,
    };

    if (variant === 'card') {
      return (
        <Paper key={field.id} elevation={1} sx={{ p: 2, mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
            {reorderable && (
              <Stack spacing={0} sx={{ mt: 1 }}>
                <IconButton
                  size="small"
                  onClick={() => handleMoveUp(index)}
                  disabled={renderProps.isFirst}
                  aria-label="Move up"
                >
                  <ArrowUpwardIcon fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => handleMoveDown(index)}
                  disabled={renderProps.isLast}
                  aria-label="Move down"
                >
                  <ArrowDownwardIcon fontSize="small" />
                </IconButton>
              </Stack>
            )}
            <Box sx={{ flex: 1 }}>{children(renderProps)}</Box>
            <IconButton
              color="error"
              onClick={() => handleRemove(index)}
              disabled={!canRemove}
              aria-label="Remove item"
              sx={{ mt: 1 }}
            >
              <DeleteIcon />
            </IconButton>
          </Box>
        </Paper>
      );
    }

    if (variant === 'compact') {
      return (
        <Box
          key={field.id}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            mb: 1,
          }}
        >
          {reorderable && (
            <DragIndicatorIcon
              sx={{ color: 'text.secondary', cursor: 'grab' }}
            />
          )}
          <Box sx={{ flex: 1 }}>{children(renderProps)}</Box>
          <IconButton
            size="small"
            color="error"
            onClick={() => handleRemove(index)}
            disabled={!canRemove}
            aria-label="Remove item"
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      );
    }

    // Default variant
    return (
      <Fragment key={field.id}>
        {index > 0 && <Divider sx={{ my: 2 }} />}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
          {reorderable && (
            <Stack spacing={0}>
              <IconButton
                size="small"
                onClick={() => handleMoveUp(index)}
                disabled={renderProps.isFirst}
                aria-label="Move up"
              >
                <ArrowUpwardIcon fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                onClick={() => handleMoveDown(index)}
                disabled={renderProps.isLast}
                aria-label="Move down"
              >
                <ArrowDownwardIcon fontSize="small" />
              </IconButton>
            </Stack>
          )}
          <Box sx={{ flex: 1 }}>{children(renderProps)}</Box>
          <IconButton
            color="error"
            onClick={() => handleRemove(index)}
            disabled={!canRemove}
            aria-label="Remove item"
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      </Fragment>
    );
  };

  return (
    <Box>
      {title && (
        <Typography variant="subtitle1" gutterBottom fontWeight="medium">
          {title}
        </Typography>
      )}

      {fields.length === 0 && (
        <Typography color="text.secondary" sx={{ mb: 2, fontStyle: 'italic' }}>
          No items added yet
        </Typography>
      )}

      {fields.map((field, index) => renderItem(field, index))}

      <Button
        variant="outlined"
        startIcon={<AddIcon />}
        onClick={handleAdd}
        disabled={!canAdd}
        sx={{ mt: fields.length > 0 ? 2 : 0 }}
      >
        {addButtonText}
        {remainingSlots !== undefined && remainingSlots > 0 && ` (${remainingSlots} remaining)`}
      </Button>
    </Box>
  );
}

/**
 * Hook to access field array functionality directly
 *
 * @example
 * ```tsx
 * const { fields, append, remove, isEmpty, count } = useRHFFieldArray('items');
 * ```
 */
export function useRHFFieldArray<
  TFieldValues extends FieldValues = FieldValues,
  TFieldArrayName extends FieldArrayPath<TFieldValues> = FieldArrayPath<TFieldValues>
>(name: TFieldArrayName) {
  const { control } = useFormContext<TFieldValues>();
  const fieldArray = useFieldArray({ control, name });

  return {
    ...fieldArray,
    isEmpty: fieldArray.fields.length === 0,
    count: fieldArray.fields.length,
  };
}
