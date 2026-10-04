import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Users } from 'lucide-react';
import { authorProfileCache, fetchAuthorProfile } from '../../../services/userService';
import { UserAvatar } from '../../common/UserAvatar';

interface PostTaggedUsersProps {
  taggedUserIds?: string[];
  className?: string;
}

export const PostTaggedUsers: React.FC<PostTaggedUsersProps> = ({
  taggedUserIds,
  className = '',
}) => {
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState<Record<string, { name: string; avatar: string }>>({});
  const [showAllModal, setShowAllModal] = useState(false);

  const safeIds = Array.isArray(taggedUserIds)
    ? taggedUserIds.map(String).filter((id) => id && id !== 'null' && id !== 'undefined')
    : [];

  useEffect(() => {
    if (safeIds.length === 0) return;

    let isMounted = true;
    (async () => {
      const fetched: Record<string, { name: string; avatar: string }> = {};
      await Promise.all(
        safeIds.map(async (id) => {
          if (authorProfileCache[id]) {
            fetched[id] = authorProfileCache[id];
          } else {
            const p = await fetchAuthorProfile(id).catch(() => null);
            if (p) fetched[id] = p;
          }
        })
      );
      if (isMounted) {
        setProfiles((prev) => ({ ...prev, ...fetched }));
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [taggedUserIds]);

  if (safeIds.length === 0) return null;

  const firstId = safeIds[0];
  const firstName = profiles[firstId]?.name || 'một người bạn';
  const othersCount = safeIds.length - 1;

  return (
    <>
      <span className={`text-xs text-gray-500 dark:text-[#b0b3b8] font-normal inline ${className}`}>
        {' '}— cùng với{' '}
        <span
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/profile/${firstId}`);
          }}
          className="font-semibold text-gray-900 dark:text-[#e4e6eb] hover:underline cursor-pointer"
        >
          {firstName}
        </span>
        {othersCount > 0 && (
          <>
            {' '}và{' '}
            <span
              onClick={(e) => {
                e.stopPropagation();
                setShowAllModal(true);
              }}
              className="font-semibold text-gray-900 dark:text-[#e4e6eb] hover:underline cursor-pointer"
            >
              {othersCount} người khác
            </span>
          </>
        )}
      </span>

      {/* Modal listing all tagged people */}
      {showAllModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={(e) => {
            e.stopPropagation();
            setShowAllModal(false);
          }}
        >
          <div
            className="w-full max-w-sm bg-white dark:bg-[#242526] rounded-2xl shadow-2xl border border-gray-200 dark:border-[#393a3b] overflow-hidden animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-4 py-3 border-b border-gray-100 dark:border-[#393a3b] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[#1877f2]" />
                <h4 className="font-bold text-sm text-gray-900 dark:text-[#e4e6eb]">
                  Người được gắn thẻ ({safeIds.length})
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setShowAllModal(false)}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-[#3a3b3c] transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="max-h-72 overflow-y-auto p-2 divide-y divide-gray-50 dark:divide-[#393a3b]/40 custom-scrollbar">
              {safeIds.map((uid) => {
                const p = profiles[uid];
                const name = p?.name || 'Người dùng';
                const avatar = p?.avatar || '/default-avatar.png';

                return (
                  <div
                    key={uid}
                    onClick={() => {
                      setShowAllModal(false);
                      navigate(`/profile/${uid}`);
                    }}
                    className="flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-[#3a3b3c] rounded-xl cursor-pointer transition"
                  >
                    <UserAvatar src={avatar} alt={name} size="sm" className="w-9 h-9 rounded-full" />
                    <span className="text-sm font-semibold text-gray-900 dark:text-[#e4e6eb] hover:underline">
                      {name}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
