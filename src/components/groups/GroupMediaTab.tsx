import React, { useEffect, useState } from 'react';
import { Image as ImageIcon, Lock } from 'lucide-react';
import { GroupData } from './GroupBanner';
import { postService } from '../../services/api';
import { Post } from '../../types';

export const GroupMediaTab: React.FC<{ group: GroupData }> = ({ group }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const isPrivateLocked = group.privacy === 'PRIVATE' && !group.isMember && !group.isAdmin;

  useEffect(() => {
    if (group.id && !isPrivateLocked) {
      postService.getGroupPosts(group.id).then(setPosts).catch(() => setPosts([]));
    }
  }, [group.id, isPrivateLocked]);

  if (isPrivateLocked) {
    return (
      <div className="w-full bg-white dark:bg-[#242526] rounded-2xl shadow-sm border border-gray-200 dark:border-[#393a3b] p-10 text-center space-y-3">
        <div className="w-12 h-12 rounded-full bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
          <Lock className="w-6 h-6" />
        </div>
        <h3 className="font-bold text-base text-gray-900 dark:text-[#e4e6eb]">
          Ảnh & Video ở chế độ riêng tư
        </h3>
        <p className="text-xs text-gray-500 dark:text-[#b0b3b8] max-w-sm mx-auto leading-relaxed">
          Hãy tham gia nhóm này để xem các file ảnh và video được các thành viên chia sẻ.
        </p>
      </div>
    );
  }

  const media = posts.flatMap((post: any) =>
    (post.mediaUrls || post.media || []).map((url: string) => ({ url, id: `${post.id}-${url}` }))
  );

  return (
    <div className="w-full bg-white dark:bg-[#242526] rounded-2xl shadow-sm border border-gray-200 dark:border-[#393a3b] p-5">
      <h2 className="font-bold text-lg text-gray-900 dark:text-[#e4e6eb] mb-4">Ảnh và video</h2>
      {media.length === 0 ? (
        <div className="py-12 text-center text-gray-500 dark:text-[#b0b3b8]">
          <ImageIcon className="w-10 h-10 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
          <p className="text-sm">Chưa có ảnh hoặc video nào được chia sẻ trong nhóm này.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {media.map((item) => (
            <div key={item.id} className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 dark:bg-[#3a3b3c] group">
              <img
                src={item.url}
                alt="Tệp phương tiện của nhóm"
                className="w-full h-full object-cover group-hover:scale-105 transition duration-200"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
