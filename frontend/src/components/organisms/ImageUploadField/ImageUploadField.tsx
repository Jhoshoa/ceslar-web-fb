import { useState, useCallback, ReactNode, DragEvent, ChangeEvent } from 'react';
import {
  Box,
  FormHelperText,
  IconButton,
  CircularProgress,
  alpha,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import ImageIcon from '@mui/icons-material/Image';
import Typography from '../../atoms/Typography/Typography';

interface ImageUploadFieldProps {
  label?: string;
  name: string;
  value?: string | null;
  onChange: (url: string | null) => void;
  error?: string;
  helperText?: string;
  description?: string;
  required?: boolean;
  disabled?: boolean;
  accept?: string;
  maxSizeMB?: number;
  aspectRatio?: 'square' | 'landscape' | 'portrait' | 'free';
  previewHeight?: number;
  cloudinaryConfig?: {
    cloudName: string;
    uploadPreset: string;
    folder?: string;
  };
}

const ImageUploadField = ({
  label,
  name,
  value,
  onChange,
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
}: ImageUploadFieldProps): ReactNode => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

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

  const uploadToCloudinary = async (file: File): Promise<string> => {
    if (!cloudinaryConfig) {
      // Fallback: create object URL (temporary, won't persist)
      return URL.createObjectURL(file);
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', cloudinaryConfig.uploadPreset);
    if (cloudinaryConfig.folder) {
      formData.append('folder', cloudinaryConfig.folder);
    }

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    const data = await response.json();
    return data.secure_url;
  };

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

      setIsUploading(true);
      try {
        const url = await uploadToCloudinary(file);
        onChange(url);
      } catch {
        setUploadError('Failed to upload image. Please try again.');
      } finally {
        setIsUploading(false);
      }
    },
    [onChange, maxSizeMB, cloudinaryConfig]
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

  const handleRemove = () => {
    onChange(null);
    setUploadError(null);
  };

  const displayError = error || uploadError;

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
            {!disabled && (
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
              <CircularProgress size={40} />
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
          disabled={disabled || isUploading}
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
    </Box>
  );
};

export default ImageUploadField;
