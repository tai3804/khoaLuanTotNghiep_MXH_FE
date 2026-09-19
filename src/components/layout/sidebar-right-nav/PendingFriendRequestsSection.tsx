import React from 'react';
import { UserAvatar } from '../../common/UserAvatar';

interface PendingFriendRequestsSectionProps {
  pendingRequests: any[];
  onAccept: (requestId: string) => void;
  onReject: (requestId: string) => void;
}

export const PendingFriendRequestsSection: React.FC<PendingFriendRequestsSectionProps> = ({
  pendingRequests,
  onAccept,
  onReject,
}) => {
  if (!pendingRequests || pendingRequests.length === 0) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-2 px-1">
        <h3 className="text-gray-500 dark:text-[#b0b3b8] font-bold text-sm">
          Lời mời kết bạn ({pendingRequests.length})
        </h3>
      </div>

      <div className="space-y-2">
        {pendingRequests.map((req) => (
          <div key={req.id} className="p-2.5 rounded-xl bg-white dark:bg-[#242526] border border-gray-200 dark:border-[#393a3b] shadow-sm flex items-start space-x-3">
            <UserAvatar src={req.senderAvatar || req.avatar} alt={req.senderName || req.fullName} size="lg" className="w-11 h-11 rounded-full" />
            <div className="flex-1 min-w-0">
              <h5 className="text-sm font-semibold text-gray-900 dark:text-[#e4e6eb] truncate">
                {req.senderName || req.fullName || 'Thành viên KLTN'}
              </h5>
              <div className="flex items-center space-x-2 mt-2">
                <button
                  onClick={() => onAccept(req.id)}
                  className="flex-1 bg-[#1877f2] hover:bg-[#166fe5] text-white py-1.5 px-3 rounded-md text-xs font-semibold transition cursor-pointer"
                >
                  Xác nhận
                </button>
                <button
                  onClick={() => onReject(req.id)}
                  className="flex-1 bg-gray-200 dark:bg-[#3a3b3c] hover:bg-gray-300 dark:hover:bg-[#4e4f50] text-gray-800 dark:text-[#e4e6eb] py-1.5 px-3 rounded-md text-xs font-semibold transition cursor-pointer"
                >
                  Xóa
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <hr className="border-gray-200 dark:border-[#393a3b] mt-4" />
    </div>
  );
};
