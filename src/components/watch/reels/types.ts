import { Post } from '../../../types';

export interface ReelsModalProps {
  posts: Post[];
  initialIndex?: number;
  isOpen: boolean;
  onClose: () => void;
  onViewProfile?: (userId: string) => void;
}

export interface ReelLikeState {
  isLiked: boolean;
  count: number;
}
