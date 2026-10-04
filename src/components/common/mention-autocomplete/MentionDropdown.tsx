import React from 'react';
import { MentionCandidate } from './useMentionSuggestions';
import { UserAvatar } from '../UserAvatar';
import { Loader2 } from 'lucide-react';

interface MentionDropdownProps {
  isOpen: boolean;
  loading: boolean;
  candidates: MentionCandidate[];
  selectedIndex: number;
  onSelect: (candidate: MentionCandidate) => void;
  className?: string;
}

export const MentionDropdown: React.FC<MentionDropdownProps> = ({
  isOpen,
  loading,
  candidates,
  selectedIndex,
  onSelect,
  className = '',
}) => {
  if (!isOpen) return null;

  return (
    <div
      className={`absolute z-50 w-72 bg-white dark:bg-[#242526] border border-gray-200 dark:border-[#393a3b] rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150 ${className}`}
    >
      <div className="px-3 py-1.5 bg-gray-50 dark:bg-[#18191a] border-b border-gray-100 dark:border-[#393a3b] flex items-center justify-between">
        <span className="text-[11px] font-bold text-gray-500 dark:text-[#b0b3b8] uppercase tracking-wider">
          Gợi ý nhắc đến
        </span>
        {loading && <Loader2 className="w-3.5 h-3.5 animate-spin text-[#1877f2]" />}
      </div>

      <div className="max-h-56 overflow-y-auto py-1 divide-y divide-gray-50 dark:divide-[#393a3b]/40">
        {loading && candidates.length === 0 ? (
          <div className="p-4 text-center text-xs text-gray-500 dark:text-[#b0b3b8]">
            Đang tìm kiếm...
          </div>
        ) : candidates.length === 0 ? (
          <div className="p-4 text-center text-xs text-gray-500 dark:text-[#b0b3b8]">
            Không tìm thấy người dùng phù hợp
          </div>
        ) : (
          candidates.map((candidate, idx) => {
            const isSelected = idx === selectedIndex;
            return (
              <button
                key={candidate.id || candidate.userId}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  onSelect(candidate);
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-left transition cursor-pointer ${
                  isSelected
                    ? 'bg-blue-50 dark:bg-blue-900/30 text-[#1877f2] dark:text-blue-400'
                    : 'hover:bg-gray-100 dark:hover:bg-[#3a3b3c] text-gray-900 dark:text-[#e4e6eb]'
                }`}
              >
                <UserAvatar
                  src={candidate.avatar || candidate.avatarUrl}
                  alt={candidate.name || candidate.fullName}
                  size="sm"
                  className="w-8 h-8 rounded-full shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold truncate">
                    {candidate.name || candidate.fullName}
                  </div>
                  {candidate.mutualFriendsCount !== undefined && candidate.mutualFriendsCount > 0 && (
                    <div className="text-[10px] text-gray-500 dark:text-[#b0b3b8] truncate">
                      {candidate.mutualFriendsCount} bạn chung
                    </div>
                  )}
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};
