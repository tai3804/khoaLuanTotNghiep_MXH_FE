import React, { useEffect, useState } from 'react';
import { Image as ImageIcon } from 'lucide-react';
import { GroupData } from './GroupBanner';
import { postService } from '../../services/api';
import { Post } from '../../types';

export const GroupMediaTab: React.FC<{ group: GroupData }> = ({ group }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  useEffect(() => { if (group.id) postService.getGroupPosts(group.id).then(setPosts); }, [group.id]);
  const media = posts.flatMap((post: any) => (post.mediaUrls || post.media || []).map((url: string) => ({ url, id: `${post.id}-${url}` })));
  return (
    <div className="w-full bg-white dark:bg-[#242526] rounded-2xl shadow p-5">
      <h2 className="font-bold text-lg text-gray-900 dark:text-[#e4e6eb] mb-4">Ảnh và video</h2>
      {media.length === 0 ? <div className="py-10 text-center text-gray-500"><ImageIcon className="w-10 h-10 mx-auto mb-2 text-gray-300" />Chưa có ảnh/video nào</div> : <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">{media.map((item) => <img key={item.id} src={item.url} alt="Tệp phương tiện của nhóm" className="aspect-square w-full rounded-lg object-cover" />)}</div>}
    </div>
  );
};
