import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { userService } from '../../services/api';
import { ChatUser } from '../chat/ChatBox';
import {
  Users,
  UserPlus,
  MessageCircle,
  Heart,
  Search,
  Check,
  RefreshCw,
  Home,
  Sparkles,
  UserCheck,
  UserX,
} from 'lucide-react';

interface FriendsViewProps {
  onSelectChatUser?: (user: ChatUser) => void;
  onViewProfile?: (userId: string) => void;
}

const DEFAULT_AVATAR = '/default-avatar.png';

const getDisplayAvatar = (avatar: string | undefined) => {
  if (avatar && avatar.trim().length > 5) return avatar;
  return DEFAULT_AVATAR;
};

// Skeleton loading cards for Facebook grid
const SkeletonCards = () => (
  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
      <div
        key={i}
        className="bg-white dark:bg-[#242526] rounded-2xl overflow-hidden border border-gray-200 dark:border-[#393a3b] shadow-sm animate-pulse flex flex-col"
      >
        <div className="w-full aspect-square bg-gray-200 dark:bg-[#3a3b3c]" />
        <div className="p-3 space-y-2">
          <div className="h-4 bg-gray-200 dark:bg-[#3a3b3c] rounded w-3/4" />
          <div className="h-3 bg-gray-100 dark:bg-[#3a3b3c]/60 rounded w-1/2" />
          <div className="h-8 bg-gray-200 dark:bg-[#3a3b3c] rounded-xl w-full mt-2" />
        </div>
      </div>
    ))}
  </div>
);

export const FriendsView: React.FC<FriendsViewProps> = ({ onSelectChatUser, onViewProfile }) => {
  const { user: currentUser, isAuthenticated, openLoginModal } = useAuth();
  const { t } = useLanguage();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState<'home' | 'requests' | 'suggestions' | 'friends' | 'followers' | 'following'>('home');
  const [friends, setFriends] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [followers, setFollowers] = useState<any[]>([]);
  const [following, setFollowing] = useState<any[]>([]);
  const [sentRequests, setSentRequests] = useState<Set<string>>(new Set());
  const [removedSuggestions, setRemovedSuggestions] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // Quick ID Add Friend
  const [targetUserId, setTargetUserId] = useState('');
  const [sendingRequest, setSendingRequest] = useState(false);

  // Load initial counts & active tab data
  const loadAllData = async (silent = false) => {
    if (!isAuthenticated) return;
    if (!silent) setLoading(true);
    try {
      const [fData, sData, rData, foData, fgData] = await Promise.all([
        userService.getFriends().catch(() => []),
        userService.getSuggestedFriends().catch(() => []),
        userService.getPendingRequests().catch(() => []),
        userService.getFollowers().catch(() => []),
        userService.getFollowing().catch(() => []),
      ]);
      setFriends(Array.isArray(fData) ? fData : []);
      setSuggestions(Array.isArray(sData) ? sData : []);
      setRequests(Array.isArray(rData) ? rData : []);
      setFollowers(Array.isArray(foData) ? foData : []);
      setFollowing(Array.isArray(fgData) ? fgData : []);
    } catch (e) {
      if (!silent) console.error('Error loading friends center data:', e);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData(false);

    // Real-time background sync every 4 seconds
    const interval = setInterval(() => {
      loadAllData(true);
    }, 4000);

    return () => clearInterval(interval);
  }, [isAuthenticated, activeTab]);

  // Handle Accept friend request
  const handleAcceptRequest = async (item: any) => {
    const targetId = item.requesterId || item.userId || item.id;
    try {
      await userService.acceptFriendRequest(targetId);
      setRequests((prev) => prev.filter((r) => r.id !== item.id && r.requesterId !== item.requesterId));
      setActionMessage(`Đã chấp nhận lời mời kết bạn từ ${item.name || 'người dùng'}!`);
      const updatedFriends = await userService.getFriends();
      setFriends(Array.isArray(updatedFriends) ? updatedFriends : []);
      window.dispatchEvent(new CustomEvent('friend_status_updated'));
      setTimeout(() => setActionMessage(null), 3500);
    } catch (err: any) {
      if (item.id && item.id !== targetId) {
        try {
          await userService.acceptFriendRequest(item.id);
          setRequests((prev) => prev.filter((r) => r.id !== item.id));
          const updatedFriends = await userService.getFriends();
          setFriends(Array.isArray(updatedFriends) ? updatedFriends : []);
          window.dispatchEvent(new CustomEvent('friend_status_updated'));
          setActionMessage(`Đã chấp nhận lời mời kết bạn!`);
          setTimeout(() => setActionMessage(null), 3500);
          return;
        } catch {}
      }
      toast.showError('Lỗi khi chấp nhận: ' + (err.response?.data?.message || err.message));
    }
  };

  // Handle Reject friend request
  const handleRejectRequest = async (item: any) => {
    const targetId = item.requesterId || item.userId || item.id;
    try {
      await userService.rejectFriendRequest(targetId);
      setRequests((prev) => prev.filter((r) => r.id !== item.id && r.requesterId !== item.requesterId));
      window.dispatchEvent(new CustomEvent('friend_status_updated'));
      toast.showInfo('Đã xóa lời mời kết bạn.');
    } catch (err: any) {
      if (item.id && item.id !== targetId) {
        try {
          await userService.rejectFriendRequest(item.id);
          setRequests((prev) => prev.filter((r) => r.id !== item.id));
          window.dispatchEvent(new CustomEvent('friend_status_updated'));
          toast.showInfo('Đã xóa lời mời kết bạn.');
          return;
        } catch {}
      }
      toast.showError('Lỗi khi từ chối: ' + (err.response?.data?.message || err.message));
    }
  };

  // Handle Add Friend in suggestions
  const handleAddFriend = async (targetId: string, name?: string) => {
    try {
      await userService.sendFriendRequest(targetId);
      setSentRequests((prev) => new Set(prev).add(targetId));
      window.dispatchEvent(new CustomEvent('friend_status_updated'));
      toast.showSuccess(`Đã gửi lời mời kết bạn tới ${name || 'người dùng'}!`);
    } catch (err: any) {
      toast.showError('Không thể gửi lời mời: ' + (err.response?.data?.message || err.message));
    }
  };

  // Handle Remove Suggestion
  const handleRemoveSuggestion = (id: string) => {
    setRemovedSuggestions((prev) => new Set(prev).add(id));
  };

  // Handle Unfriend
  const handleUnfriend = async (friendId: string, friendName?: string) => {
    if (!window.confirm(`Bạn có chắc muốn hủy kết bạn với ${friendName || 'người này'}?`)) return;
    try {
      await userService.unfriend(friendId);
      setFriends((prev) => prev.filter((f) => f.id !== friendId && f.userId !== friendId));
      window.dispatchEvent(new CustomEvent('friend_status_updated'));
      toast.showSuccess(`Đã hủy kết bạn với ${friendName || 'người dùng'}.`);
    } catch (err: any) {
      toast.showError('Lỗi: ' + (err.response?.data?.message || err.message));
    }
  };

  // Quick ID submit
  const handleSendRequestById = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetUserId.trim()) return;
    setSendingRequest(true);
    try {
      await userService.sendFriendRequest(targetUserId.trim());
      setSentRequests((prev) => new Set(prev).add(targetUserId.trim()));
      toast.showSuccess('Đã gửi lời mời kết bạn thành công!');
      setTargetUserId('');
    } catch (err: any) {
      toast.showError('Không thể gửi lời mời: ' + (err.response?.data?.message || err.message));
    } finally {
      setSendingRequest(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center space-y-4">
        <div className="w-20 h-20 rounded-full bg-[#1877f2]/10 text-[#1877f2] flex items-center justify-center mx-auto shadow-sm">
          <Users className="w-10 h-10" />
        </div>
        <h3 className="text-xl font-black text-gray-900 dark:text-[#e4e6eb]">
          Đăng nhập để xem Bạn bè
        </h3>
        <p className="text-xs text-gray-500 dark:text-[#b0b3b8]">
          Kết nối với bạn bè, trò chuyện và cùng chia sẻ những khoảnh khắc tuyệt vời.
        </p>
        <button
          onClick={openLoginModal}
          className="px-6 py-2.5 bg-[#1877f2] hover:bg-[#166fe5] text-white rounded-xl text-xs font-bold shadow transition cursor-pointer"
        >
          Đăng nhập ngay
        </button>
      </div>
    );
  }

  // Active suggestions (filtered out removed)
  const visibleSuggestions = suggestions.filter((s) => !removedSuggestions.has(String(s.id || s.userId)));

  // Navigation Items matching Facebook Friends Left Sidebar
  const navItems = [
    { id: 'home', label: t('friends.home'), icon: Home, bgColor: 'bg-[#1877f2]', count: null },
    { id: 'requests', label: t('friends.requests'), icon: UserPlus, bgColor: 'bg-blue-500', count: requests.length },
    { id: 'suggestions', label: t('friends.suggestions'), icon: Sparkles, bgColor: 'bg-amber-500', count: visibleSuggestions.length },
    { id: 'friends', label: t('friends.allFriends'), icon: UserCheck, bgColor: 'bg-emerald-500', count: friends.length },
    { id: 'followers', label: t('friends.followers'), icon: Heart, bgColor: 'bg-rose-500', count: followers.length },
    { id: 'following', label: t('friends.following'), icon: Users, bgColor: 'bg-purple-500', count: following.length },
  ];

  return (
    <div className="w-full flex flex-col md:flex-row min-h-[calc(100vh-3.5rem)] bg-[#f0f2f5] dark:bg-[#18191a] text-gray-900 dark:text-[#e4e6eb] transition-colors duration-150">
      {/* 1. MOBILE TOP TAB NAVIGATION SLIDER (Visible on Mobile) */}
      <div className="md:hidden flex items-center space-x-2 overflow-x-auto p-3 bg-white dark:bg-[#242526] border-b border-gray-200 dark:border-[#393a3b] shrink-0 sticky top-14 z-30 scrollbar-none">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id as any);
                setSearchTerm('');
              }}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-[#1877f2] text-white shadow-sm'
                  : 'bg-gray-100 dark:bg-[#3a3b3c] text-gray-700 dark:text-[#b0b3b8] hover:bg-gray-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
              {item.count !== null && item.count > 0 && (
                <span
                  className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded-full ${
                    isActive ? 'bg-white text-[#1877f2]' : 'bg-red-500 text-white'
                  }`}
                >
                  {item.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 2. DESKTOP LEFT SIDEBAR (Synchronized with main SidebarLeft) */}
      <aside className="hidden md:flex flex-col w-[300px] xl:w-[340px] fixed top-14 bottom-0 left-0 bg-white dark:bg-[#242526] border-r border-gray-200 dark:border-[#393a3b] overflow-y-auto p-3.5 space-y-3.5 z-20 shadow-sm shrink-0 select-none">
        {/* Header Title */}
        <div className="flex items-center justify-between px-2 pt-1">
          <h1 className="text-2xl font-black text-gray-900 dark:text-[#e4e6eb] tracking-tight">
            {t('friends.title')}
          </h1>
          <button
            onClick={() => loadAllData(false)}
            title="Làm mới dữ liệu API"
            className="p-2 rounded-full hover:bg-gray-200/60 dark:hover:bg-[#3a3b3c] text-gray-600 dark:text-[#b0b3b8] transition cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Quick Filter Input Box */}
        <div className="relative px-1">
          <Search className="absolute left-4 top-2.5 w-4 h-4 text-gray-400 dark:text-[#b0b3b8]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t('friends.filterPlaceholder')}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-gray-100 dark:bg-[#3a3b3c] text-gray-900 dark:text-[#e4e6eb] placeholder-gray-500 dark:placeholder-[#b0b3b8] rounded-full focus:outline-none focus:ring-1 focus:ring-[#1877f2] transition"
          />
        </div>

        {/* Menu Navigation Pills */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id as any);
                  setSearchTerm('');
                }}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-sm font-semibold transition cursor-pointer ${
                  isActive
                    ? 'bg-blue-50 dark:bg-[#3a3b3c] text-[#2d88ff] font-bold shadow-sm'
                    : 'text-gray-900 dark:text-[#e4e6eb] hover:bg-gray-200/60 dark:hover:bg-[#3a3b3c]/60'
                }`}
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-transform ${
                      isActive
                        ? 'bg-[#1877f2] text-white shadow-md scale-105'
                        : `${item.bgColor} text-white shadow-sm`
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="truncate">{item.label}</span>
                </div>
                {item.count !== null && item.count > 0 && (
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-full shrink-0 ${
                      item.id === 'requests'
                        ? 'bg-red-500 text-white animate-pulse'
                        : isActive
                        ? 'bg-[#1877f2] text-white'
                        : 'bg-gray-200 dark:bg-[#3a3b3c] text-gray-700 dark:text-[#b0b3b8]'
                    }`}
                  >
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* 3. RIGHT MAIN CONTENT AREA (Facebook Friend Cards Grid) */}
      <main className="flex-1 md:ml-[300px] xl:ml-[340px] p-4 sm:p-6 min-h-[calc(100vh-3.5rem)] transition-all duration-150">
        {/* Floating Action Alert Toast */}
        {actionMessage && (
          <div className="mb-5 p-3.5 bg-emerald-600 text-white rounded-xl shadow-lg flex items-center space-x-2 text-sm font-semibold animate-fade-in">
            <Check className="w-5 h-5" />
            <span>{actionMessage}</span>
          </div>
        )}

        {/* TAB 1: TRANG CHỦ (HOME - Overview with Requests + Suggestions) */}
        {activeTab === 'home' && (
          <div className="space-y-8 max-w-7xl mx-auto">
            {/* Section A: Lời mời kết bạn */}
            {requests.length > 0 && (
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <h2 className="text-xl font-extrabold text-gray-900 dark:text-[#e4e6eb]">
                      {t('friends.requests')}
                    </h2>
                    <span className="text-xs font-bold text-red-500 bg-red-50 dark:bg-red-950/40 px-2 py-0.5 rounded-full border border-red-200 dark:border-red-900">
                      {requests.length}
                    </span>
                  </div>
                  <button
                    onClick={() => setActiveTab('requests')}
                    className="text-xs sm:text-sm font-bold text-[#1877f2] dark:text-[#2d88ff] hover:underline cursor-pointer"
                  >
                    {t('friends.seeAll')}
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
                  {requests.slice(0, 10).map((item) => (
                    <FacebookFriendCard
                      key={item.id}
                      item={item}
                      type="request"
                      onAccept={() => handleAcceptRequest(item)}
                      onReject={() => handleRejectRequest(item)}
                      onViewProfile={() => onViewProfile && onViewProfile(item.requesterId || item.userId || item.id)}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Section B: Những người bạn có thể biết (Gợi ý) */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-extrabold text-gray-900 dark:text-[#e4e6eb]">
                    {t('friends.peopleYouMayKnow')}
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-[#b0b3b8] mt-0.5">
                    {t('friends.suggestionsSub')}
                  </p>
                </div>
                {visibleSuggestions.length > 5 && (
                  <button
                    onClick={() => setActiveTab('suggestions')}
                    className="text-xs sm:text-sm font-bold text-[#1877f2] dark:text-[#2d88ff] hover:underline cursor-pointer"
                  >
                    {t('friends.seeAll')}
                  </button>
                )}
              </div>

              {loading && visibleSuggestions.length === 0 ? (
                <SkeletonCards />
              ) : visibleSuggestions.length === 0 ? (
                <div className="bg-white dark:bg-[#242526] p-8 rounded-2xl border border-gray-200 dark:border-[#393a3b] text-center space-y-2 shadow-sm">
                  <Sparkles className="w-10 h-10 text-amber-500 mx-auto" />
                  <h4 className="font-bold text-base text-gray-900 dark:text-[#e4e6eb]">
                    {t('friends.noSuggestions')}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-[#b0b3b8] max-w-sm mx-auto">
                    {t('friends.noSuggestionsSub')}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
                  {visibleSuggestions.slice(0, 15).map((item) => (
                    <FacebookFriendCard
                      key={item.id || item.userId}
                      item={item}
                      type="suggestion"
                      isSent={sentRequests.has(String(item.id || item.userId))}
                      onAdd={() => handleAddFriend(String(item.id || item.userId), item.name || item.fullName)}
                      onRemove={() => handleRemoveSuggestion(String(item.id || item.userId))}
                      onViewProfile={() => onViewProfile && onViewProfile(String(item.id || item.userId))}
                    />
                  ))}
                </div>
              )}
            </section>
          </div>
        )}

        {/* TAB 2: LỜI MỜI KẾT BẠN (REQUESTS) */}
        {activeTab === 'requests' && (
          <div className="space-y-5 max-w-7xl mx-auto">
            <div className="flex items-center justify-between pb-2 border-b border-gray-200 dark:border-[#393a3b]">
              <div>
                <h2 className="text-2xl font-black text-gray-900 dark:text-[#e4e6eb]">
                  {t('friends.requests')}
                </h2>
                <p className="text-xs text-gray-500 dark:text-[#b0b3b8] mt-0.5">
                  {requests.length}
                </p>
              </div>
            </div>

            {loading ? (
              <SkeletonCards />
            ) : requests.length === 0 ? (
              <div className="bg-white dark:bg-[#242526] p-12 rounded-2xl border border-gray-200 dark:border-[#393a3b] text-center space-y-3 max-w-lg mx-auto shadow-sm">
                <div className="w-16 h-16 rounded-full bg-[#1877f2]/10 text-[#1877f2] flex items-center justify-center mx-auto">
                  <UserPlus className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-lg text-gray-900 dark:text-[#e4e6eb]">
                  {t('friends.noRequests')}
                </h3>
                <p className="text-xs text-gray-500 dark:text-[#b0b3b8]">
                  {t('friends.noRequestsSub')}
                </p>
                <button
                  onClick={() => setActiveTab('suggestions')}
                  className="px-5 py-2 bg-[#1877f2] hover:bg-[#166fe5] text-white font-bold text-xs rounded-xl shadow transition cursor-pointer"
                >
                  {t('friends.suggestions')}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
                {requests.map((item) => (
                  <FacebookFriendCard
                    key={item.id}
                    item={item}
                    type="request"
                    onAccept={() => handleAcceptRequest(item)}
                    onReject={() => handleRejectRequest(item)}
                    onViewProfile={() => onViewProfile && onViewProfile(item.requesterId || item.userId || item.id)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: GỢI Ý (SUGGESTIONS) */}
        {activeTab === 'suggestions' && (
          <div className="space-y-5 max-w-7xl mx-auto">
            <div className="flex items-center justify-between pb-2 border-b border-gray-200 dark:border-[#393a3b]">
              <div>
                <h2 className="text-2xl font-black text-gray-900 dark:text-[#e4e6eb]">
                  {t('friends.suggestions')}
                </h2>
                <p className="text-xs text-gray-500 dark:text-[#b0b3b8] mt-0.5">
                  {t('friends.suggestionsSub')}
                </p>
              </div>
            </div>

            {loading ? (
              <SkeletonCards />
            ) : visibleSuggestions.length === 0 ? (
              <div className="bg-white dark:bg-[#242526] p-12 rounded-2xl border border-gray-200 dark:border-[#393a3b] text-center space-y-3 max-w-lg mx-auto shadow-sm">
                <Sparkles className="w-12 h-12 text-amber-500 mx-auto" />
                <h3 className="font-bold text-lg text-gray-900 dark:text-[#e4e6eb]">
                  {t('friends.noSuggestions')}
                </h3>
                <p className="text-xs text-gray-500 dark:text-[#b0b3b8]">
                  {t('friends.noSuggestionsSub')}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
                {visibleSuggestions.map((item) => (
                  <FacebookFriendCard
                    key={item.id || item.userId}
                    item={item}
                    type="suggestion"
                    isSent={sentRequests.has(String(item.id || item.userId))}
                    onAdd={() => handleAddFriend(String(item.id || item.userId), item.name || item.fullName)}
                    onRemove={() => handleRemoveSuggestion(String(item.id || item.userId))}
                    onViewProfile={() => onViewProfile && onViewProfile(String(item.id || item.userId))}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: TẤT CẢ BẠN BÈ (FRIENDS) */}
        {activeTab === 'friends' && (
          <div className="space-y-5 max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-200 dark:border-[#393a3b]">
              <div>
                <h2 className="text-2xl font-black text-gray-900 dark:text-[#e4e6eb]">
                  {t('friends.allFriends')}
                </h2>
                <p className="text-xs text-gray-500 dark:text-[#b0b3b8] mt-0.5">
                  {friends.length}
                </p>
              </div>

              {/* Search Friends Input */}
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={t('friends.searchPlaceholder')}
                  className="w-full bg-white dark:bg-[#242526] text-gray-900 dark:text-[#e4e6eb] placeholder-gray-400 pl-9 pr-4 py-2 rounded-full border border-gray-200 dark:border-[#393a3b] text-xs focus:outline-none focus:ring-1 focus:ring-[#1877f2] shadow-sm"
                />
              </div>
            </div>

            {loading ? (
              <SkeletonCards />
            ) : friends.length === 0 ? (
              <div className="bg-white dark:bg-[#242526] p-12 rounded-2xl border border-gray-200 dark:border-[#393a3b] text-center space-y-3 max-w-lg mx-auto shadow-sm">
                <div className="w-16 h-16 rounded-full bg-[#1877f2]/10 text-[#1877f2] flex items-center justify-center mx-auto">
                  <Users className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-lg text-gray-900 dark:text-[#e4e6eb]">
                  {t('friends.noFriends')}
                </h3>
                <p className="text-xs text-gray-500 dark:text-[#b0b3b8]">
                  {t('friends.noFriendsSub')}
                </p>
                <button
                  onClick={() => setActiveTab('suggestions')}
                  className="px-5 py-2.5 bg-[#1877f2] hover:bg-[#166fe5] text-white font-bold text-xs rounded-xl shadow transition cursor-pointer"
                >
                  {t('friends.suggestions')}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
                {friends
                  .filter((f) => !searchTerm || (f.name && f.name.toLowerCase().includes(searchTerm.toLowerCase())))
                  .map((item) => (
                    <FacebookFriendCard
                      key={item.id || item.userId}
                      item={item}
                      type="friend"
                      onChat={() =>
                        onSelectChatUser &&
                        onSelectChatUser({
                          id: item.userId || item.id,
                          name: item.name,
                          avatar: item.avatar,
                          online: true,
                        })
                      }
                      onUnfriend={() => handleUnfriend(item.userId || item.id, item.name)}
                      onViewProfile={() => onViewProfile && onViewProfile(item.userId || item.id)}
                    />
                  ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 5 & 6: FOLLOWERS & FOLLOWING */}
        {(activeTab === 'followers' || activeTab === 'following') && (
          <div className="space-y-5 max-w-7xl mx-auto">
            <h2 className="text-2xl font-black text-gray-900 dark:text-[#e4e6eb] pb-2 border-b border-gray-200 dark:border-[#393a3b]">
              {activeTab === 'followers' ? t('friends.followers') : t('friends.following')}
            </h2>
            {loading ? (
              <SkeletonCards />
            ) : (activeTab === 'followers' ? followers : following).length === 0 ? (
              <div className="bg-white dark:bg-[#242526] p-12 rounded-2xl border border-gray-200 dark:border-[#393a3b] text-center space-y-2 max-w-lg mx-auto shadow-sm">
                <Heart className="w-12 h-12 text-rose-500 mx-auto" />
                <h4 className="font-bold text-base text-gray-900 dark:text-[#e4e6eb]">
                  {activeTab === 'followers' ? t('friends.noFollowers') : t('friends.noFollowing')}
                </h4>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
                {(activeTab === 'followers' ? followers : following).map((item) => (
                  <FacebookFriendCard
                    key={item.id || item.userId}
                    item={item}
                    type="follower"
                    onViewProfile={() => onViewProfile && onViewProfile(item.userId || item.id)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

/* =========================================================================
   3. FACEBOOK FRIEND CARD (Standard Facebook 1:1 Aspect Photo Card)
   ========================================================================= */
interface FacebookFriendCardProps {
  item: any;
  type: 'request' | 'suggestion' | 'friend' | 'follower';
  isSent?: boolean;
  onAccept?: () => void;
  onReject?: () => void;
  onAdd?: () => void;
  onRemove?: () => void;
  onChat?: () => void;
  onUnfriend?: () => void;
  onViewProfile?: () => void;
}

const FacebookFriendCard: React.FC<FacebookFriendCardProps> = ({
  item,
  type,
  isSent,
  onAccept,
  onReject,
  onAdd,
  onRemove,
  onChat,
  onUnfriend,
  onViewProfile,
}) => {
  const { language, t } = useLanguage();
  const displayName =
    item.name ||
    item.fullName ||
    (item.lastName || item.firstName ? `${item.lastName || ''} ${item.firstName || ''}`.trim() : 'User');

  const avatarSrc = getDisplayAvatar(item.avatar || item.avatarUrl);

  const cardSubtitle =
    type === 'request'
      ? (language === 'en' ? 'Sent you a friend request' : 'Đã gửi cho bạn lời mời kết bạn')
      : type === 'friend'
      ? (language === 'en' ? 'Friends on KLTN Social' : 'Bạn bè trên KLTN Social')
      : item.mutualFriendsCount && item.mutualFriendsCount > 0
      ? (language === 'en' ? `${item.mutualFriendsCount} mutual friends` : `${item.mutualFriendsCount} bạn chung`)
      : (item.bio && item.bio !== 'Gợi ý kết bạn' ? item.bio : t('friends.suggestions'));

  return (
    <div className="bg-white dark:bg-[#242526] rounded-2xl overflow-hidden border border-gray-200 dark:border-[#393a3b] shadow-sm hover:shadow-md transition duration-200 flex flex-col group select-none">
      {/* 1. Square Avatar / Cover Photo at Top */}
      <div
        onClick={onViewProfile}
        className="relative w-full aspect-square bg-gray-100 dark:bg-[#3a3b3c] overflow-hidden cursor-pointer"
      >
        <img
          src={avatarSrc}
          alt={displayName}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/default-avatar.png';
          }}
        />
        {/* Subtle hover gradient */}
        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      {/* 2. Card Info & Facebook Action Buttons */}
      <div className="p-3 flex-1 flex flex-col justify-between space-y-3">
        {/* Name & Subtitle */}
        <div className="min-w-0">
          <h4
            onClick={onViewProfile}
            title={displayName}
            className="font-bold text-sm sm:text-base text-gray-900 dark:text-[#e4e6eb] hover:underline cursor-pointer truncate block"
          >
            {displayName}
          </h4>
          <p className="text-xs text-gray-500 dark:text-[#b0b3b8] truncate mt-0.5">
            {cardSubtitle}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-1.5 pt-1">
          {/* TYPE: REQUEST (Lời mời kết bạn) */}
          {type === 'request' && (
            <>
              <button
                onClick={onAccept}
                className="w-full py-2 bg-[#1877f2] hover:bg-[#166fe5] text-white font-bold text-xs sm:text-sm rounded-xl shadow-sm transition flex items-center justify-center space-x-1 cursor-pointer"
              >
                <span>{t('friends.confirm')}</span>
              </button>
              <button
                onClick={onReject}
                className="w-full py-2 bg-gray-200 hover:bg-gray-300 dark:bg-[#3a3b3c] dark:hover:bg-[#4e4f50] text-gray-800 dark:text-[#e4e6eb] font-bold text-xs sm:text-sm rounded-xl transition cursor-pointer"
              >
                <span>{t('friends.delete')}</span>
              </button>
            </>
          )}

          {/* TYPE: SUGGESTION (Gợi ý kết bạn) */}
          {type === 'suggestion' && (
            <>
              {isSent ? (
                <button
                  disabled
                  className="w-full py-2 bg-gray-100 dark:bg-[#3a3b3c]/60 text-gray-500 dark:text-[#b0b3b8] font-bold text-xs sm:text-sm rounded-xl cursor-default flex items-center justify-center space-x-1 border border-gray-200 dark:border-[#393a3b]"
                >
                  <Check className="w-4 h-4 text-emerald-500" />
                  <span>{t('friends.requestSent')}</span>
                </button>
              ) : (
                <button
                  onClick={onAdd}
                  className="w-full py-2 bg-[#1877f2] hover:bg-[#166fe5] text-white font-bold text-xs sm:text-sm rounded-xl shadow-sm transition flex items-center justify-center space-x-1.5 cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>{t('friends.addFriend')}</span>
                </button>
              )}
              <button
                onClick={onRemove}
                className="w-full py-2 bg-gray-200 hover:bg-gray-300 dark:bg-[#3a3b3c] dark:hover:bg-[#4e4f50] text-gray-800 dark:text-[#e4e6eb] font-bold text-xs sm:text-sm rounded-xl transition cursor-pointer"
              >
                <span>{t('friends.remove')}</span>
              </button>
            </>
          )}

          {/* TYPE: FRIEND (Tất cả bạn bè) */}
          {type === 'friend' && (
            <>
              <button
                onClick={onChat}
                className="w-full py-2 bg-[#1877f2] hover:bg-[#166fe5] text-white font-bold text-xs sm:text-sm rounded-xl shadow-sm transition flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span>{t('friends.message')}</span>
              </button>
              <button
                onClick={onUnfriend}
                className="w-full py-1.5 bg-gray-100 hover:bg-red-50 dark:hover:bg-red-950/40 hover:text-red-600 dark:bg-[#3a3b3c] text-gray-600 dark:text-[#b0b3b8] font-bold text-xs rounded-xl transition cursor-pointer"
              >
                <span>{t('friends.unfriend')}</span>
              </button>
            </>
          )}

          {/* TYPE: FOLLOWER */}
          {type === 'follower' && (
            <button
              onClick={onViewProfile}
              className="w-full py-2 bg-gray-100 dark:bg-[#3a3b3c] hover:bg-gray-200 dark:hover:bg-[#4e4f50] text-gray-800 dark:text-[#e4e6eb] font-bold text-xs sm:text-sm rounded-xl transition cursor-pointer"
            >
              <span>{t('friends.viewProfile')}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
