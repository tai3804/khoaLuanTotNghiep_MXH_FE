import React, { useState, useEffect, useMemo } from 'react';
import { X, UserPlus, Check, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { postService } from '../../../services/postService';
import { fetchAuthorProfile, userService, myFriendIdsMemoryCache } from '../../../services/userService';
import { useAuth } from '../../../context/AuthContext';
import { useLanguage } from '../../../context/LanguageContext';
import { UserAvatar } from '../../common/UserAvatar';

export interface PostReactionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  postId: string;
  initialTotalCount?: number;
  onViewProfile?: (userId: string) => void;
}

interface ReactionItem {
  id: string;
  postId: string;
  userId: string;
  type: 'LIKE' | 'LOVE' | 'HAHA' | 'WOW' | 'SAD' | 'ANGRY' | string;
  createdAt?: string;
  profile?: {
    name: string;
    avatar: string;
    username?: string;
    bio?: string;
    mutualFriendsCount?: number;
  };
}

const REACTION_CONFIG: Record<
  string,
  { labelVi: string; labelEn: string; icon: string; badgeBg: string }
> = {
  LIKE: {
    labelVi: 'Thích',
    labelEn: 'Like',
    icon: '👍',
    badgeBg: 'bg-[#1877f2]',
  },
  LOVE: {
    labelVi: 'Yêu thích',
    labelEn: 'Love',
    icon: '❤️',
    badgeBg: 'bg-[#f3425f]',
  },
  HAHA: {
    labelVi: 'Haha',
    labelEn: 'Haha',
    icon: '😆',
    badgeBg: 'bg-[#f7b125]',
  },
  WOW: {
    labelVi: 'Wow',
    labelEn: 'Wow',
    icon: '😮',
    badgeBg: 'bg-[#f7b125]',
  },
  SAD: {
    labelVi: 'Buồn',
    labelEn: 'Sad',
    icon: '😢',
    badgeBg: 'bg-[#f7b125]',
  },
  ANGRY: {
    labelVi: 'Phẫn nộ',
    labelEn: 'Angry',
    icon: '😡',
    badgeBg: 'bg-[#e41e3f]',
  },
};

export const PostReactionsModal: React.FC<PostReactionsModalProps> = ({
  isOpen,
  onClose,
  postId,
  onViewProfile,
}) => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const isEn = language === 'en';
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<string>('ALL');
  const [reactions, setReactions] = useState<ReactionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [sentFriendRequests, setSentFriendRequests] = useState<Set<string>>(new Set());

  // Current user's friend IDs from cache/localStorage
  const myFriendIds = useMemo(() => {
    try {
      const raw = localStorage.getItem('my_friend_ids');
      const list: string[] = raw ? JSON.parse(raw) : [];
      const set = new Set(list.map((id) => id.toLowerCase()));
      myFriendIdsMemoryCache.forEach((id) => set.add(id.toLowerCase()));
      return set;
    } catch {
      return new Set<string>();
    }
  }, [isOpen]);

  // Load reactions when opened
  useEffect(() => {
    if (!isOpen || !postId) return;

    let isMounted = true;
    setLoading(true);

    const loadData = async () => {
      try {
        const rawList = await postService.getReactions(postId);
        if (!isMounted) return;

        const list: ReactionItem[] = (Array.isArray(rawList) ? rawList : []).map((r: any) => ({
          id: String(r.id || `${r.postId}_${r.userId}`),
          postId: String(r.postId || postId),
          userId: String(r.userId),
          type: String(r.type || 'LIKE').toUpperCase(),
          createdAt: r.createdAt,
        }));

        setReactions(list);

        // Fetch author profiles for all reactors
        const userIds = Array.from(new Set(list.map((r) => r.userId).filter(Boolean)));
        const profileResults = await Promise.all(
          userIds.map(async (uid) => {
            try {
              const p = await fetchAuthorProfile(uid);
              return { uid, profile: p };
            } catch {
              return { uid, profile: null };
            }
          })
        );

        if (!isMounted) return;

        const profileMap: Record<string, any> = {};
        profileResults.forEach(({ uid, profile }) => {
          if (profile) profileMap[uid] = profile;
        });

        setReactions((prev) =>
          prev.map((r) => ({
            ...r,
            profile: profileMap[r.userId] || r.profile,
          }))
        );
      } catch (err) {
        console.error('Failed to load post reactions:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [isOpen, postId]);

  if (!isOpen) return null;

  // Counts per reaction type
  const countsByType = reactions.reduce<Record<string, number>>((acc, r) => {
    const t = r.type || 'LIKE';
    acc[t] = (acc[t] || 0) + 1;
    return acc;
  }, {});

  // Available tabs (ordered: ALL, then reaction types that have count > 0)
  const tabTypes = ['ALL', ...Object.keys(REACTION_CONFIG).filter((t) => (countsByType[t] || 0) > 0)];

  // Filtered reactions
  const filteredList =
    activeTab === 'ALL'
      ? reactions
      : reactions.filter((r) => (r.type || 'LIKE') === activeTab);

  const handleProfileClick = (targetUserId: string) => {
    onClose();
    if (onViewProfile) {
      onViewProfile(targetUserId);
    } else {
      navigate(`/profile/${targetUserId}`);
    }
  };

  const handleSendFriendRequest = async (e: React.MouseEvent, targetUserId: string) => {
    e.stopPropagation();
    try {
      await userService.sendFriendRequest(targetUserId);
      setSentFriendRequests((prev) => new Set([...prev, targetUserId]));
    } catch (err) {
      console.error('Failed to send friend request:', err);
    }
  };

  const currentUserId = user?.id ? String(user.id) : '';

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-[#242526] border border-gray-200 dark:border-[#393a3b] rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh] cursor-default transition-all"
      >
        {/* Header & Tabs */}
        <div className="border-b border-gray-200 dark:border-[#393a3b] bg-white dark:bg-[#242526] shrink-0">
          {/* Title Row */}
          <div className="flex items-center justify-between px-4 pt-3.5 pb-2">
            <h3 className="font-bold text-base text-gray-900 dark:text-[#e4e6eb]">
              {isEn ? 'People who reacted' : 'Người đã bày tỏ cảm xúc'}
            </h3>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-gray-500 hover:text-gray-700 dark:text-[#b0b3b8] dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#3a3b3c] transition cursor-pointer"
              title={isEn ? 'Close' : 'Đóng'}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Facebook Filter Tabs Bar */}
          <div className="flex items-center space-x-1 px-3 overflow-x-auto no-scrollbar">
            {tabTypes.map((tab) => {
              const isActive = activeTab === tab;
              const count = tab === 'ALL' ? reactions.length : countsByType[tab] || 0;
              const cfg = tab !== 'ALL' ? REACTION_CONFIG[tab] : null;

              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`flex items-center space-x-1.5 px-3 py-2.5 border-b-2 text-sm font-semibold transition shrink-0 cursor-pointer ${
                    isActive
                      ? 'border-[#1877f2] text-[#1877f2] dark:text-[#2d88ff]'
                      : 'border-transparent text-gray-600 dark:text-[#b0b3b8] hover:bg-gray-100 dark:hover:bg-[#3a3b3c]/60 rounded-t-lg'
                  }`}
                >
                  {cfg ? (
                    <span className="text-base leading-none select-none">{cfg.icon}</span>
                  ) : (
                    <span>{isEn ? 'All' : 'Tất cả'}</span>
                  )}
                  <span className="text-xs font-bold">{count}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Reactors List Body */}
        <div className="flex-1 overflow-y-auto p-2 divide-y divide-gray-100 dark:divide-[#393a3b]/40 custom-scrollbar">
          {loading ? (
            <div className="py-12 space-y-4 px-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center space-x-3 animate-pulse">
                  <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-[#3a3b3c]" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-[#3a3b3c] rounded w-1/3" />
                    <div className="h-3 bg-gray-100 dark:bg-[#3a3b3c]/60 rounded w-1/4" />
                  </div>
                  <div className="w-24 h-8 bg-gray-200 dark:bg-[#3a3b3c] rounded-lg" />
                </div>
              ))}
            </div>
          ) : filteredList.length === 0 ? (
            <div className="py-16 text-center text-gray-500 dark:text-[#b0b3b8] text-sm">
              {isEn ? 'No reactions found in this category' : 'Chưa có cảm xúc nào trong mục này'}
            </div>
          ) : (
            filteredList.map((item) => {
              const displayName =
                item.profile?.name ||
                item.profile?.username ||
                (item.userId === currentUserId
                  ? (isEn ? 'You' : 'Bạn')
                  : (isEn ? 'KLTN User' : 'Người dùng KLTN'));

              const avatarUrl = item.profile?.avatar || '/default-avatar.png';
              const reactionCfg = REACTION_CONFIG[item.type] || REACTION_CONFIG.LIKE;
              const isMe = item.userId && currentUserId && item.userId.toLowerCase() === currentUserId.toLowerCase();
              const isFriend = item.userId && myFriendIds.has(item.userId.toLowerCase());
              const isRequestSent = item.userId && sentFriendRequests.has(item.userId);

              return (
                <div
                  key={item.id}
                  onClick={() => handleProfileClick(item.userId)}
                  className="p-2.5 rounded-xl flex items-center justify-between gap-3 hover:bg-gray-100 dark:hover:bg-[#3a3b3c]/60 transition cursor-pointer group"
                >
                  {/* Left: Avatar with Reaction Badge + Name */}
                  <div className="flex items-center space-x-3 min-w-0 flex-1">
                    <div className="relative shrink-0">
                      <UserAvatar
                        src={avatarUrl}
                        alt={displayName}
                        size="md"
                        className="w-11 h-11"
                      />
                      <span
                        className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full ${reactionCfg.badgeBg} flex items-center justify-center ring-2 ring-white dark:ring-[#242526] text-[11px] shadow-sm select-none`}
                        title={isEn ? reactionCfg.labelEn : reactionCfg.labelVi}
                      >
                        {reactionCfg.icon}
                      </span>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center space-x-1.5">
                        <h4 className="font-bold text-sm text-gray-900 dark:text-[#e4e6eb] group-hover:underline truncate">
                          {displayName}
                        </h4>
                        {isMe && (
                          <span className="text-[11px] font-semibold text-gray-500 dark:text-[#b0b3b8] bg-gray-100 dark:bg-[#3a3b3c] px-1.5 py-0.5 rounded">
                            {isEn ? 'You' : 'Bạn'}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-[#b0b3b8] truncate mt-0.5">
                        {item.profile?.bio || (isFriend ? (isEn ? 'Friend' : 'Bạn bè') : (isEn ? 'KLTN Member' : 'Thành viên KLTN'))}
                      </p>
                    </div>
                  </div>

                  {/* Right: Quick Action Button */}
                  <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
                    {isMe ? null : isFriend ? (
                      <button
                        type="button"
                        onClick={() => handleProfileClick(item.userId)}
                        className="flex items-center space-x-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-[#3a3b3c] dark:hover:bg-[#4e4f50] text-gray-800 dark:text-[#e4e6eb] text-xs font-semibold rounded-lg transition cursor-pointer"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>{isEn ? 'Message' : 'Nhắn tin'}</span>
                      </button>
                    ) : isRequestSent ? (
                      <span className="flex items-center space-x-1 px-3 py-1.5 bg-gray-100 dark:bg-[#3a3b3c]/60 text-gray-500 dark:text-[#b0b3b8] text-xs font-semibold rounded-lg border border-gray-200 dark:border-[#393a3b]">
                        <Check className="w-3.5 h-3.5 text-blue-500" />
                        <span>{isEn ? 'Sent' : 'Đã gửi'}</span>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => handleSendFriendRequest(e, item.userId)}
                        className="flex items-center space-x-1 px-3 py-1.5 bg-[#1877f2] hover:bg-[#166fe5] text-white text-xs font-semibold rounded-lg shadow-sm transition cursor-pointer"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>{isEn ? 'Add friend' : 'Thêm bạn bè'}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
