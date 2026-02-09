/**
 * Media Routes
 *
 * API endpoints for media (image) upload and deletion via Cloudinary.
 */

import { Router, Request, Response, NextFunction } from 'express';
import { verifyToken } from '../middleware/auth.middleware';
import { success, error } from '../utils/response.utils';
import {
  uploadImage,
  deleteImage,
  getPublicIdFromUrl,
} from '../config/cloudinary';

const router = Router();

/**
 * Upload image
 * POST /media/upload
 * Body: { image: base64string, folder?: string, publicId?: string }
 */
router.post(
  '/upload',
  verifyToken,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { image, folder = 'ceslar', publicId, width, height } = req.body;

      if (!image) {
        error(res, 'missing-image', 'Image data is required', 400);
        return;
      }

      // Validate folder to prevent path traversal
      const allowedFolders = [
        'ceslar',
        'ceslar/churches',
        'ceslar/churches/logos',
        'ceslar/churches/covers',
        'ceslar/events',
        'ceslar/events/covers',
        'ceslar/events/gallery',
        'ceslar/sermons',
        'ceslar/sermons/thumbnails',
        'ceslar/users',
        'ceslar/users/avatars',
        'ceslar/ministries',
      ];

      const normalizedFolder = folder.replace(/^\/+|\/+$/g, '');
      if (!allowedFolders.includes(normalizedFolder) && !normalizedFolder.startsWith('ceslar/')) {
        error(res, 'invalid-folder', 'Invalid folder path', 400);
        return;
      }

      const result = await uploadImage(image, {
        folder: normalizedFolder,
        publicId,
        width: width ? parseInt(width, 10) : undefined,
        height: height ? parseInt(height, 10) : undefined,
      });

      success(res, result);
    } catch (err) {
      console.error('Error uploading image:', err);
      next(err);
    }
  }
);

/**
 * Delete image
 * DELETE /media/delete
 * Body: { url: string } or { publicId: string }
 */
router.delete(
  '/delete',
  verifyToken,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { url, publicId } = req.body;

      let imagePublicId = publicId;

      // Extract public ID from URL if not provided directly
      if (!imagePublicId && url) {
        imagePublicId = getPublicIdFromUrl(url);
      }

      if (!imagePublicId) {
        error(res, 'missing-identifier', 'Image URL or public ID is required', 400);
        return;
      }

      // Validate that the public ID is from our folder structure
      if (!imagePublicId.startsWith('ceslar/')) {
        error(res, 'invalid-image', 'Cannot delete images outside of ceslar folder', 400);
        return;
      }

      const result = await deleteImage(imagePublicId);

      if (result.result === 'ok') {
        success(res, { deleted: true, publicId: imagePublicId });
      } else if (result.result === 'not found') {
        error(res, 'not-found', 'Image not found', 404);
      } else {
        error(res, 'delete-failed', 'Failed to delete image', 500);
      }
    } catch (err) {
      console.error('Error deleting image:', err);
      next(err);
    }
  }
);

/**
 * Generate upload signature (for signed uploads from frontend)
 * POST /media/signature
 */
router.post(
  '/signature',
  verifyToken,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { folder = 'ceslar' } = req.body;

      // Validate folder
      if (!folder.startsWith('ceslar')) {
        error(res, 'invalid-folder', 'Invalid folder path', 400);
        return;
      }

      const timestamp = Math.round(new Date().getTime() / 1000);

      // Import cloudinary for signature generation
      const { cloudinary } = await import('../config/cloudinary');

      const signature = cloudinary.utils.api_sign_request(
        {
          timestamp,
          folder,
        },
        process.env.CLOUDINARY_API_SECRET || ''
      );

      success(res, {
        signature,
        timestamp,
        folder,
        cloudName: process.env.CLOUDINARY_CLOUD_NAME,
        apiKey: process.env.CLOUDINARY_API_KEY,
      });
    } catch (err) {
      console.error('Error generating signature:', err);
      next(err);
    }
  }
);

export default router;
