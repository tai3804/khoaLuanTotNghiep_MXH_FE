import { api } from './axiosClient';

export interface MediaItem {
  id: string;
  userId: string;
  fileKey: string;
  fileUrl: string;
  originalFilename: string;
  fileSize: number;
  mediaType: 'IMAGE' | 'VIDEO' | 'AUDIO' | 'DOCUMENT' | 'UNKNOWN';
  folder: string;
  createdAt: string;
}

export interface UserStorageQuota {
  userId: string;
  usedBytes: number;
  maxQuotaBytes: number;
  usedPercentage: number;
  usedReadable: string;
  maxQuotaReadable: string;
}

export interface PagedMediaResponse {
  content: MediaItem[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  isLast: boolean;
}

export const mediaService = {
  /**
   * Upload single media file (image/video) to S3 via media-service
   */
  uploadMedia: async (file: File, folder: string = 'uploads'): Promise<MediaItem> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    const res = await api.post('/media/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return res.data?.data || res.data;
  },

  /**
   * Upload multiple media files to S3 via media-service
   */
  uploadMultipleMedia: async (files: File[], folder: string = 'uploads'): Promise<MediaItem[]> => {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    formData.append('folder', folder);

    const res = await api.post('/media/upload-multiple', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return res.data?.data || res.data || [];
  },

  /**
   * Fetch storage quota of current authenticated user
   */
  getUserQuota: async (): Promise<UserStorageQuota> => {
    const res = await api.get('/media/quota');
    return res.data?.data || res.data;
  },

  /**
   * Fetch paginated list of media files uploaded by user
   */
  getUserMediaGallery: async (userId: string, page = 0, size = 20): Promise<PagedMediaResponse> => {
    const res = await api.get(`/media/user/${userId}`, {
      params: { page, size },
    });
    return res.data?.data || res.data;
  },

  /**
   * Delete file from S3 bucket and media_db by fileKey
   */
  deleteMedia: async (fileKey: string): Promise<void> => {
    await api.delete('/media/delete', {
      params: { fileKey },
    });
  },

  /**
   * Generate presigned URL for direct S3 upload if needed
   */
  getPresignedUrl: async (fileName: string, folder = 'uploads', contentType = 'application/octet-stream') => {
    const res = await api.get('/media/presigned-url', {
      params: { fileName, folder, contentType },
    });
    return res.data?.data || res.data;
  },
};
