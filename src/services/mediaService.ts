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
  getUserMediaGallery: async (userId: string = 'me', page = 0, size = 20): Promise<PagedMediaResponse> => {
    const res = await api.get(`/media/user/${userId || 'me'}`, {
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

  /**
   * Transforms direct AWS S3 URLs or local URLs to proper public backend proxy URL
   */
  getMediaUrl: (url?: string): string => {
    if (!url) return '';
    if (url.startsWith('data:') || url.startsWith('blob:')) return url;

    const apiBase = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '');
    const resolvedApiBase =
      apiBase ||
      (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1'
        ? `${window.location.protocol}//${window.location.hostname}${window.location.port ? ':' + window.location.port : ''}/api/v1`
        : 'http://localhost:8080/api/v1');

    // 1. Direct AWS S3 URL transformation
    if (url.includes('s3.amazonaws.com/') || url.includes('.s3.') || url.includes('amazonaws.com')) {
      const parts = url.split(/amazonaws\.com\//i);
      if (parts.length > 1) {
        return `${resolvedApiBase}/media/files/${parts[1]}`;
      }
    }

    // 2. Localhost URL transformation when client runs from remote / custom domain
    if (url.includes('localhost:8080') || url.includes('127.0.0.1:8080')) {
      if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
        const pathPart = url.replace(/^http:\/\/(localhost|127\.0\.0\.1):8080/, '');
        if (pathPart.startsWith('/api/v1')) {
          const subPath = pathPart.replace(/^\/api\/v1/, '');
          return `${resolvedApiBase}${subPath}`;
        }
        return `${resolvedApiBase}${pathPart}`;
      }
    }

    // 3. Ensure HTTPS when page is served over HTTPS to avoid Mixed Content
    if (typeof window !== 'undefined' && window.location.protocol === 'https:' && url.startsWith('http://')) {
      if (url.includes('kltn-mxh.me') || !url.includes('localhost')) {
        return url.replace(/^http:\/\//i, 'https://');
      }
    }

    return url;
  },
};
