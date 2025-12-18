import { useState, useMemo, useCallback, MouseEvent } from 'react';
import { useController, useFormContext, FieldValues, FieldPath } from 'react-hook-form';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Popover from '@mui/material/Popover';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Checkbox from '@mui/material/Checkbox';
import Collapse from '@mui/material/Collapse';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Chip from '@mui/material/Chip';
import FormHelperText from '@mui/material/FormHelperText';
import type { RHFTreeSelectProps, TreeNode } from '../types';
import { useFieldRequired } from '../context/SchemaContext';

interface TreeItemProps {
  node: TreeNode;
  level: number;
  selected: string[];
  expanded: string[];
  onToggleSelect: (value: string) => void;
  onToggleExpand: (value: string) => void;
  multiple?: boolean;
  disabled?: boolean;
  checkboxSelection?: boolean;
}

function TreeItem({
  node,
  level,
  selected,
  expanded,
  onToggleSelect,
  onToggleExpand,
  multiple,
  disabled,
  checkboxSelection,
}: TreeItemProps) {
  const hasChildren = node.children && node.children.length > 0;
  const isExpanded = expanded.includes(String(node.value));
  const isSelected = selected.includes(String(node.value));
  const isDisabled = disabled || node.disabled;

  const handleClick = () => {
    if (hasChildren && !checkboxSelection) {
      onToggleExpand(String(node.value));
    } else if (!hasChildren || checkboxSelection) {
      onToggleSelect(String(node.value));
    }
  };

  const handleExpandClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleExpand(String(node.value));
  };

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleSelect(String(node.value));
  };

  return (
    <>
      <ListItemButton
        onClick={handleClick}
        disabled={isDisabled}
        sx={{ pl: 2 + level * 2 }}
        selected={isSelected && !checkboxSelection}
      >
        {hasChildren && (
          <ListItemIcon sx={{ minWidth: 32 }}>
            <IconButton size="small" onClick={handleExpandClick} disabled={isDisabled}>
              <Box
                component="span"
                sx={{
                  transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s',
                  display: 'inline-block',
                }}
              >
                ▶
              </Box>
            </IconButton>
          </ListItemIcon>
        )}
        {!hasChildren && <ListItemIcon sx={{ minWidth: 32 }} />}
        {checkboxSelection && (
          <ListItemIcon sx={{ minWidth: 36 }}>
            <Checkbox
              edge="start"
              checked={isSelected}
              tabIndex={-1}
              disableRipple
              disabled={isDisabled}
              onClick={handleCheckboxClick}
            />
          </ListItemIcon>
        )}
        <ListItemText
          primary={node.label}
          secondary={node.description}
        />
      </ListItemButton>
      {hasChildren && (
        <Collapse in={isExpanded} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {node.children!.map((child) => (
              <TreeItem
                key={child.value}
                node={child}
                level={level + 1}
                selected={selected}
                expanded={expanded}
                onToggleSelect={onToggleSelect}
                onToggleExpand={onToggleExpand}
                multiple={multiple}
                disabled={disabled}
                checkboxSelection={checkboxSelection}
              />
            ))}
          </List>
        </Collapse>
      )}
    </>
  );
}

function flattenTree(nodes: TreeNode[]): TreeNode[] {
  const result: TreeNode[] = [];
  const traverse = (node: TreeNode) => {
    result.push(node);
    if (node.children) {
      node.children.forEach(traverse);
    }
  };
  nodes.forEach(traverse);
  return result;
}

function findNodeByValue(nodes: TreeNode[], value: string): TreeNode | undefined {
  for (const node of nodes) {
    if (String(node.value) === value) return node;
    if (node.children) {
      const found = findNodeByValue(node.children, value);
      if (found) return found;
    }
  }
  return undefined;
}

/**
 * Tree select component for hierarchical data selection
 *
 * @example Single selection
 * ```tsx
 * <RHFTreeSelect
 *   name="department"
 *   label="Department"
 *   nodes={[
 *     {
 *       value: 'engineering',
 *       label: 'Engineering',
 *       children: [
 *         { value: 'frontend', label: 'Frontend' },
 *         { value: 'backend', label: 'Backend' },
 *       ],
 *     },
 *     {
 *       value: 'marketing',
 *       label: 'Marketing',
 *     },
 *   ]}
 * />
 * ```
 *
 * @example Multiple selection
 * ```tsx
 * <RHFTreeSelect
 *   name="categories"
 *   label="Categories"
 *   multiple
 *   checkboxSelection
 *   nodes={categoryTree}
 * />
 * ```
 */
export function RHFTreeSelect<
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
  fullWidth = true,
  label,
  placeholder = 'Select...',
  nodes,
  multiple = false,
  checkboxSelection = false,
  expandAll = false,
  size = 'medium',
  maxHeight = 400,
  clearable = true,
}: RHFTreeSelectProps<TFieldValues, TName>) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [expanded, setExpanded] = useState<string[]>(() => {
    if (expandAll) {
      return flattenTree(nodes)
        .filter((n) => n.children && n.children.length > 0)
        .map((n) => String(n.value));
    }
    return [];
  });

  const formContext = useFormContext<TFieldValues>();
  const control = controlProp ?? formContext?.control;

  const schemaRequired = useFieldRequired(name);
  const required = requiredProp ?? schemaRequired;

  const {
    field: { value, onChange, onBlur, ref },
    fieldState: { error },
  } = useController({
    name,
    control,
    rules,
    defaultValue,
    shouldUnregister,
  });

  const selectedValues = useMemo(() => {
    if (multiple) {
      return Array.isArray(value) ? value.map(String) : [];
    }
    return value !== undefined && value !== null && value !== '' ? [String(value)] : [];
  }, [value, multiple]);

  const selectedLabels = useMemo(() => {
    return selectedValues
      .map((v: string) => findNodeByValue(nodes, v))
      .filter(Boolean)
      .map((n: TreeNode | undefined) => n!.label);
  }, [selectedValues, nodes]);

  const displayValue = useMemo(() => {
    if (selectedLabels.length === 0) return '';
    if (!multiple) return selectedLabels[0];
    return selectedLabels.join(', ');
  }, [selectedLabels, multiple]);

  const handleOpen = (event: MouseEvent<HTMLElement>) => {
    if (!disabled) {
      setAnchorEl(event.currentTarget);
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
    onBlur();
  };

  const handleToggleSelect = useCallback(
    (nodeValue: string) => {
      if (multiple) {
        const newValues = selectedValues.includes(nodeValue)
          ? selectedValues.filter((v: string) => v !== nodeValue)
          : [...selectedValues, nodeValue];
        onChange(newValues);
      } else {
        onChange(nodeValue);
        handleClose();
      }
    },
    [multiple, selectedValues, onChange]
  );

  const handleToggleExpand = useCallback((nodeValue: string) => {
    setExpanded((prev) =>
      prev.includes(nodeValue) ? prev.filter((v: string) => v !== nodeValue) : [...prev, nodeValue]
    );
  }, []);

  const handleClear = (e: MouseEvent) => {
    e.stopPropagation();
    onChange(multiple ? [] : '');
  };

  const handleDeleteChip = (valueToDelete: string) => (e: MouseEvent) => {
    e.stopPropagation();
    if (multiple) {
      onChange(selectedValues.filter((v: string) => v !== valueToDelete));
    } else {
      onChange('');
    }
  };

  const open = Boolean(anchorEl);

  return (
    <Box sx={{ width: fullWidth ? '100%' : 'auto' }}>
      <TextField
        inputRef={ref}
        label={label}
        value={displayValue}
        onClick={handleOpen}
        error={!!error}
        disabled={disabled}
        fullWidth={fullWidth}
        size={size}
        required={required}
        placeholder={placeholder}
        slotProps={{
          input: {
            readOnly: true,
            endAdornment: (
              <InputAdornment position="end">
                {clearable && selectedValues.length > 0 && (
                  <IconButton
                    size="small"
                    onClick={handleClear}
                    disabled={disabled}
                    sx={{ mr: 0.5 }}
                  >
                    ✕
                  </IconButton>
                )}
                <Box
                  component="span"
                  sx={{
                    transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s',
                    display: 'inline-block',
                  }}
                >
                  ▼
                </Box>
              </InputAdornment>
            ),
            startAdornment: multiple && selectedValues.length > 0 ? (
              <InputAdornment position="start" sx={{ flexWrap: 'wrap', gap: 0.5, maxWidth: '70%' }}>
                {selectedValues.slice(0, 3).map((v: string) => {
                  const node = findNodeByValue(nodes, v);
                  return (
                    <Chip
                      key={v}
                      label={node?.label ?? v}
                      size="small"
                      onDelete={handleDeleteChip(v)}
                      disabled={disabled}
                    />
                  );
                })}
                {selectedValues.length > 3 && (
                  <Chip
                    label={`+${selectedValues.length - 3}`}
                    size="small"
                    disabled={disabled}
                  />
                )}
              </InputAdornment>
            ) : undefined,
          },
          htmlInput: {
            style: {
              cursor: 'pointer',
              ...(multiple && selectedValues.length > 0 ? { width: 0, minWidth: 0 } : {}),
            },
          },
        }}
      />

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        slotProps={{
          paper: {
            sx: {
              width: anchorEl?.offsetWidth ?? 300,
              maxHeight: maxHeight,
              overflow: 'auto',
            },
          },
        }}
      >
        <List dense>
          {nodes.map((node) => (
            <TreeItem
              key={node.value}
              node={node}
              level={0}
              selected={selectedValues}
              expanded={expanded}
              onToggleSelect={handleToggleSelect}
              onToggleExpand={handleToggleExpand}
              multiple={multiple}
              disabled={disabled}
              checkboxSelection={checkboxSelection}
            />
          ))}
        </List>
      </Popover>

      {(error?.message || helperText) && (
        <FormHelperText error={!!error}>{error?.message ?? helperText}</FormHelperText>
      )}
    </Box>
  );
}
