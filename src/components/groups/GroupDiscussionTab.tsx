import React from 'react';
import { CreatePostBox } from '../post/CreatePostBox';
// import { PostList } from '../post/PostList';
import { GroupData } from './GroupBanner';

interface GroupDiscussionTabProps {
  group: GroupData;
}

export const GroupDiscussionTab: React.FC<GroupDiscussionTabProps> = ({ group }) => {
  return (
    <div className="flex w-full gap-4">
      <div className="flex-1 max-w-[680px]">
        {group.isMember && (
          <div className="mb-4">
            <CreatePostBox onPostCreated={() => {}} groupId={group.id} />
          </div>
        )}
        {/* <PostList posts={[]} loading={false} /> */}
        <div className="bg-white dark:bg-[#242526] p-8 rounded-2xl shadow text-center mt-4">
          <p className="text-gray-500 dark:text-[#b0b3b8]">Chưa có bài viết nào trong nhóm này.</p>
        </div>
      </div>
      <div className="hidden lg:block w-[300px]">
        <div className="bg-white dark:bg-[#242526] p-4 rounded-2xl shadow sticky top-20">
          <h3 className="font-bold text-gray-900 dark:text-[#e4e6eb] mb-2">Giới thiệu</h3>
          <p className="text-sm text-gray-600 dark:text-[#b0b3b8]">Đây là nhóm lập trình viên React lớn nhất Việt Nam. Hãy cùng nhau học hỏi và phát triển!</p>
        </div>
      </div>
    </div>
  );
};
