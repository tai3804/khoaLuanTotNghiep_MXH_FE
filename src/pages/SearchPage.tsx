import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Header } from '../components/layout/header-bar';
import { ChatBox, ChatUser } from '../components/chat/chat-box';
import { PostCard } from '../components/post/post-card';
import { userService, postService } from '../services/api';
import { groupService, GroupResponse } from '../services/groupService';
import { Post } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  Search,
  Users,
  FileText,
  LayoutGrid,
  Loader2,
  Hash,
  History,
  X,
  UserPlus,
  UserCheck,
  UserX,
  Users2,
  Globe,
  Lock,
  ArrowRight,
} from 'lucide-react';

interface SearchPageProps {
  activeNavTab: string;
  setActiveNavTab: (tab: string) => void;
  onNavigateSettings: () => void;
  onNavigateProfile: (userId?: string) => void;
  onNavigateAuth: () => void;
  activeChatUser: ChatUser | null;
  setActiveChatUser: (user: ChatUser | null) => void;
}

type FilterType = 'all' | 'users' | 'groups' | 'posts';

export const SearchPage: React.FC<SearchPageProps> = ({
  activeNavTab,
  setActiveNavTab,
  onNavigateSettings,
  onNavigateProfile,
  onNavigateAuth,
  activeChatUser,
  setActiveChatUser,
}) => {
  const { t, language } = useLanguage();
  const { user: currentUser } = useAuth();
  const { showSuccess, showError, showInfo, showWarning } = useToast();
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const navigate = useNavigate();

  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [groups, setGroups] = useState<GroupResponse[]>([]);
  const [friendStatuses, setFriendStatuses] = useState<Record<string, {
    isFriend: boolean;
    hasPendingSent: boolean;
    hasPendingReceived: boolean;
    pendingRequestId?: string;
  }>>({});
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});

  const [history, setHistory] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('kltn_search_history') || '[]'); } catch { return []; }
  });

  useEffect(() => {
    const fetchResults = async () => {
      if (!query.trim()) return;
      setLoading(true);
      try {
        const [usersRes, postsRes, groupsRes] = await Promise.all([
          userService.searchUsers(query.trim()).catch(() => []),
          postService.searchPosts ? postService.searchPosts(query.trim()).catch(() => []) : Promise.resolve([]),
          groupService.searchGroups(query.trim()).catch(() => []),
        ]);

        const userList = Array.isArray(usersRes) ? usersRes : [];
        setUsers(userList);
        setPosts(Array.isArray(postsRes) ? postsRes : []);
        setGroups(Array.isArray(groupsRes) ? groupsRes : []);

        // Load connection status for search results
        if (currentUser?.id) {
          const statuses: Record<string, any> = {};
          await Promise.all(
            userList.map(async (u: any) => {
              const uid = String(u.userId || u.id);
              if (uid && uid !== String(currentUser.id)) {
                try {
                  const st = await userService.getConnectionStatus(uid);
                  if (st) {
                    statuses[uid] = st;
                  }
                } catch {}
              }
            })
          );
          setFriendStatuses(statuses);
        }
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query, currentUser?.id]);

  useEffect(() => {
    const handleStatusUpdate = () => {
      if (!currentUser?.id || users.length === 0) return;
      users.forEach((u: any) => {
        const uid = String(u.userId || u.id);
        if (uid && uid !== String(currentUser.id)) {
          userService.getConnectionStatus(uid).then((st) => {
            if (st) {
              setFriendStatuses((prev) => ({ ...prev, [uid]: st }));
            }
          }).catch(() => {});
        }
      });
    };

    window.addEventListener('friend_status_updated', handleStatusUpdate);
    return () => {
      window.removeEventListener('friend_status_updated', handleStatusUpdate);
    };
  }, [users, currentUser?.id]);

  useEffect(() => {
    const keyword = query.trim();
    if (!keyword) return;
    setHistory((previous) => {
      const next = [keyword, ...previous.filter((item) => item.toLocaleLowerCase() !== keyword.toLocaleLowerCase())].slice(0, 10);
      localStorage.setItem('kltn_search_history', JSON.stringify(next));
      return next;
    });
  }, [query]);

  const removeHistoryItem = (keyword: string) => {
    setHistory((previous) => {
      const next = previous.filter((item) => item !== keyword);
      localStorage.setItem('kltn_search_history', JSON.stringify(next));
      return next;
    });
  };

  const handleSendFriendRequest = async (targetId: string) => {
    if (!currentUser) {
      showWarning('Vui lòng đăng nhập để gửi lời mời kết bạn');
      return;
    }
    setActionLoading((prev) => ({ ...prev, [targetId]: true }));
    try {
      await userService.sendFriendRequest(targetId);
      setFriendStatuses((prev) => ({
        ...prev,
        [targetId]: { ...(prev[targetId] || { isFriend: false, hasPendingReceived: false }), hasPendingSent: true },
      }));
      showSuccess('Đã gửi lời mời kết bạn');
      window.dispatchEvent(new CustomEvent('friend_status_updated'));
    } catch (err: any) {
      showError(err.response?.data?.message || err.message || 'Không thể gửi lời mời kết bạn');
    } finally {
      setActionLoading((prev) => ({ ...prev, [targetId]: false }));
    }
  };

  const handleCancelFriendRequest = async (targetId: string) => {
    setActionLoading((prev) => ({ ...prev, [targetId]: true }));
    try {
      await userService.cancelFriendRequest(targetId);
      setFriendStatuses((prev) => ({
        ...prev,
        [targetId]: { ...(prev[targetId] || { isFriend: false, hasPendingReceived: false }), hasPendingSent: false },
      }));
      showInfo('Đã hủy lời mời kết bạn');
      window.dispatchEvent(new CustomEvent('friend_status_updated'));
    } catch (err: any) {
      showError(err.response?.data?.message || err.message || 'Không thể hủy lời mời');
    } finally {
      setActionLoading((prev) => ({ ...prev, [targetId]: false }));
    }
  };

  const handleAcceptFriendRequest = async (targetId: string) => {
    setActionLoading((prev) => ({ ...prev, [targetId]: true }));
    try {
      await userService.acceptFriendRequest(targetId);
      setFriendStatuses((prev) => ({
        ...prev,
        [targetId]: { ...(prev[targetId] || { hasPendingSent: false }), isFriend: true, hasPendingReceived: false },
      }));
      showSuccess('Đã chấp nhận lời mời kết bạn');
      window.dispatchEvent(new CustomEvent('friend_status_updated'));
    } catch (err: any) {
      showError(err.response?.data?.message || err.message || 'Không thể chấp nhận lời mời');
    } finally {
      setActionLoading((prev) => ({ ...prev, [targetId]: false }));
    }
  };

  const handleRejectFriendRequest = async (targetId: string) => {
    setActionLoading((prev) => ({ ...prev, [targetId]: true }));
    try {
      await userService.rejectFriendRequest(targetId);
      setFriendStatuses((prev) => ({
        ...prev,
        [targetId]: { ...(prev[targetId] || { hasPendingSent: false, isFriend: false }), hasPendingReceived: false },
      }));
      showInfo('Đã từ chối lời mời kết bạn');
      window.dispatchEvent(new CustomEvent('friend_status_updated'));
    } catch (err: any) {
      showError(err.response?.data?.message || err.message || 'Không thể từ chối lời mời');
    } finally {
      setActionLoading((prev) => ({ ...prev, [targetId]: false }));
    }
  };

  const handleToggleJoinGroup = async (group: GroupResponse) => {
    if (!currentUser) {
      showWarning('Vui lòng đăng nhập để tham gia nhóm');
      return;
    }
    setActionLoading((prev) => ({ ...prev, [group.id]: true }));
    try {
      const updated = await groupService.toggleJoinGroup(group.id);
      if (updated) {
        setGroups((prev) => prev.map((g) => (g.id === group.id ? updated : g)));
        if (updated.isMember) {
          showSuccess(`Đã tham gia nhóm "${group.name}"`);
        } else {
          showInfo(`Đã rời khỏi nhóm "${group.name}"`);
        }
      }
    } catch (err: any) {
      showError(err.message || 'Có lỗi xảy ra khi thao tác với nhóm');
    } finally {
      setActionLoading((prev) => ({ ...prev, [group.id]: false }));
    }
  };

  const renderUsers = () => {
    if (users.length === 0) return null;
    return (
      <div className="bg-white dark:bg-[#242526] rounded-xl shadow-sm border border-gray-200 dark:border-[#393a3b] p-4 mb-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-[#e4e6eb]">Mọi người</h3>
          {activeFilter === 'all' && users.length > 4 && (
            <button
              onClick={() => setActiveFilter('users')}
              className="text-xs font-semibold text-[#1877f2] dark:text-[#2d88ff] hover:underline flex items-center gap-1 cursor-pointer"
            >
              Xem tất cả ({users.length})
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <div className="space-y-3">
          {(activeFilter === 'all' ? users.slice(0, 4) : users).map((u: any) => {
            const uid = String(u.userId || u.id);
            const isMe = Boolean(
              currentUser && (
                String(currentUser.id) === uid ||
                String((currentUser as any).profileId || '') === uid
              )
            );
            const name = [u.lastName, u.middleName, u.firstName].filter(Boolean).join(' ').trim() || u.fullName || u.username || 'Người dùng';
            const avatar = u.avatarUrl || u.avatar || '/default-avatar.png';
            const status = friendStatuses[uid];
            const isLoading = Boolean(actionLoading[uid]);

            return (
              <div
                key={uid}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-[#3a3b3c] rounded-xl transition gap-3 border border-gray-100 dark:border-[#393a3b]/50"
              >
                <div
                  className="flex items-center space-x-3 cursor-pointer flex-1 min-w-0"
                  onClick={() => onNavigateProfile(uid)}
                >
                  <img
                    src={avatar}
                    alt={name}
                    className="w-12 h-12 rounded-full object-cover shrink-0"
                    onError={(e) => { (e.target as HTMLImageElement).src = '/default-avatar.png'; }}
                  />
                  <div className="min-w-0 flex-1">
                    <h4 className="font-semibold text-gray-900 dark:text-[#e4e6eb] text-sm truncate">{name}</h4>
                    <p className="text-xs text-gray-500 dark:text-[#b0b3b8] truncate">@{u.username || 'user'}</p>
                    {u.bio && (
                      <p className="text-xs text-gray-600 dark:text-gray-300 mt-0.5 line-clamp-1">{u.bio}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  {isMe ? (
                    <span className="px-3 py-1.5 bg-gray-100 dark:bg-[#3a3b3c] text-gray-600 dark:text-[#b0b3b8] text-xs font-semibold rounded-lg">
                      Bạn
                    </span>
                  ) : status?.isFriend ? (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold rounded-lg">
                      <UserCheck className="w-4 h-4" />
                      <span>Bạn bè</span>
                    </div>
                  ) : status?.hasPendingSent ? (
                    <button
                      onClick={() => handleCancelFriendRequest(uid)}
                      disabled={isLoading}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-200 dark:bg-[#3a3b3c] hover:bg-rose-100 hover:text-rose-600 dark:hover:bg-rose-900/30 dark:hover:text-rose-400 text-gray-700 dark:text-[#e4e6eb] text-xs font-semibold rounded-lg transition cursor-pointer disabled:opacity-50"
                      title="Bấm để hủy lời mời đã gửi"
                    >
                      {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UserX className="w-3.5 h-3.5" />}
                      <span>Đã gửi lời mời</span>
                    </button>
                  ) : status?.hasPendingReceived ? (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleAcceptFriendRequest(uid)}
                        disabled={isLoading}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1877f2] hover:bg-blue-600 text-white text-xs font-semibold rounded-lg transition cursor-pointer disabled:opacity-50"
                      >
                        {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UserCheck className="w-3.5 h-3.5" />}
                        <span>Chấp nhận</span>
                      </button>
                      <button
                        onClick={() => handleRejectFriendRequest(uid)}
                        disabled={isLoading}
                        className="px-2.5 py-1.5 bg-gray-200 dark:bg-[#3a3b3c] hover:bg-gray-300 dark:hover:bg-[#4e4f50] text-gray-700 dark:text-[#e4e6eb] text-xs font-semibold rounded-lg transition cursor-pointer disabled:opacity-50"
                      >
                        Từ chối
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleSendFriendRequest(uid)}
                      disabled={isLoading}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1877f2] hover:bg-blue-600 text-white text-xs font-semibold rounded-lg transition cursor-pointer disabled:opacity-50"
                    >
                      {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UserPlus className="w-3.5 h-3.5" />}
                      <span>Thêm bạn bè</span>
                    </button>
                  )}

                  <button
                    onClick={() => onNavigateProfile(uid)}
                    className="px-3 py-1.5 bg-gray-100 dark:bg-[#3a3b3c] hover:bg-gray-200 dark:hover:bg-[#4e4f50] text-gray-800 dark:text-[#e4e6eb] text-xs font-semibold rounded-lg transition cursor-pointer"
                  >
                    Xem trang
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderGroups = () => {
    if (groups.length === 0) return null;
    return (
      <div className="bg-white dark:bg-[#242526] rounded-xl shadow-sm border border-gray-200 dark:border-[#393a3b] p-4 mb-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-[#e4e6eb]">Nhóm</h3>
          {activeFilter === 'all' && groups.length > 3 && (
            <button
              onClick={() => setActiveFilter('groups')}
              className="text-xs font-semibold text-[#1877f2] dark:text-[#2d88ff] hover:underline flex items-center gap-1 cursor-pointer"
            >
              Xem tất cả ({groups.length})
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="space-y-3">
          {(activeFilter === 'all' ? groups.slice(0, 3) : groups).map((group) => {
            const isLoading = Boolean(actionLoading[group.id]);
            const cover = typeof group.coverUrl === 'string' && group.coverUrl.trim() && !group.coverUrl.includes('images.unsplash.com/photo-1522071820081')
              ? group.coverUrl.trim()
              : undefined;
            const isPrivate = group.privacy === 'PRIVATE';

            return (
              <div
                key={group.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-[#3a3b3c] rounded-xl transition gap-3 border border-gray-100 dark:border-[#393a3b]/50"
              >
                <div
                  className="flex items-center space-x-3 cursor-pointer flex-1 min-w-0"
                  onClick={() => navigate(`/groups/${group.id}`)}
                >
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100 dark:bg-[#3a3b3c] flex items-center justify-center shrink-0 border border-gray-200/80 dark:border-[#393a3b]">
                    {cover ? (
                      <img
                        src={cover}
                        alt={group.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Users className="w-7 h-7 text-gray-400 dark:text-gray-500" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-gray-900 dark:text-[#e4e6eb] text-sm truncate">{group.name}</h4>
                      {group.isAdmin && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 font-bold shrink-0">
                          Quản trị viên
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-[#b0b3b8] mt-0.5">
                      <span className="flex items-center gap-1">
                        {isPrivate ? <Lock className="w-3 h-3" /> : <Globe className="w-3 h-3" />}
                        {isPrivate ? 'Nhóm riêng tư' : 'Nhóm công khai'}
                      </span>
                      <span>•</span>
                      <span>{group.memberCount || 1} thành viên</span>
                    </div>
                    {group.description && (
                      <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 line-clamp-1">{group.description}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <button
                    onClick={() => handleToggleJoinGroup(group)}
                    disabled={isLoading || group.isAdmin}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer flex items-center gap-1.5 disabled:opacity-60 ${
                      group.isMember
                        ? 'bg-gray-200 dark:bg-[#3a3b3c] hover:bg-rose-100 hover:text-rose-600 dark:hover:bg-rose-900/30 dark:hover:text-rose-400 text-gray-700 dark:text-[#e4e6eb]'
                        : 'bg-[#1877f2] hover:bg-blue-600 text-white'
                    }`}
                  >
                    {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>{group.isAdmin ? 'Quản trị viên' : group.isMember ? 'Đã tham gia' : 'Tham gia nhóm'}</span>
                  </button>

                  <button
                    onClick={() => navigate(`/groups/${group.id}`)}
                    className="px-3 py-1.5 bg-gray-100 dark:bg-[#3a3b3c] hover:bg-gray-200 dark:hover:bg-[#4e4f50] text-gray-800 dark:text-[#e4e6eb] text-xs font-semibold rounded-lg transition cursor-pointer"
                  >
                    Xem nhóm
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderPosts = () => {
    if (posts.length === 0) return null;
    return (
      <div className="space-y-4">
        {activeFilter === 'posts' && (
          <h3 className="text-lg font-bold text-gray-900 dark:text-[#e4e6eb] mb-2 bg-white dark:bg-[#242526] rounded-xl shadow-sm border border-gray-200 dark:border-[#393a3b] p-4">
            Bài viết
          </h3>
        )}
        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            onDeletePost={() => {
              setPosts(posts.filter((p) => p.id !== post.id));
            }}
            onViewProfile={onNavigateProfile}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#f0f2f5] dark:bg-[#18191a] text-gray-900 dark:text-[#e4e6eb] transition-colors duration-200">
      <Header
        activeTab={activeNavTab}
        onTabChange={setActiveNavTab}
        onSelectChatUser={(u) => setActiveChatUser(u)}
        onNavigateSettings={onNavigateSettings}
        onNavigateProfile={onNavigateProfile}
        onNavigateAuth={onNavigateAuth}
      />

      <div className="flex justify-center pt-14 max-w-[1200px] mx-auto px-4">
        {/* Search Sidebar */}
        <div className="hidden md:block w-[360px] flex-shrink-0 pt-4 pr-4">
          <div className="bg-white dark:bg-[#242526] rounded-xl shadow-sm border border-gray-200 dark:border-[#393a3b] p-2 sticky top-20">
            <h2 className="text-xl font-bold p-3 border-b border-gray-100 dark:border-[#393a3b] mb-2">Kết quả tìm kiếm</h2>
            <nav className="space-y-1">
              <button
                onClick={() => setActiveFilter('all')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition cursor-pointer ${
                  activeFilter === 'all'
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-[#1877f2] dark:text-[#2d88ff]'
                    : 'hover:bg-gray-100 dark:hover:bg-[#3a3b3c]'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-1.5 rounded-full ${activeFilter === 'all' ? 'bg-[#1877f2] text-white' : 'bg-gray-200 dark:bg-[#3a3b3c] text-gray-700 dark:text-[#e4e6eb]'}`}>
                    <LayoutGrid className="w-4 h-4" />
                  </div>
                  <span className="font-semibold text-sm">Tất cả</span>
                </div>
              </button>

              <button
                onClick={() => setActiveFilter('users')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition cursor-pointer ${
                  activeFilter === 'users'
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-[#1877f2] dark:text-[#2d88ff]'
                    : 'hover:bg-gray-100 dark:hover:bg-[#3a3b3c]'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-1.5 rounded-full ${activeFilter === 'users' ? 'bg-[#1877f2] text-white' : 'bg-gray-200 dark:bg-[#3a3b3c] text-gray-700 dark:text-[#e4e6eb]'}`}>
                    <Users className="w-4 h-4" />
                  </div>
                  <span className="font-semibold text-sm">Mọi người</span>
                </div>
                {users.length > 0 && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-[#3a3b3c] text-gray-600 dark:text-gray-300 font-semibold">
                    {users.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveFilter('groups')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition cursor-pointer ${
                  activeFilter === 'groups'
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-[#1877f2] dark:text-[#2d88ff]'
                    : 'hover:bg-gray-100 dark:hover:bg-[#3a3b3c]'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-1.5 rounded-full ${activeFilter === 'groups' ? 'bg-[#1877f2] text-white' : 'bg-gray-200 dark:bg-[#3a3b3c] text-gray-700 dark:text-[#e4e6eb]'}`}>
                    <Users2 className="w-4 h-4" />
                  </div>
                  <span className="font-semibold text-sm">Nhóm</span>
                </div>
                {groups.length > 0 && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-[#3a3b3c] text-gray-600 dark:text-gray-300 font-semibold">
                    {groups.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveFilter('posts')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition cursor-pointer ${
                  activeFilter === 'posts'
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-[#1877f2] dark:text-[#2d88ff]'
                    : 'hover:bg-gray-100 dark:hover:bg-[#3a3b3c]'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-1.5 rounded-full ${activeFilter === 'posts' ? 'bg-[#1877f2] text-white' : 'bg-gray-200 dark:bg-[#3a3b3c] text-gray-700 dark:text-[#e4e6eb]'}`}>
                    <FileText className="w-4 h-4" />
                  </div>
                  <span className="font-semibold text-sm">Bài viết</span>
                </div>
                {posts.length > 0 && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-[#3a3b3c] text-gray-600 dark:text-gray-300 font-semibold">
                    {posts.length}
                  </span>
                )}
              </button>
            </nav>

            <div className="mt-3 border-t border-gray-100 dark:border-[#393a3b] pt-2">
              <div className="px-3 py-1.5 flex items-center gap-2 text-xs font-bold text-gray-500 dark:text-[#b0b3b8]">
                <History className="w-3.5 h-3.5" />
                Tìm kiếm gần đây
              </div>
              {history.length === 0 ? (
                <p className="px-3 pb-2 text-xs text-gray-400">Chưa có lịch sử tìm kiếm</p>
              ) : (
                history.map((item) => (
                  <div key={item} className="group flex items-center gap-2 px-3 py-1.5 hover:bg-gray-100 dark:hover:bg-[#3a3b3c] rounded-lg">
                    {item.startsWith('#') ? <Hash className="w-3.5 h-3.5 text-blue-500" /> : <Search className="w-3.5 h-3.5 text-gray-400" />}
                    <button
                      onClick={() => navigate(`/search?q=${encodeURIComponent(item)}`)}
                      className="min-w-0 flex-1 truncate text-left text-xs text-gray-700 dark:text-[#e4e6eb]"
                    >
                      {item}
                    </button>
                    <button
                      onClick={() => removeHistoryItem(item)}
                      aria-label={`Xóa ${item}`}
                      className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Search Results */}
        <div className="flex-1 max-w-[680px] pt-4 min-h-[calc(100vh-3.5rem)]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <Loader2 className="w-8 h-8 animate-spin text-[#1877f2]" />
              <p className="text-gray-500 dark:text-[#b0b3b8] font-medium">Đang tìm kiếm...</p>
            </div>
          ) : users.length === 0 && posts.length === 0 && groups.length === 0 && query ? (
            <div className="bg-white dark:bg-[#242526] rounded-xl shadow-sm border border-gray-200 dark:border-[#393a3b] p-10 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-gray-100 dark:bg-[#3a3b3c] rounded-full flex items-center justify-center mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-[#e4e6eb]">Không tìm thấy kết quả nào</h3>
              <p className="text-sm text-gray-500 dark:text-[#b0b3b8]">
                Chúng tôi không tìm thấy kết quả nào cho "{query}". Hãy thử kiểm tra lỗi chính tả hoặc dùng các từ khóa khác.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {activeFilter === 'all' && (
                <>
                  {renderUsers()}
                  {renderGroups()}
                  {renderPosts()}
                </>
              )}
              {activeFilter === 'users' && (
                renderUsers() || (
                  <div className="bg-white dark:bg-[#242526] rounded-xl p-8 text-center text-gray-500 dark:text-[#b0b3b8]">
                    Không có người dùng nào khớp với "{query}"
                  </div>
                )
              )}
              {activeFilter === 'groups' && (
                renderGroups() || (
                  <div className="bg-white dark:bg-[#242526] rounded-xl p-8 text-center text-gray-500 dark:text-[#b0b3b8]">
                    Không có nhóm nào khớp với "{query}"
                  </div>
                )
              )}
              {activeFilter === 'posts' && (
                renderPosts() || (
                  <div className="bg-white dark:bg-[#242526] rounded-xl p-8 text-center text-gray-500 dark:text-[#b0b3b8]">
                    Không có bài viết nào khớp với "{query}"
                  </div>
                )
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
