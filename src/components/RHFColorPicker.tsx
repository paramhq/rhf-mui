import React, { useState, useCallback } from 'react';
import { useController, useFormContext, FieldValues, FieldPath } from 'react-hook-form';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Popover from '@mui/material/Popover';
import FormLabel from '@mui/material/FormLabel';
import FormHelperText from '@mui/material/FormHelperText';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import type { RHFColorPickerProps } from '../types';
import { useFieldRequired } from '../context/SchemaContext';

// Default color presets (Material Design colors)
const DEFAULT_PRESETS = [
  '#f44336', '#e91e63', '#9c27b0', '#673ab7',
  '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4',
  '#009688', '#4caf50', '#8bc34a', '#cddc39',
  '#ffeb3b', '#ffc107', '#ff9800', '#ff5722',
  '#795548', '#9e9e9e', '#607d8b', '#000000',
];

/**
 * Color picker component with preset colors and custom input
 *
 * Note: For advanced color picking (gradients, alpha), install react-colorful:
 * `npm install react-colorful`
 *
 * @example
 * ```tsx
 * <RHFColorPicker
 *   name="brandColor"
 *   label="Brand Color"
 *   presets={['#ff0000', '#00ff00', '#0000ff']}
 * />
 * ```
 */
export function RHFColorPicker<
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
  presets = DEFAULT_PRESETS,
  showAlpha = false,
  // format is reserved for future use with react-colorful integration
  format: _format = 'hex',
  size = 'medium',
}: RHFColorPickerProps<TFieldValues, TName>) {
  void _format; // Suppress unused variable warning
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

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

  const colorValue = String(value ?? '');

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    if (!disabled) {
      setAnchorEl(event.currentTarget);
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
    onBlur();
  };

  const handlePresetClick = useCallback(
    (color: string) => {
      onChange(color);
    },
    [onChange]
  );

  const handleInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = event.target.value;
      onChange(newValue);
    },
    [onChange]
  );

  const handleNativeColorChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onChange(event.target.value);
    },
    [onChange]
  );

  const isValidHex = (color: string) => /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);

  const open = Boolean(anchorEl);

  return (
    <Box sx={{ width: fullWidth ? '100%' : 'auto' }}>
      {label && (
        <FormLabel
          required={required}
          error={!!error}
          sx={{ display: 'block', mb: 0.5 }}
        >
          {label}
        </FormLabel>
      )}

      <TextField
        value={colorValue}
        onChange={handleInputChange}
        onClick={handleOpen}
        inputRef={ref}
        error={!!error}
        disabled={disabled}
        fullWidth={fullWidth}
        size={size}
        placeholder="#000000"
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <Box
                  sx={{
                    width: size === 'small' ? 20 : 24,
                    height: size === 'small' ? 20 : 24,
                    borderRadius: 0.5,
                    backgroundColor: isValidHex(colorValue) ? colorValue : '#ffffff',
                    border: '1px solid',
                    borderColor: 'divider',
                    cursor: disabled ? 'default' : 'pointer',
                  }}
                />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <Tooltip title="Pick color">
                  <IconButton
                    component="label"
                    size="small"
                    disabled={disabled}
                    sx={{ p: 0, overflow: 'hidden' }}
                  >
                    <input
                      type="color"
                      value={isValidHex(colorValue) ? colorValue : '#000000'}
                      onChange={handleNativeColorChange}
                      disabled={disabled}
                      style={{
                        width: size === 'small' ? 24 : 28,
                        height: size === 'small' ? 24 : 28,
                        border: 'none',
                        padding: 0,
                        cursor: disabled ? 'default' : 'pointer',
                      }}
                    />
                  </IconButton>
                </Tooltip>
              </InputAdornment>
            ),
          },
          htmlInput: {
            maxLength: showAlpha ? 9 : 7,
            style: { fontFamily: 'monospace' },
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
            sx: { p: 1.5, maxWidth: 240 },
          },
        }}
      >
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: 0.5,
          }}
        >
          {presets.map((color) => (
            <Tooltip key={color} title={color} arrow>
              <Box
                onClick={() => handlePresetClick(color)}
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: 0.5,
                  backgroundColor: color,
                  cursor: 'pointer',
                  border: '2px solid',
                  borderColor: colorValue === color ? 'primary.main' : 'transparent',
                  outline: '1px solid',
                  outlineColor: 'divider',
                  transition: 'transform 0.1s, border-color 0.1s',
                  '&:hover': {
                    transform: 'scale(1.1)',
                    borderColor: 'primary.light',
                  },
                }}
              />
            </Tooltip>
          ))}
        </Box>

        {/* Advanced color picker placeholder */}
        <Box sx={{ mt: 1.5, pt: 1.5, borderTop: 1, borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 1,
                backgroundColor: isValidHex(colorValue) ? colorValue : '#ffffff',
                border: '1px solid',
                borderColor: 'divider',
                flexShrink: 0,
              }}
            />
            <TextField
              value={colorValue}
              onChange={handleInputChange}
              size="small"
              fullWidth
              placeholder="#000000"
              slotProps={{
                htmlInput: {
                  maxLength: 7,
                  style: { fontFamily: 'monospace', fontSize: '0.875rem' },
                },
              }}
            />
          </Box>
        </Box>
      </Popover>

      {(error?.message || helperText) && (
        <FormHelperText error={!!error}>
          {error?.message ?? helperText}
        </FormHelperText>
      )}
    </Box>
  );
}
