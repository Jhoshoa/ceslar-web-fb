/**
 * useCloudinary Hook
 *
 * Custom hook for Cloudinary image operations.
 * Supports both unsigned (direct) and signed (via backend) uploads.
 */

import { useState, useCallback } from 'react';
import { useUploadImageMutation, useDeleteImageMutation } from '../store/api/mediaApi';

// Cloudinary configuration from environment
const CLOUDINARY_CONFIG = {
  cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || '',
  uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || '',
};

export interface UploadOptions {
  folder?: string;
  useSignedUpload?: boolean;
  maxSizeMB?: number;
  allowedTypes?: string[];
}

export interface UploadResult {
  url: string;
  publicId: string;
  width?: number;
  height?: number;
  format?: string;
}

interface UseCloudinaryReturn {
  uploadImage: (file: File, options?: UploadOptions) => Promise<UploadResult>;
  deleteImage: (urlOrPublicId: string) => Promise<boolean>;
  isUploading: boolean;
  isDeleting: boolean;
  error: string | null;
  clearError: () => void;
}

/**
 * Convert file to base64
 */
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

/**
 * Extract public ID from Cloudinary URL
 */
export const getPublicIdFromUrl = (url: string): string | null => {
  if (!url) return null;
  // Match pattern: /upload/v{version}/{folder}/{publicId}.{ext}
  const match = url.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.[^.]+)?$/);
  return match ? match[1] : null;
};

export const useCloudinary = (): UseCloudinaryReturn => {
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [uploadImageMutation] = useUploadImageMutation();
  const [deleteImageMutation] = useDeleteImageMutation();

  const clearError = useCallback(() => setError(null), []);

  /**
   * Upload image to Cloudinary
   * Uses unsigned upload by default, or signed upload via backend if specified
   */
  const uploadImage = useCallback(
    async (file: File, options: UploadOptions = {}): Promise<UploadResult> => {
      const {
        folder = 'ceslar',
        useSignedUpload = false,
        maxSizeMB = 10,
        allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
      } = options;

      setError(null);
      setIsUploading(true);

      try {
        // Validate file type
        if (!allowedTypes.includes(file.type)) {
          throw new Error(`Invalid file type. Allowed: ${allowedTypes.join(', ')}`);
        }

        // Validate file size
        if (file.size > maxSizeMB * 1024 * 1024) {
          throw new Error(`File too large. Maximum size: ${maxSizeMB}MB`);
        }

        // Use signed upload via backend
        if (useSignedUpload) {
          const base64 = await fileToBase64(file);
          const result = await uploadImageMutation({
            image: base64,
            folder,
          }).unwrap();

          return {
            url: result.url,
            publicId: result.publicId,
            width: result.width,
            height: result.height,
            format: result.format,
          };
        }

        // Use unsigned upload directly to Cloudinary
        if (!CLOUDINARY_CONFIG.cloudName || !CLOUDINARY_CONFIG.uploadPreset) {
          throw new Error('Cloudinary configuration is missing');
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);
        formData.append('folder', folder);

        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/upload`,
          {
            method: 'POST',
            body: formData,
          }
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error?.message || 'Upload failed');
        }

        const data = await response.json();

        return {
          url: data.secure_url,
          publicId: data.public_id,
          width: data.width,
          height: data.height,
          format: data.format,
        };
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Upload failed';
        setError(message);
        throw err;
      } finally {
        setIsUploading(false);
      }
    },
    [uploadImageMutation]
  );

  /**
   * Delete image from Cloudinary
   * Requires backend API (signed operation)
   */
  const deleteImage = useCallback(
    async (urlOrPublicId: string): Promise<boolean> => {
      setError(null);
      setIsDeleting(true);

      try {
        // Determine if it's a URL or public ID
        const isUrl = urlOrPublicId.startsWith('http');

        const result = await deleteImageMutation(
          isUrl ? { url: urlOrPublicId } : { publicId: urlOrPublicId }
        ).unwrap();

        return result.deleted;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Delete failed';
        setError(message);
        throw err;
      } finally {
        setIsDeleting(false);
      }
    },
    [deleteImageMutation]
  );

  return {
    uploadImage,
    deleteImage,
    isUploading,
    isDeleting,
    error,
    clearError,
  };
};

export default useCloudinary;
