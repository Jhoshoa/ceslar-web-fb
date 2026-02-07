/**
 * Cloudinary Configuration
 *
 * Setup and utilities for Cloudinary image uploads.
 */

import { v2 as cloudinary, UploadApiResponse, UploadApiOptions } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * Upload options interface
 */
interface UploadOptions {
  folder?: string;
  width?: number;
  height?: number;
  publicId?: string;
  [key: string]: unknown;
}

/**
 * Formatted upload result
 */
interface UploadResult {
  publicId: string;
  url: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
  createdAt: string;
}

/**
 * Optimized URL options
 */
interface OptimizedUrlOptions {
  width?: number;
  height?: number;
  crop?: string;
  quality?: string;
}

/**
 * Responsive URLs result
 */
interface ResponsiveUrls {
  src: string;
  srcset: string;
  sizes: string;
}

/**
 * Default upload options
 */
const DEFAULT_OPTIONS: UploadApiOptions = {
  resource_type: 'image',
  folder: 'ceslar',
  allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
  transformation: {
    quality: 'auto:good',
    fetch_format: 'auto',
  },
};

/**
 * Format upload result
 */
function formatUploadResult(result: UploadApiResponse): UploadResult {
  return {
    publicId: result.public_id,
    url: result.secure_url,
    width: result.width,
    height: result.height,
    format: result.format,
    bytes: result.bytes,
    createdAt: result.created_at,
  };
}

/**
 * Upload an image to Cloudinary
 */
export async function uploadImage(
  source: Buffer | string,
  options: UploadOptions = {}
): Promise<UploadResult> {
  const { folder = 'ceslar', width, height, publicId, ...rest } = options;

  const uploadOptions: UploadApiOptions = {
    ...DEFAULT_OPTIONS,
    folder,
    ...rest,
  };

  // Add transformations if dimensions specified
  if (width || height) {
    uploadOptions.transformation = {
      ...(uploadOptions.transformation as object),
      ...(width && { width }),
      ...(height && { height }),
      crop: 'limit',
    };
  }

  if (publicId) {
    uploadOptions.public_id = publicId;
    uploadOptions.overwrite = true;
  }

  // Handle buffer
  if (Buffer.isBuffer(source)) {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          if (error) reject(error);
          else if (result) resolve(formatUploadResult(result));
          else reject(new Error('No result from upload'));
        }
      );
      uploadStream.end(source);
    });
  }

  // Handle base64 or URL
  const result = await cloudinary.uploader.upload(source, uploadOptions);
  return formatUploadResult(result);
}

/**
 * Upload multiple images
 */
export async function uploadImages(
  sources: (Buffer | string)[],
  options: UploadOptions = {}
): Promise<UploadResult[]> {
  const results = await Promise.all(
    sources.map((source) => uploadImage(source, options))
  );
  return results;
}

/**
 * Delete an image from Cloudinary
 */
export async function deleteImage(
  publicId: string
): Promise<{ result: string }> {
  return cloudinary.uploader.destroy(publicId);
}

/**
 * Delete multiple images
 */
export async function deleteImages(
  publicIds: string[]
): Promise<{ deleted: Record<string, string> }> {
  return cloudinary.api.delete_resources(publicIds);
}

/**
 * Generate optimized image URL
 */
export function getOptimizedUrl(
  publicId: string,
  options: OptimizedUrlOptions = {}
): string {
  const { width, height, crop = 'fill', quality = 'auto' } = options;

  const transformations = {
    fetch_format: 'auto',
    quality,
    ...(width && { width }),
    ...(height && { height }),
    ...(width || height ? { crop } : {}),
  };

  return cloudinary.url(publicId, {
    transformation: transformations,
    secure: true,
  });
}

/**
 * Generate responsive image URLs
 */
export function getResponsiveUrls(
  publicId: string,
  widths: number[] = [320, 640, 960, 1280]
): ResponsiveUrls {
  const srcset = widths
    .map((w) => {
      const url = getOptimizedUrl(publicId, { width: w });
      return `${url} ${w}w`;
    })
    .join(', ');

  return {
    src: getOptimizedUrl(publicId, { width: widths[widths.length - 1] }),
    srcset,
    sizes: '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
  };
}

/**
 * Extract public ID from Cloudinary URL
 */
export function getPublicIdFromUrl(url: string): string | null {
  if (!url) return null;

  // Match pattern: /upload/v{version}/{folder}/{publicId}.{ext}
  const match = url.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.[^.]+)?$/);
  return match ? match[1] : null;
}

// Export cloudinary instance for advanced usage
export { cloudinary };
