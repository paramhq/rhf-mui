import { useState, useMemo, useCallback } from 'react';
import { useController, useFormContext, FieldValues, FieldPath } from 'react-hook-form';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import Checkbox from '@mui/material/Checkbox';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import FormHelperText from '@mui/material/FormHelperText';
import type { RHFTransferListProps, TransferListItem } from '../types';
import { useFieldRequired } from '../context/SchemaContext';

function not<T>(a: T[], b: T[]): T[] {
  return a.filter((value) => !b.includes(value));
}

function intersection<T>(a: T[], b: T[]): T[] {
  return a.filter((value) => b.includes(value));
}

function union<T>(a: T[], b: T[]): T[] {
  return [...a, ...not(b, a)];
}

interface CustomListProps {
  title: string;
  items: TransferListItem[];
  checked: string[];
  onToggle: (value: string) => void;
  onToggleAll: () => void;
  disabled?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
  height?: number | string;
  emptyMessage?: string;
}

function CustomList({
  title,
  items,
  checked,
  onToggle,
  onToggleAll,
  disabled,
  searchable,
  searchPlaceholder = 'Search...',
  height = 300,
  emptyMessage = 'No items',
}: CustomListProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredItems = useMemo(() => {
    if (!searchTerm.trim()) return items;
    const lower = searchTerm.toLowerCase();
    return items.filter(
      (item) =>
        item.label.toLowerCase().includes(lower) ||
        String(item.value).toLowerCase().includes(lower)
    );
  }, [items, searchTerm]);

  const numberOfChecked = intersection(
    checked,
    items.map((i) => String(i.value))
  ).length;

  return (
    <Card variant="outlined" sx={{ flex: 1, minWidth: 0 }}>
      <CardHeader
        sx={{ px: 2, py: 1 }}
        avatar={
          <Checkbox
            onClick={onToggleAll}
            checked={numberOfChecked === items.length && items.length !== 0}
            indeterminate={numberOfChecked !== items.length && numberOfChecked !== 0}
            disabled={items.length === 0 || disabled}
            inputProps={{ 'aria-label': 'select all items' }}
          />
        }
        title={title}
        subheader={`${numberOfChecked}/${items.length} selected`}
      />
      <Divider />
      {searchable && (
        <Box sx={{ p: 1 }}>
          <TextField
            size="small"
            fullWidth
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            disabled={disabled}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Box component="span" sx={{ fontSize: '1rem' }}>🔍</Box>
                  </InputAdornment>
                ),
              },
            }}
          />
        </Box>
      )}
      <List
        sx={{
          height: height,
          overflow: 'auto',
        }}
        dense
        role="list"
      >
        {filteredItems.length === 0 ? (
          <ListItemButton disabled>
            <ListItemText
              primary={emptyMessage}
              sx={{ textAlign: 'center', color: 'text.secondary' }}
            />
          </ListItemButton>
        ) : (
          filteredItems.map((item) => {
            const labelId = `transfer-list-item-${item.value}-label`;
            const isChecked = checked.includes(String(item.value));

            return (
              <ListItemButton
                key={item.value}
                role="listitem"
                onClick={() => onToggle(String(item.value))}
                disabled={disabled || item.disabled}
              >
                <ListItemIcon>
                  <Checkbox
                    checked={isChecked}
                    tabIndex={-1}
                    disableRipple
                    disabled={disabled || item.disabled}
                    inputProps={{ 'aria-labelledby': labelId }}
                  />
                </ListItemIcon>
                <ListItemText
                  id={labelId}
                  primary={item.label}
                  secondary={item.description}
                />
              </ListItemButton>
            );
          })
        )}
      </List>
    </Card>
  );
}

/**
 * Transfer list component for moving items between two lists
 *
 * Value stored: Array of selected item values (right list)
 *
 * @example
 * ```tsx
 * <RHFTransferList
 *   name="permissions"
 *   label="User Permissions"
 *   items={[
 *     { value: 'read', label: 'Read Access' },
 *     { value: 'write', label: 'Write Access' },
 *     { value: 'delete', label: 'Delete Access' },
 *     { value: 'admin', label: 'Admin Access' },
 *   ]}
 * />
 * ```
 *
 * @example With search
 * ```tsx
 * <RHFTransferList
 *   name="assignedUsers"
 *   label="Assigned Users"
 *   searchable
 *   items={users.map(u => ({ value: u.id, label: u.name }))}
 * />
 * ```
 */
export function RHFTransferList<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  name,
  control: controlProp,
  rules,
  defaultValue,
  shouldUnregister,
  helperText,
  required: requiredProp,
  disabled,
  label,
  items,
  leftTitle = 'Available',
  rightTitle = 'Selected',
  searchable = false,
  searchPlaceholder,
  height = 300,
  emptyLeftMessage = 'No items available',
  emptyRightMessage = 'No items selected',
}: RHFTransferListProps<TFieldValues, TName>) {
  const [checked, setChecked] = useState<string[]>([]);

  const formContext = useFormContext<TFieldValues>();
  const control = controlProp ?? formContext?.control;

  const schemaRequired = useFieldRequired(name);
  const required = requiredProp ?? schemaRequired;

  const {
    field: { value, onChange, onBlur },
    fieldState: { error },
  } = useController({
    name,
    control,
    rules,
    defaultValue,
    shouldUnregister,
  });

  // Selected values (right list)
  const selectedValues: string[] = useMemo(() => {
    if (!Array.isArray(value)) return [];
    return value.map((v: unknown) => String(v));
  }, [value]);

  // Items for left list (available - not selected)
  const leftItems = useMemo(() => {
    return items.filter((item) => !selectedValues.includes(String(item.value)));
  }, [items, selectedValues]);

  // Items for right list (selected)
  const rightItems = useMemo(() => {
    return items.filter((item) => selectedValues.includes(String(item.value)));
  }, [items, selectedValues]);

  const leftChecked = intersection(
    checked,
    leftItems.map((i) => String(i.value))
  );
  const rightChecked = intersection(
    checked,
    rightItems.map((i) => String(i.value))
  );

  const handleToggle = useCallback((value: string) => {
    setChecked((prev) => {
      const currentIndex = prev.indexOf(value);
      if (currentIndex === -1) {
        return [...prev, value];
      }
      return prev.filter((v) => v !== value);
    });
  }, []);

  const handleToggleAllLeft = useCallback(() => {
    const leftValues = leftItems.filter((i) => !i.disabled).map((i) => String(i.value));
    if (leftChecked.length === leftValues.length) {
      setChecked((prev) => not(prev, leftValues));
    } else {
      setChecked((prev) => union(prev, leftValues));
    }
  }, [leftItems, leftChecked.length]);

  const handleToggleAllRight = useCallback(() => {
    const rightValues = rightItems.filter((i) => !i.disabled).map((i) => String(i.value));
    if (rightChecked.length === rightValues.length) {
      setChecked((prev) => not(prev, rightValues));
    } else {
      setChecked((prev) => union(prev, rightValues));
    }
  }, [rightItems, rightChecked.length]);

  const handleMoveRight = useCallback(() => {
    const newSelected = union(selectedValues, leftChecked);
    onChange(newSelected);
    setChecked(not(checked, leftChecked));
  }, [selectedValues, leftChecked, checked, onChange]);

  const handleMoveLeft = useCallback(() => {
    const newSelected = not(selectedValues, rightChecked);
    onChange(newSelected);
    setChecked(not(checked, rightChecked));
  }, [selectedValues, rightChecked, checked, onChange]);

  const handleMoveAllRight = useCallback(() => {
    const allLeftValues = leftItems.filter((i) => !i.disabled).map((i) => String(i.value));
    onChange(union(selectedValues, allLeftValues));
    setChecked([]);
  }, [leftItems, selectedValues, onChange]);

  const handleMoveAllLeft = useCallback(() => {
    const allRightValues = rightItems.filter((i) => !i.disabled).map((i) => String(i.value));
    onChange(not(selectedValues, allRightValues));
    setChecked([]);
  }, [rightItems, selectedValues, onChange]);

  return (
    <FormControl error={!!error} disabled={disabled} fullWidth>
      {label && (
        <FormLabel required={required} sx={{ mb: 1 }}>
          {label}
        </FormLabel>
      )}
      <Box
        sx={{
          display: 'flex',
          gap: 2,
          alignItems: 'center',
        }}
        onBlur={onBlur}
      >
        <CustomList
          title={leftTitle}
          items={leftItems}
          checked={checked}
          onToggle={handleToggle}
          onToggleAll={handleToggleAllLeft}
          disabled={disabled}
          searchable={searchable}
          searchPlaceholder={searchPlaceholder}
          height={height}
          emptyMessage={emptyLeftMessage}
        />

        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
          }}
        >
          <Button
            variant="outlined"
            size="small"
            onClick={handleMoveAllRight}
            disabled={disabled || leftItems.filter((i) => !i.disabled).length === 0}
            aria-label="move all right"
          >
            ≫
          </Button>
          <Button
            variant="outlined"
            size="small"
            onClick={handleMoveRight}
            disabled={disabled || leftChecked.length === 0}
            aria-label="move selected right"
          >
            &gt;
          </Button>
          <Button
            variant="outlined"
            size="small"
            onClick={handleMoveLeft}
            disabled={disabled || rightChecked.length === 0}
            aria-label="move selected left"
          >
            &lt;
          </Button>
          <Button
            variant="outlined"
            size="small"
            onClick={handleMoveAllLeft}
            disabled={disabled || rightItems.filter((i) => !i.disabled).length === 0}
            aria-label="move all left"
          >
            ≪
          </Button>
        </Box>

        <CustomList
          title={rightTitle}
          items={rightItems}
          checked={checked}
          onToggle={handleToggle}
          onToggleAll={handleToggleAllRight}
          disabled={disabled}
          searchable={searchable}
          searchPlaceholder={searchPlaceholder}
          height={height}
          emptyMessage={emptyRightMessage}
        />
      </Box>
      {(error?.message || helperText) && (
        <FormHelperText>{error?.message ?? helperText}</FormHelperText>
      )}
    </FormControl>
  );
}
