import React from 'react';
import { Post } from '../../../types';

interface PostCardContentProps {
  post: Post;
  setShowCommentModal: (val: boolean) => void;
}

export const PostCardContent: React.FC<PostCardContentProps> = ({
  post,
  setShowCommentModal,
}) => {
  return (
    <>
      {/* Post Text Content */}
      {post.content && (
        <div className="px-4 pb-2.5 text-sm text-gray-900 dark:text-[#e4e6eb] leading-normal whitespace-pre-line">
          {post.content}
        </div>
      )}

      {/* Media Image Grid Gallery */}
      {post.mediaUrls && post.mediaUrls.length > 0 && (
        <div
          className="w-full bg-black/5 dark:bg-black/40 overflow-hidden cursor-pointer"
          onClick={() => setShowCommentModal(true)}
        >
          {post.mediaUrls.length === 1 ? (
            <img
              src={post.mediaUrls[0]}
              alt="Post media"
              className="w-full max-h-[550px] object-cover hover:opacity-95 transition"
            />
          ) : (
            <div className="grid grid-cols-2 gap-0.5">
              {post.mediaUrls.map((url, i) => (
                <img
                  key={i}
                  src={url}
                  alt={`Media ${i}`}
                  className="w-full h-64 object-cover hover:opacity-95 transition"
                />
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
};
