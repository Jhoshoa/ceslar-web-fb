/**
 * Cloudinary Configuration
 *
 * Setup and utilities for Cloudinary image uploads.
 */

const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * Default upload options
 */
const DEFAULT_OPTIONS = {
  resource_type: 'image',
  folder: 'ceslar',
  allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
  transformation: {
    quality: 'auto:good',
    fetch_format: 'auto',
  },
};

/**
 * Upload an image to Cloudinary
 *
 * @param {Buffer|string} source - Image buffer or base64 string
 * @param {Object} options - Upload options
 * @param {string} options.folder - Folder path in Cloudinary
 * @param {number} options.width - Max width
 * @param {number} options.height - Max height
 * @param {string} options.publicId - Custom public ID
 * @returns {Promise<Object>} Upload result
 */
async function uploadImage(source, options = {}) {
  const { folder = 'ceslar', width, height, publicId, ...rest } = options;

  const uploadOptions = {
    ...DEFAULT_OPTIONS,
    folder,
    ...rest,
  };

  // Add transformations if dimensions specified
  if (width || height) {
    uploadOptions.transformation = {
      ...uploadOptions.transformation,
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
          else resolve(formatUploadResult(result));
        },
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
 *
 * @param {Array} sources - Array of image sources
 * @param {Object} options - Upload options
 * @returns {Promise<Array>} Array of upload results
 */
async function uploadImages(sources, options = {}) {
  const results = await Promise.all(
    sources.map((source) => uploadImage(source, options)),
  );
  return results;
}

/**
 * Delete an image from Cloudinary
 *
 * @param {string} publicId - Cloudinary public ID
 * @returns {Promise<Object>} Deletion result
 */
async function deleteImage(publicId) {
  return cloudinary.uploader.destroy(publicId);
}

/**
 * Delete multiple images
 *
 * @param {Array<string>} publicIds - Array of public IDs
 * @returns {Promise<Object>} Deletion result
 */
async function deleteImages(publicIds) {
  return cloudinary.api.delete_resources(publicIds);
}

/**
 * Generate optimized image URL
 *
 * @param {string} publicId - Cloudinary public ID
 * @param {Object} options - Transformation options
 * @returns {string} Optimized URL
 */
function getOptimizedUrl(publicId, options = {}) {
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
 *
 * @param {string} publicId - Cloudinary public ID
 * @param {Array<number>} widths - Array of widths for srcset
 * @returns {Object} Object with srcset and sizes
 */
function getResponsiveUrls(publicId, widths = [320, 640, 960, 1280]) {
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
 *
 * @param {string} url - Cloudinary URL
 * @returns {string|null} Public ID
 */
function getPublicIdFromUrl(url) {
  if (!url) return null;

  // Match pattern: /upload/v{version}/{folder}/{publicId}.{ext}
  const match = url.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.[^.]+)?$/);
  return match ? match[1] : null;
}

/**
 * Format upload result
 *
 * @param {Object} result - Cloudinary upload result
 * @returns {Object} Formatted result
 */
function formatUploadResult(result) {
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

module.exports = {
  cloudinary,
  uploadImage,
  uploadImages,
  deleteImage,
  deleteImages,
  getOptimizedUrl,
  getResponsiveUrls,
  getPublicIdFromUrl,
};
