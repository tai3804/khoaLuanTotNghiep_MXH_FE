import React from 'react';
import { Radio } from 'lucide-react';

interface LiveStreamEndedViewProps {
  cleanTitle: string;
  authorName: string;
}

export const LiveStreamEndedView: React.FC<LiveStreamEndedViewProps> = ({ cleanTitle, authorName }) => {
  return (
    <div className="w-full bg-linear-to-b from-gray-900 to-black text-white p-6 sm:p-8 flex flex-col items-center justify-center text-center space-y-3 rounded-lg my-1 border border-gray-800">
      <div className="w-14 h-14 rounded-full bg-red-950/80 border border-red-500/30 flex items-center justify-center text-red-500">
        <Radio className="w-7 h-7 opacity-75" />
      </div>
      <div>
        <h4 className="font-bold text-base text-gray-200">Buổi phát trực tiếp đã kết thúc</h4>
        <p className="text-xs text-gray-400 mt-1 max-w-md">
          Chủ phòng đã dừng phát sóng. Bạn vẫn có thể tương tác và thảo luận ở phần bình luận bài viết.
        </p>
      </div>
      <div className="flex items-center space-x-3 text-xs text-gray-500 pt-1">
        <span>
          Tiêu đề: <strong className="text-gray-300">{cleanTitle}</strong>
        </span>
        <span>•</span>
        <span>
          Người phát: <strong className="text-gray-300">{authorName}</strong>
        </span>
      </div>
    </div>
  );
};
