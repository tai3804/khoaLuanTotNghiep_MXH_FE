import React, { useEffect, useState, useCallback } from 'react';
import { GroupResponse } from '../../services/groupService';
import { postService } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Loader2 } from 'lucide-react';
import {
  GroupAppealsHeader,
  GroupAppealCard,
  GroupAppealModal,
} from './group-appeals';

export const GroupAppealsTab: React.FC<{ group: GroupResponse }> = ({ group }) => {
  const canReview = Boolean(group.isAdmin || group.isModerator);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<any | null>(null);
  const toast = useToast();

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = canReview
        ? await postService.getGroupAppeals(group.id)
        : await postService.getMyGroupAppeals(group.id);
      setItems(data || []);
    } catch (err) {
      console.error('Failed to load group appeals:', err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [group.id, canReview]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleSubmitAppeal = async (message: string) => {
    if (!selectedPost) return;
    try {
      await postService.appealGroupPost(selectedPost.postId, message);
      toast.showSuccess('Đã gửi kháng nghị thành công! Quản trị viên sẽ xem xét yêu cầu.');
      setSelectedPost(null);
      await load();
    } catch (err: any) {
      toast.showError(err?.message || 'Không thể gửi kháng nghị.');
    }
  };

  const handleReviewAppeal = async (postId: string, approved: boolean) => {
    try {
      await postService.reviewGroupAppeal(postId, approved);
      toast.showSuccess(
        approved ? 'Đã chấp thuận kháng nghị và khôi phục bài viết.' : 'Đã bác bỏ kháng nghị.'
      );
      await load();
    } catch (err: any) {
      toast.showError(err?.message || 'Không thể xử lý kháng nghị.');
    }
  };

  return (
    <div className="w-full space-y-4">
      <GroupAppealsHeader canReview={canReview} />

      {loading ? (
        <div className="rounded-2xl bg-white dark:bg-[#242526] p-12 text-center text-sm text-gray-500 shadow-sm border border-gray-100 dark:border-[#393a3b] flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#1877f2] mb-2" />
          <p>Đang tải danh sách kháng nghị...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl bg-white dark:bg-[#242526] p-12 text-center text-sm text-gray-500 dark:text-[#b0b3b8] shadow-sm border border-gray-100 dark:border-[#393a3b]">
          {canReview ? 'Không có kháng nghị nào đang chờ xử lý.' : 'Bạn chưa có bài viết nào bị gỡ trong nhóm.'}
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <GroupAppealCard
              key={item.postId}
              item={item}
              canReview={canReview}
              onReview={handleReviewAppeal}
              onOpenAppealModal={(it) => setSelectedPost(it)}
            />
          ))}
        </div>
      )}

      <GroupAppealModal
        isOpen={Boolean(selectedPost)}
        onClose={() => setSelectedPost(null)}
        onSubmit={handleSubmitAppeal}
      />
    </div>
  );
};

export default GroupAppealsTab;
