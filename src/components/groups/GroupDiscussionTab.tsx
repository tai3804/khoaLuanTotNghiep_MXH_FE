import React, { useEffect, useState } from 'react';
import { CreatePostBox } from '../post/CreatePostBox';
import { PostCard } from '../post/post-card';
import { GroupData } from './GroupBanner';
import { postService } from '../../services/api';
import { Post } from '../../types';

interface GroupDiscussionTabProps {
  group: GroupData;
}

export const GroupDiscussionTab: React.FC<GroupDiscussionTabProps> = ({ group }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const loadPosts = async () => {
    setLoading(true);
    if (!group.id) { setPosts([]); setLoading(false); return; }
    setPosts(await postService.getGroupPosts(group.id));
    setLoading(false);
  };
  useEffect(() => { loadPosts(); }, [group.id]);
  return (
    <div className="flex w-full gap-4">
      <div className="flex-1 max-w-[680px]">
        {group.isMember && (
          <div className="mb-4">
            <CreatePostBox onPostCreated={(post) => setPosts((current) => [post, ...current])} groupId={group.id} />
          </div>
        )}
        {loading ? <div className="bg-white dark:bg-[#242526] p-8 rounded-2xl shadow text-center text-sm text-gray-500">Đang tải bài viết...</div> : posts.length === 0 ? <div className="bg-white dark:bg-[#242526] p-8 rounded-2xl shadow text-center mt-4"><p className="text-gray-500 dark:text-[#b0b3b8]">Chưa có bài viết nào trong nhóm này.</p></div> : posts.map((post) => <PostCard key={post.id} post={post} onDeletePost={(id) => setPosts((current) => current.filter((item) => item.id !== id))} />)}
      </div>
      <div className="hidden lg:block w-[300px]">
        <div className="bg-white dark:bg-[#242526] p-4 rounded-2xl shadow sticky top-20">
          <h3 className="font-bold text-gray-900 dark:text-[#e4e6eb] mb-2">Giới thiệu</h3>
          <p className="text-sm text-gray-600 dark:text-[#b0b3b8]">{group.description || 'Cùng chia sẻ, trao đổi và kết nối trong cộng đồng này.'}</p>
          {group.rules && <><h4 className="font-bold text-gray-900 dark:text-[#e4e6eb] mt-4 mb-2">Nội quy nhóm</h4><p className="whitespace-pre-line text-sm text-gray-600 dark:text-[#b0b3b8]">{group.rules}</p></>}
          {group.postApprovalRequired && <p className="mt-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 px-3 py-2 text-xs text-amber-700 dark:text-amber-200">Bài viết trong nhóm cần được quản trị viên duyệt trước khi hiển thị.</p>}
        </div>
      </div>
    </div>
  );
};
