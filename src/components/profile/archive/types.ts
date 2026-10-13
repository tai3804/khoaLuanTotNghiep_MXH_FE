import { Post } from '../../../types';
import { UserStorageQuota, MediaItem } from '../../../services/mediaService';

export type ArchiveTab = 'archived' | 'media';

export interface ArchivedPostItemProps {
  post: Post;
  onRestore: (postId: string) => void;
  onDelete: (postId: string) => void;
  isRestoring?: boolean;
  isDeleting?: boolean;
}

export interface ArchiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  onPostRestored?: (post: Post) => void;
}
