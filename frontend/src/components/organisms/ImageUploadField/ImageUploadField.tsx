/**
 * ImageUploadField Organism
 *
 * Drag & drop image upload component with Cloudinary integration.
 * Supports both unsigned (direct) and signed (via backend) uploads.
 */

import { useState, useCallback, ReactNode, DragEvent, ChangeEvent } from 'react';
import {
  Box,
  FormHelperText,
  IconButton,
  CircularProgress,
  alpha,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button as MuiButton,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import ImageIcon from '@mui/icons-material/Image';
import Typography from '../../atoms/Typography/Typography';
import { useCloudinary } from '../../../hooks/useCloudinary';

interface CloudinaryConfig {
  cloudName: string;
  uploadPreset: string;
  folder?: string;
}

interface ImageUploadFieldProps {
  label?: string;
  name: string;
  value?: string | null;
  onChange: (url: string | null) => void;
  onDelete?: (url: string) => void;
  error?: string;
  helperText?: string;
  description?: string;
  required?: boolean;
  disabled?: boolean;
  accept?: string;
  maxSizeMB?: number;
  aspectRatio?: 'square' | 'landscape' | 'portrait' | 'free';
  previewHeight?: number;
  cloudinaryConfig?: CloudinaryConfig;
  useSignedUpload?: boolean;
  deleteFromServer?: boolean;
}

const ImageUploadField = ({
  label,
  name,
  value,
  onChange,
  onDelete,
  error,
  helperText,
  description,
  required = false,
  disabled = false,
  accept = 'image/*',
  maxSizeMB = 5,
  aspectRatio = 'free',
  previewHeight = 200,
  cloudinaryConfig,
  useSignedUpload = false,
  deleteFromServer = true,
}: ImageUploadFieldProps): ReactNode => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const {
    uploadImage,
    deleteImage,
    isUploading,
    isDeleting,
    error: cloudinaryError,
  } = useCloudinary();

  const getAspectRatioStyles = () => {
    switch (aspectRatio) {
      case 'square':
        return { paddingTop: '100%' };
      case 'landscape':
        return { paddingTop: '56.25%' }; // 16:9
      case 'portrait':
        return { paddingTop: '133.33%' }; // 3:4
      default:
        return { minHeight: previewHeight };
    }
  };

  /**
   * Upload to Cloudinary
   */
  const uploadToCloudinary = async (file: File): Promise<string> => {
    // If using signed upload via backend
    if (useSignedUpload) {
      const result = await uploadImage(file, {
        folder: cloudinaryConfig?.folder || 'ceslar',
        useSignedUpload: true,
        maxSizeMB,
      });
      return result.url;
    }

    // If cloudinaryConfig is provided, use unsigned upload
    if (cloudinaryConfig?.cloudName && cloudinaryConfig?.uploadPreset) {
      const result = await uploadImage(file, {
        folder: cloudinaryConfig.folder || 'ceslar',
        useSignedUpload: false,
        maxSizeMB,
      });
      return result.url;
    }

    // Fallback: create object URL (temporary, won't persist)
    console.warn('No Cloudinary config provided, using temporary URL');
    return URL.createObjectURL(file);
  };

  /**
   * Handle file selection/drop
   */
  const handleFile = useCallback(
    async (file: File) => {
      setUploadError(null);

      // Validate file type
      if (!file.type.startsWith('image/')) {
        setUploadError('Please select an image file');
        return;
      }

      // Validate file size
      if (file.size > maxSizeMB * 1024 * 1024) {
        setUploadError(`File size must be less than ${maxSizeMB}MB`);
        return;
      }

      try {
        const url = await uploadToCloudinary(file);
        onChange(url);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to upload image';
        setUploadError(message);
      }
    },
    [onChange, maxSizeMB, cloudinaryConfig, useSignedUpload]
  );

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;

    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = ''; // Reset to allow selecting same file
  };

  /**
   * Handle image removal
   */
  const handleRemove = async () => {
    if (!value) return;

    // If deleteFromServer is enabled and the URL is from Cloudinary
    if (deleteFromServer && value.includes('cloudinary.com')) {
      setShowDeleteConfirm(true);
    } else {
      // Just clear the value without server deletion
      onChange(null);
      setUploadError(null);
      onDelete?.(value);
    }
  };

  /**
   * Confirm and delete from server
   */
  const confirmDelete = async () => {
    if (!value) return;

    try {
      await deleteImage(value);
      onChange(null);
      setUploadError(null);
      onDelete?.(value);
    } catch (err) {
      // Even if server delete fails, clear the local value
      console.error('Failed to delete from server:', err);
      onChange(null);
      setUploadError(null);
    } finally {
      setShowDeleteConfirm(false);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  /**
   * Clear value without server deletion
   */
  const clearWithoutDelete = () => {
    onChange(null);
    setUploadError(null);
    setShowDeleteConfirm(false);
  };

  const displayError = error || uploadError || cloudinaryError;
  const isLoading = isUploading || isDeleting;

  return (
    <Box sx={{ mb: 2 }}>
      {label && (
        <Typography
          variant="body2"
          color="textSecondary"
          gutterBottom
          sx={{ fontWeight: 500 }}
        >
          {label}
          {required && <Box component="span" sx={{ color: 'error.main', ml: 0.5 }}>*</Box>}
        </Typography>
      )}

      <Box
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        sx={{
          position: 'relative',
          border: 2,
          borderStyle: 'dashed',
          borderColor: displayError
            ? 'error.main'
            : isDragging
            ? 'primary.main'
            : 'divider',
          borderRadius: 2,
          bgcolor: isDragging
            ? (theme) => alpha(theme.palette.primary.main, 0.04)
            : 'background.paper',
          overflow: 'hidden',
          transition: 'all 0.2s ease',
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.6 : 1,
          ...getAspectRatioStyles(),
        }}
      >
        {value ? (
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Box
              component="img"
              src={value}
              alt="Preview"
              sx={{
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain',
              }}
            />
            {!disabled && !isLoading && (
              <IconButton
                onClick={handleRemove}
                sx={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  bgcolor: 'background.paper',
                  boxShadow: 1,
                  '&:hover': { bgcolor: 'error.light', color: 'error.contrastText' },
                }}
                size="small"
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            )}
            {isDeleting && (
              <Box
                sx={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: 'rgba(0,0,0,0.5)',
                }}
              >
                <CircularProgress size={40} sx={{ color: 'white' }} />
              </Box>
            )}
          </Box>
        ) : (
          <Box
            component="label"
            htmlFor={`upload-${name}`}
            sx={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: disabled ? 'not-allowed' : 'pointer',
              p: 3,
            }}
          >
            {isUploading ? (
              <>
                <CircularProgress size={40} />
                <Typography variant="caption" color="textSecondary" sx={{ mt: 1 }}>
                  Uploading...
                </Typography>
              </>
            ) : (
              <>
                {isDragging ? (
                  <CloudUploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
                ) : (
                  <ImageIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                )}
                <Typography variant="body2" color="textSecondary" align="center">
                  {isDragging
                    ? 'Drop image here'
                    : 'Drag & drop or click to upload'}
                </Typography>
                <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5 }}>
                  Max size: {maxSizeMB}MB
                </Typography>
              </>
            )}
          </Box>
        )}

        <input
          id={`upload-${name}`}
          type="file"
          accept={accept}
          onChange={handleInputChange}
          disabled={disabled || isLoading}
          style={{ display: 'none' }}
        />
      </Box>

      {displayError && (
        <FormHelperText error sx={{ mt: 0.5 }}>
          {displayError}
        </FormHelperText>
      )}
      {description && !displayError && (
        <FormHelperText sx={{ mt: 0.5 }}>{description}</FormHelperText>
      )}
      {helperText && !displayError && (
        <FormHelperText sx={{ mt: 0.5 }}>{helperText}</FormHelperText>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={showDeleteConfirm}
        onClose={cancelDelete}
        aria-labelledby="delete-dialog-title"
      >
        <DialogTitle id="delete-dialog-title">
          Delete Image?
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Do you want to permanently delete this image from the server, or just remove it from this form?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <MuiButton onClick={cancelDelete} color="inherit">
            Cancel
          </MuiButton>
          <MuiButton onClick={clearWithoutDelete} color="primary">
            Remove Only
          </MuiButton>
          <MuiButton onClick={confirmDelete} color="error" disabled={isDeleting}>
            {isDeleting ? 'Deleting...' : 'Delete Permanently'}
          </MuiButton>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ImageUploadField;
