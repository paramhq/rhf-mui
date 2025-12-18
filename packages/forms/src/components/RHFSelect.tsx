import React, { useMemo } from 'react';
import { useController, useFormContext, FieldValues, FieldPath } from 'react-hook-form';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import OutlinedInput from '@mui/material/OutlinedInput';
import MenuItem from '@mui/material/MenuItem';
import FormHelperText from '@mui/material/FormHelperText';
import ListSubheader from '@mui/material/ListSubheader';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import ClearIcon from '@mui/icons-material/Clear';
import type { RHFSelectProps, SelectOption } from '../types';
import { useFieldRequired } from '../context/SchemaContext';

/**
 * Select dropdown component integrated with React Hook Form
 *
 * @example
 * ```tsx
 * <RHFSelect
 *   name="country"
 *   label="Country"
 *   options={[
 *     { value: 'us', label: 'United States' },
 *     { value: 'uk', label: 'United Kingdom' },
 *     { value: 'ca', label: 'Canada' },
 *   ]}
 * />
 * ```
 *
 * @example With groups
 * ```tsx
 * <RHFSelect
 *   name="city"
 *   label="City"
 *   options={[
 *     { value: 'nyc', label: 'New York', group: 'USA' },
 *     { value: 'la', label: 'Los Angeles', group: 'USA' },
 *     { value: 'london', label: 'London', group: 'UK' },
 *   ]}
 * />
 * ```
 */
export function RHFSelect<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TValue = string | number
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
  options,
  label,
  placeholder,
  clearable = false,
  size = 'medium',
  ...selectProps
}: RHFSelectProps<TFieldValues, TName, TValue>) {
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

  // Group options if any have group property
  const groupedOptions = useMemo(() => {
    const hasGroups = options.some((opt) => opt.group);
    if (!hasGroups) return null;

    const groups: Record<string, SelectOption<TValue>[]> = {};
    options.forEach((opt) => {
      const group = opt.group ?? 'Other';
      if (!groups[group]) groups[group] = [];
      groups[group].push(opt);
    });
    return groups;
  }, [options]);

  const handleClear = (event: React.MouseEvent) => {
    event.stopPropagation();
    onChange('');
  };

  const labelId = `${name}-label`;

  const renderOptions = () => {
    if (groupedOptions) {
      return Object.entries(groupedOptions).flatMap(([group, opts]) => [
        <ListSubheader key={`group-${group}`}>{group}</ListSubheader>,
        ...opts.map((opt) => (
          <MenuItem key={String(opt.value)} value={opt.value as string | number} disabled={opt.disabled}>
            {opt.label}
          </MenuItem>
        )),
      ]);
    }

    return options.map((opt) => (
      <MenuItem key={String(opt.value)} value={opt.value as string | number} disabled={opt.disabled}>
        {opt.label}
      </MenuItem>
    ));
  };

  return (
    <FormControl fullWidth={fullWidth} error={!!error} disabled={disabled} size={size}>
      {label && (
        <InputLabel id={labelId} required={required}>
          {label}
        </InputLabel>
      )}
      <Select
        {...selectProps}
        labelId={labelId}
        label={label}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        inputRef={ref}
        displayEmpty={!!placeholder}
        input={
          <OutlinedInput
            label={label}
            endAdornment={
              clearable && value ? (
                <InputAdornment position="end" sx={{ mr: 2 }}>
                  <IconButton
                    size="small"
                    onClick={handleClear}
                    aria-label="Clear selection"
                    edge="end"
                  >
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ) : undefined
            }
          />
        }
        renderValue={
          placeholder && !value
            ? () => <span style={{ color: 'rgba(0, 0, 0, 0.38)' }}>{placeholder}</span>
            : undefined
        }
      >
        {placeholder && (
          <MenuItem value="" disabled>
            <em>{placeholder}</em>
          </MenuItem>
        )}
        {renderOptions()}
      </Select>
      {(error?.message || helperText) && (
        <FormHelperText>{error?.message ?? helperText}</FormHelperText>
      )}
    </FormControl>
  );
}
