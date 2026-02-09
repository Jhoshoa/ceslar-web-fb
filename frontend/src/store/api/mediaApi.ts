/**
 * Media API
 *
 * RTK Query API for media (image) operations via Cloudinary.
 */

import { baseApi } from './baseApi';

export interface UploadResult {
  publicId: string;
  url: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
  createdAt: string;
}

export interface UploadImageRequest {
  image: string; // base64 string
  folder?: string;
  publicId?: string;
  width?: number;
  height?: number;
}

export interface DeleteImageRequest {
  url?: string;
  publicId?: string;
}

export interface SignatureResponse {
  signature: string;
  timestamp: number;
  folder: string;
  cloudName: string;
  apiKey: string;
}

export const mediaApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Upload image via backend
    uploadImage: builder.mutation<UploadResult, UploadImageRequest>({
      query: (body) => ({
        url: '/media/upload',
        method: 'POST',
        body,
      }),
    }),

    // Delete image
    deleteImage: builder.mutation<{ deleted: boolean; publicId: string }, DeleteImageRequest>({
      query: (body) => ({
        url: '/media/delete',
        method: 'DELETE',
        body,
      }),
    }),

    // Get upload signature for signed uploads
    getUploadSignature: builder.mutation<SignatureResponse, { folder?: string }>({
      query: (body) => ({
        url: '/media/signature',
        method: 'POST',
        body,
      }),
    }),
  }),
});

export const {
  useUploadImageMutation,
  useDeleteImageMutation,
  useGetUploadSignatureMutation,
} = mediaApi;
