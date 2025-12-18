import React, { useCallback, useRef, useState } from 'react';
import { useController, useFormContext, FieldValues, FieldPath } from 'react-hook-form';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import FormHelperText from '@mui/material/FormHelperText';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Paper from '@mui/material/Paper';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import ImageIcon from '@mui/icons-material/Image';
import DeleteIcon from '@mui/icons-material/Delete';
import type { RHFFileUploadProps } from '../types';
import { useFieldRequired } from '../context/SchemaContext';

/**
 * Format file size in human-readable format
 */
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Check if file is an image
 */
function isImageFile(file: File): boolean {
  return file.type.startsWith('image/');
}

/**
 * File upload component integrated with React Hook Form
 *
 * @example Button variant
 * ```tsx
 * <RHFFileUpload
 *   name="avatar"
 *   label="Profile Picture"
 *   accept="image/*"
 *   maxSize={5 * 1024 * 1024}
 *   variant="button"
 * />
 * ```
 *
 * @example Dropzone variant
 * ```tsx
 * <RHFFileUpload
 *   name="documents"
 *   label="Documents"
 *   accept=".pdf,.doc,.docx"
 *   multiple
 *   maxFiles={5}
 *   variant="dropzone"
 *   dropzoneText="Drag and drop files here"
 * />
 * ```
 *
 * @example With preview
 * ```tsx
 * <RHFFileUpload
 *   name="photos"
 *   label="Photos"
 *   accept="image/*"
 *   multiple
 *   showPreview
 *   maxSize={10 * 1024 * 1024}
 * />
 * ```
 */
export function RHFFileUpload<
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
  accept,
  multiple = false,
  maxSize,
  maxFiles,
  variant = 'button',
  buttonText = 'Upload File',
  dropzoneText = 'Drag and drop files here, or click to select',
  showPreview = false,
}: RHFFileUploadProps<TFieldValues, TName>) {
  const formContext = useFormContext<TFieldValues>();
  const control = controlProp ?? formContext?.control;

  const schemaRequired = useFieldRequired(name);
  const required = requiredProp ?? schemaRequired;

  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

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

  const files: File[] = value ? (Array.isArray(value) ? value : [value]) : [];

  const validateFiles = useCallback(
    (newFiles: File[]): { valid: File[]; errors: string[] } => {
      const errors: string[] = [];
      const valid: File[] = [];

      for (const file of newFiles) {
        // Check file size
        if (maxSize && file.size > maxSize) {
          errors.push(`${file.name} exceeds maximum size of ${formatFileSize(maxSize)}`);
          continue;
        }

        // Check max files
        if (maxFiles && files.length + valid.length >= maxFiles) {
          errors.push(`Maximum ${maxFiles} files allowed`);
          break;
        }

        valid.push(file);
      }

      return { valid, errors };
    },
    [maxSize, maxFiles, files.length]
  );

  const handleFiles = useCallback(
    (newFiles: FileList | null) => {
      if (!newFiles || newFiles.length === 0) return;

      const fileArray = Array.from(newFiles);
      const { valid, errors } = validateFiles(fileArray);

      if (errors.length > 0) {
        setLocalError(errors.join('. '));
      } else {
        setLocalError(null);
      }

      if (valid.length > 0) {
        if (multiple) {
          onChange([...files, ...valid]);
        } else {
          onChange(valid[0]);
        }
      }
    },
    [validateFiles, multiple, files, onChange]
  );

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(event.target.files);
    // Reset input value to allow selecting same file again
    event.target.value = '';
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    if (!disabled) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
    if (!disabled) {
      handleFiles(event.dataTransfer.files);
    }
  };

  const handleRemove = (index: number) => {
    if (multiple) {
      const newFiles = files.filter((_, i) => i !== index);
      onChange(newFiles.length > 0 ? newFiles : null);
    } else {
      onChange(null);
    }
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  const displayError = error?.message ?? localError ?? helperText;

  return (
    <FormControl fullWidth={fullWidth} error={!!error || !!localError} disabled={disabled}>
      {label && (
        <FormLabel required={required} sx={{ mb: 1 }}>
          {label}
        </FormLabel>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleInputChange}
        onBlur={onBlur}
        disabled={disabled}
        style={{ display: 'none' }}
      />

      {variant === 'dropzone' ? (
        <Paper
          variant="outlined"
          sx={{
            p: 3,
            textAlign: 'center',
            cursor: disabled ? 'default' : 'pointer',
            backgroundColor: isDragOver ? 'action.hover' : 'background.paper',
            borderColor: isDragOver ? 'primary.main' : error || localError ? 'error.main' : 'divider',
            borderStyle: 'dashed',
            transition: 'all 0.2s',
            '&:hover': disabled
              ? {}
              : {
                  borderColor: 'primary.main',
                  backgroundColor: 'action.hover',
                },
          }}
          onClick={handleClick}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <CloudUploadIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
          <Typography variant="body1" color="text.secondary">
            {dropzoneText}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            {accept && `Accepted: ${accept}`}
            {maxSize && ` | Max size: ${formatFileSize(maxSize)}`}
            {maxFiles && ` | Max files: ${maxFiles}`}
          </Typography>
        </Paper>
      ) : (
        <Button
          variant="outlined"
          startIcon={<CloudUploadIcon />}
          onClick={handleClick}
          disabled={disabled || (maxFiles ? files.length >= maxFiles : false)}
        >
          {buttonText}
        </Button>
      )}

      {files.length > 0 && (
        <List dense sx={{ mt: 1 }}>
          {files.map((file, index) => (
            <ListItem
              key={`${file.name}-${index}`}
              secondaryAction={
                <IconButton
                  edge="end"
                  size="small"
                  onClick={() => handleRemove(index)}
                  disabled={disabled}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              }
            >
              <ListItemIcon>
                {isImageFile(file) ? <ImageIcon /> : <InsertDriveFileIcon />}
              </ListItemIcon>
              <ListItemText
                primary={file.name}
                secondary={formatFileSize(file.size)}
              />
            </ListItem>
          ))}
        </List>
      )}

      {showPreview && files.length > 0 && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
          {files.filter(isImageFile).map((file, index) => (
            <Box
              key={`preview-${index}`}
              sx={{
                width: 80,
                height: 80,
                borderRadius: 1,
                overflow: 'hidden',
                position: 'relative',
              }}
            >
              <img
                src={URL.createObjectURL(file)}
                alt={file.name}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
                onLoad={(e) => URL.revokeObjectURL((e.target as HTMLImageElement).src)}
              />
            </Box>
          ))}
        </Box>
      )}

      {displayError && <FormHelperText>{displayError}</FormHelperText>}
    </FormControl>
  );
}
