import React from 'react';
import { Heart, MessageCircle, Share2 } from 'lucide-react';
import { NotificationToggleItem } from './NotificationToggleItem';

interface SocialInteractionsSectionProps {
  settings: any;
  updateSettings: (newSettings: any) => Promise<any>;
  toast: any;
}

export const SocialInteractionsSection: React.FC<SocialInteractionsSectionProps> = ({
  settings,
  updateSettings,
  toast,
}) => {
  return (
    <div className="space-y-3">
      <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-[#8a8d91]">
        Tương tác & Bài viết
      </h4>

      <div className="space-y-2">
        {/* Like Post */}
        <NotificationToggleItem
          icon={<Heart className="w-4 h-4 fill-rose-500" />}
          iconBgColor="bg-rose-100 dark:bg-rose-950/50 text-rose-500"
          title="Cảm xúc & Lượt thích"
          description="Khi ai đó thích hoặc bày tỏ cảm xúc về bài viết của bạn"
          checked={settings?.likePost ?? true}
          onChange={async (val) => {
            await updateSettings({ likePost: val });
            toast.showSuccess(val ? 'Đã bật thông báo lượt thích' : 'Đã tắt thông báo lượt thích');
          }}
        />

        {/* Comment Post */}
        <NotificationToggleItem
          icon={<MessageCircle className="w-4 h-4 fill-blue-500" />}
          iconBgColor="bg-blue-100 dark:bg-blue-950/50 text-blue-500"
          title="Bình luận & Phản hồi"
          description="Khi ai đó bình luận bài viết hoặc trả lời bình luận của bạn"
          checked={settings?.commentPost ?? true}
          onChange={async (val) => {
            await updateSettings({ commentPost: val });
            toast.showSuccess(val ? 'Đã bật thông báo bình luận' : 'Đã tắt thông báo bình luận');
          }}
        />

        {/* Share Post */}
        <NotificationToggleItem
          icon={<Share2 className="w-4 h-4" />}
          iconBgColor="bg-emerald-100 dark:bg-emerald-950/50 text-emerald-500"
          title="Chia sẻ bài viết"
          description="Khi người khác chia sẻ bài viết của bạn lên trang cá nhân"
          checked={settings?.sharePost ?? true}
          onChange={async (val) => {
            await updateSettings({ sharePost: val });
            toast.showSuccess(val ? 'Đã bật thông báo chia sẻ' : 'Đã tắt thông báo chia sẻ');
          }}
        />
      </div>
    </div>
  );
};
