import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { userService } from '../services/api';
import { ChatUser } from './ChatBox';
import {
  Users,
  UserCheck,
  UserPlus,
  UserX,
  MessageCircle,
  Clock,
  Heart,
  Search,
  Check,
  X,
  RefreshCw,
  Home,
  Sparkles,
  ChevronRight,
  User,
} from 'lucide-react';

interface FriendsViewProps {
  onSelectChatUser?: (user: ChatUser) => void;
  onViewProfile?: (userId: string) => void;
}

// Fallback avatar images for nice preview like Facebook
const DEFAULT_AVATAR = '/default-avatar.png';

const getDisplayAvatar = (avatar: string | undefined) => {
  if (avatar && avatar.trim().length > 5) return avatar;
  return DEFAULT_AVATAR;
};

export const FriendsView: React.FC<FriendsViewProps> = ({ onSelectChatUser, onViewProfile }) => {
  const { user: currentUser, isAuthenticated, openLoginModal } = useAuth();
  const { t } = useLanguage();

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

  // Load all initial counts and active tab data
  const loadAllData = async (silent = false) => {
    if (!isAuthenticated) return;
    if (!silent) setLoading(true);
    try {
      const [fData, sData, rData] = await Promise.all([
        userService.getFriends().catch(() => []),
        userService.getSuggestedFriends().catch(() => []),
        userService.getPendingRequests().catch(() => []),
      ]);
      setFriends(Array.isArray(fData) ? fData : []);
      setSuggestions(Array.isArray(sData) ? sData : []);
      setRequests(Array.isArray(rData) ? rData : []);

      if (activeTab === 'followers') {
        const foData = await userService.getFollowers().catch(() => []);
        setFollowers(Array.isArray(foData) ? foData : []);
      } else if (activeTab === 'following') {
        const fgData = await userService.getFollowing().catch(() => []);
        setFollowing(Array.isArray(fgData) ? fgData : []);
      }
    } catch (e) {
      if (!silent) console.error('Error loading friends center data:', e);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData(false);

    // Real-time synchronization every 4 seconds in the background
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
      // Reload friends
      const updatedFriends = await userService.getFriends();
      setFriends(Array.isArray(updatedFriends) ? updatedFriends : []);
      window.dispatchEvent(new CustomEvent('friend_status_updated'));
      setTimeout(() => setActionMessage(null), 3500);
    } catch (err: any) {
      // Fallback by connection ID if targetId failed
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
      alert('Lỗi khi chấp nhận: ' + (err.response?.data?.message || err.message));
    }
  };

  // Handle Reject friend request
  const handleRejectRequest = async (item: any) => {
    const targetId = item.requesterId || item.userId || item.id;
    try {
      await userService.rejectFriendRequest(targetId);
      setRequests((prev) => prev.filter((r) => r.id !== item.id && r.requesterId !== item.requesterId));
      window.dispatchEvent(new CustomEvent('friend_status_updated'));
      setActionMessage('Đã xóa lời mời kết bạn.');
      setTimeout(() => setActionMessage(null), 3000);
    } catch (err: any) {
      if (item.id && item.id !== targetId) {
        try {
          await userService.rejectFriendRequest(item.id);
          setRequests((prev) => prev.filter((r) => r.id !== item.id));
          window.dispatchEvent(new CustomEvent('friend_status_updated'));
          setActionMessage('Đã xóa lời mời kết bạn.');
          setTimeout(() => setActionMessage(null), 3000);
          return;
        } catch {}
      }
      alert('Lỗi khi từ chối: ' + (err.response?.data?.message || err.message));
    }
  };

  // Handle Add Friend in suggestions
  const handleAddFriend = async (targetId: string, name?: string) => {
    try {
      await userService.sendFriendRequest(targetId);
      setSentRequests((prev) => new Set(prev).add(targetId));
      window.dispatchEvent(new CustomEvent('friend_status_updated'));
      setActionMessage(`Đã gửi lời mời kết bạn tới ${name || 'người dùng'}!`);
      setTimeout(() => setActionMessage(null), 3500);
    } catch (err: any) {
      alert('Không thể gửi lời mời: ' + (err.response?.data?.message || err.message));
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
      setActionMessage(`Đã hủy kết bạn với ${friendName || 'người dùng'}.`);
      setTimeout(() => setActionMessage(null), 3000);
    } catch (err: any) {
      alert('Lỗi: ' + (err.response?.data?.message || err.message));
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
      setActionMessage('Đã gửi lời mời kết bạn thành công!');
      setTargetUserId('');
      setTimeout(() => setActionMessage(null), 3000);
    } catch (err: any) {
      alert('Không thể gửi lời mời: ' + (err.response?.data?.message || err.message));
    } finally {
      setSendingRequest(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center space-y-4">
        <div className="w-20 h-20 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 flex items-center justify-center mx-auto shadow-sm">
          <Users className="w-10 h-10" />
        </div>
        <h3 className="text-xl font-extrabold text-gray-900 dark:text-slate-100">
          Đăng nhập để xem Bạn bè
        </h3>
        <p className="text-sm text-gray-500 dark:text-slate-400">
          Kết nối với bạn bè, trò chuyện và cùng chia sẻ những khoảnh khắc tuyệt vời.
        </p>
        <button
          onClick={openLoginModal}
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow transition cursor-pointer"
        >
          Đăng nhập ngay
        </button>
      </div>
    );
  }

  // Active suggestions (filtered out removed)
  const visibleSuggestions = suggestions.filter((s) => !removedSuggestions.has(String(s.id || s.userId)));

  // Navigation Items for Left Facebook Friends Sidebar
  const navItems = [
    { id: 'home', label: 'Trang chủ', icon: Home, count: null },
    { id: 'requests', label: 'Lời mời kết bạn', icon: UserPlus, count: requests.length },
    { id: 'suggestions', label: 'Gợi ý', icon: Sparkles, count: null },
    { id: 'friends', label: 'Tất cả bạn bè', icon: Users, count: friends.length },
    { id: 'followers', label: 'Người theo dõi', icon: Heart, count: followers.length },
    { id: 'following', label: 'Đang theo dõi', icon: Check, count: following.length },
  ];

  return (
    <div className="w-full flex flex-col md:flex-row min-h-[calc(100vh-3.5rem)] bg-[#f0f2f5] dark:bg-slate-900 text-gray-900 dark:text-slate-100">
      {/* 1. LEFT SIDEBAR: Facebook Friends Menu */}
      <aside className="w-full md:w-80 md:fixed md:top-14 md:bottom-0 md:left-0 bg-white dark:bg-slate-800 border-r border-gray-200 dark:border-slate-700 overflow-y-auto p-4 space-y-4 z-20 shadow-sm shrink-0">
        {/* Header Title */}
        <div className="flex items-center justify-between px-2 pt-1">
          <h1 className="text-2xl font-black text-gray-900 dark:text-slate-100 tracking-tight">
            Bạn bè
          </h1>
          <button
            onClick={() => loadAllData(false)}
            title="Làm mới"
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-500 dark:text-slate-400 transition"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Menu Navigation Pills (Exact Facebook Style) */}
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
                className={`w-full flex items-center justify-between p-3 rounded-xl font-semibold text-sm transition cursor-pointer ${
                  isActive
                    ? 'bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400'
                    : 'text-gray-800 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700/60'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center ${
                      isActive
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-slate-200'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="font-bold">{item.label}</span>
                </div>
                {item.count !== null && item.count > 0 && (
                  <span
                    className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full ${
                      item.id === 'requests'
                        ? 'bg-red-500 text-white'
                        : 'bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-slate-300'
                    }`}
                  >
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <hr className="border-gray-200 dark:border-slate-700" />

        {/* Quick Send Friend Request by User UUID */}
        <div className="px-2 space-y-2">
          <label className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
            Kết bạn trực tiếp
          </label>
          <form onSubmit={handleSendRequestById} className="space-y-2">
            <input
              type="text"
              value={targetUserId}
              onChange={(e) => setTargetUserId(e.target.value)}
              placeholder="Nhập mã User UUID..."
              className="w-full bg-gray-100 dark:bg-slate-700 text-gray-900 dark:text-slate-100 px-3 py-2 rounded-xl text-xs border border-transparent focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800 focus:outline-none transition"
            />
            <button
              type="submit"
              disabled={sendingRequest || !targetUserId.trim()}
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center justify-center space-x-1.5 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Gửi lời mời kết bạn</span>
            </button>
          </form>
        </div>
      </aside>

      {/* 2. RIGHT MAIN CONTENT AREA: Facebook Friend Cards Grid */}
      <main className="flex-1 md:ml-80 p-4 sm:p-6 min-h-[calc(100vh-3.5rem)]">
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
                    <h2 className="text-xl font-extrabold text-gray-900 dark:text-slate-100">
                      Lời mời kết bạn
                    </h2>
                    <span className="text-sm font-bold text-red-500 bg-red-50 dark:bg-red-950/40 px-2 py-0.5 rounded-full border border-red-200 dark:border-red-900">
                      {requests.length}
                    </span>
                  </div>
                  <button
                    onClick={() => setActiveTab('requests')}
                    className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                  >
                    Xem tất cả
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
                  <h2 className="text-xl font-extrabold text-gray-900 dark:text-slate-100">
                    Những người bạn có thể biết
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                    Gợi ý dựa trên bạn bè chung và người dùng trong hệ thống
                  </p>
                </div>
                {visibleSuggestions.length > 5 && (
                  <button
                    onClick={() => setActiveTab('suggestions')}
                    className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                  >
                    Xem tất cả
                  </button>
                )}
              </div>

              {loading && visibleSuggestions.length === 0 ? (
                <div className="py-12 text-center text-sm text-gray-400">Đang tải danh sách gợi ý...</div>
              ) : visibleSuggestions.length === 0 ? (
                <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl border border-gray-200 dark:border-slate-700 text-center space-y-2">
                  <Sparkles className="w-10 h-10 text-amber-500 mx-auto" />
                  <h4 className="font-bold text-base">Hiện không còn gợi ý kết bạn mới</h4>
                  <p className="text-xs text-gray-500 max-w-sm mx-auto">
                    Bạn có thể tìm kiếm bạn bè bằng mã User UUID hoặc chia sẻ trang cá nhân của mình.
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
            <div className="flex items-center justify-between pb-2 border-b border-gray-200 dark:border-slate-700">
              <div>
                <h2 className="text-2xl font-black text-gray-900 dark:text-slate-100">
                  Lời mời kết bạn
                </h2>
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                  Bạn có {requests.length} lời mời kết bạn đang chờ phản hồi
                </p>
              </div>
            </div>

            {loading ? (
              <div className="py-12 text-center text-sm text-gray-400">Đang tải danh sách lời mời...</div>
            ) : requests.length === 0 ? (
              <div className="bg-white dark:bg-slate-800 p-12 rounded-2xl border border-gray-200 dark:border-slate-700 text-center space-y-3 max-w-lg mx-auto">
                <div className="w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center mx-auto">
                  <UserPlus className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-lg text-gray-800 dark:text-slate-100">
                  Không có lời mời kết bạn nào
                </h3>
                <p className="text-xs text-gray-500 dark:text-slate-400">
                  Khi có người gửi lời mời kết bạn đến bạn, lời mời sẽ xuất hiện ở đây.
                </p>
                <button
                  onClick={() => setActiveTab('suggestions')}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition"
                >
                  Xem gợi ý kết bạn
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
            <div className="flex items-center justify-between pb-2 border-b border-gray-200 dark:border-slate-700">
              <div>
                <h2 className="text-2xl font-black text-gray-900 dark:text-slate-100">
                  Gợi ý kết bạn
                </h2>
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                  Những người bạn có thể biết trên mạng xã hội
                </p>
              </div>
            </div>

            {loading ? (
              <div className="py-12 text-center text-sm text-gray-400">Đang tải gợi ý kết bạn...</div>
            ) : visibleSuggestions.length === 0 ? (
              <div className="bg-white dark:bg-slate-800 p-12 rounded-2xl border border-gray-200 dark:border-slate-700 text-center space-y-3 max-w-lg mx-auto">
                <Sparkles className="w-12 h-12 text-amber-500 mx-auto" />
                <h3 className="font-bold text-lg text-gray-800 dark:text-slate-100">
                  Hiện chưa có gợi ý mới
                </h3>
                <p className="text-xs text-gray-500 dark:text-slate-400">
                  Hãy thử tải lại danh sách hoặc tìm kiếm bạn bè bằng tên.
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-200 dark:border-slate-700">
              <div>
                <h2 className="text-2xl font-black text-gray-900 dark:text-slate-100">
                  Tất cả bạn bè
                </h2>
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                  {friends.length} người bạn
                </p>
              </div>

              {/* Search Friends Input */}
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Tìm kiếm bạn bè..."
                  className="w-full bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 pl-9 pr-4 py-2 rounded-full border border-gray-200 dark:border-slate-700 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm"
                />
              </div>
            </div>

            {loading ? (
              <div className="py-12 text-center text-sm text-gray-400">Đang tải danh sách bạn bè...</div>
            ) : friends.length === 0 ? (
              <div className="bg-white dark:bg-slate-800 p-12 rounded-2xl border border-gray-200 dark:border-slate-700 text-center space-y-3 max-w-lg mx-auto">
                <div className="w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center mx-auto">
                  <Users className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-lg text-gray-800 dark:text-slate-100">
                  Bạn chưa có người bạn nào
                </h3>
                <p className="text-xs text-gray-500 dark:text-slate-400">
                  Hãy kết bạn với những người khác để cùng trò chuyện và tương tác!
                </p>
                <button
                  onClick={() => setActiveTab('suggestions')}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow transition cursor-pointer"
                >
                  Xem gợi ý kết bạn ngay
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
            <h2 className="text-2xl font-black text-gray-900 dark:text-slate-100 pb-2 border-b border-gray-200 dark:border-slate-700">
              {activeTab === 'followers' ? 'Người theo dõi bạn' : 'Những người bạn đang theo dõi'}
            </h2>
            {loading ? (
              <div className="py-12 text-center text-sm text-gray-400">Đang tải dữ liệu...</div>
            ) : (activeTab === 'followers' ? followers : following).length === 0 ? (
              <div className="bg-white dark:bg-slate-800 p-12 rounded-2xl border border-gray-200 dark:border-slate-700 text-center space-y-2 max-w-lg mx-auto">
                <Heart className="w-12 h-12 text-rose-500 mx-auto" />
                <h4 className="font-bold text-base">Danh sách hiện đang trống</h4>
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
  const displayName =
    item.name ||
    item.fullName ||
    (item.lastName || item.firstName ? `${item.lastName || ''} ${item.firstName || ''}`.trim() : 'Người dùng KLTN');

  const avatarSrc = getDisplayAvatar(item.avatar || item.avatarUrl);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden border border-gray-200 dark:border-slate-700 shadow-sm hover:shadow-md transition duration-200 flex flex-col group">
      {/* 1. Square Avatar / Cover Photo at Top */}
      <div
        onClick={onViewProfile}
        className="relative w-full aspect-square bg-gray-100 dark:bg-slate-700 overflow-hidden cursor-pointer"
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
            className="font-bold text-sm sm:text-base text-gray-900 dark:text-slate-100 hover:underline cursor-pointer truncate block"
          >
            {displayName}
          </h4>
          <p className="text-xs text-gray-500 dark:text-slate-400 truncate mt-0.5">
            {type === 'request'
              ? 'Đã gửi cho bạn lời mời kết bạn'
              : type === 'friend'
              ? 'Bạn bè trên KLTN Social'
              : item.bio || 'Gợi ý kết bạn'}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-1.5 pt-1">
          {/* TYPE: REQUEST (Lời mời kết bạn) */}
          {type === 'request' && (
            <>
              <button
                onClick={onAccept}
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm rounded-lg shadow-sm transition flex items-center justify-center space-x-1 cursor-pointer"
              >
                <span>Xác nhận</span>
              </button>
              <button
                onClick={onReject}
                className="w-full py-2 bg-gray-200 hover:bg-gray-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-gray-800 dark:text-slate-200 font-semibold text-xs sm:text-sm rounded-lg transition cursor-pointer"
              >
                <span>Xóa</span>
              </button>
            </>
          )}

          {/* TYPE: SUGGESTION (Gợi ý kết bạn) */}
          {type === 'suggestion' && (
            <>
              {isSent ? (
                <button
                  disabled
                  className="w-full py-2 bg-gray-100 dark:bg-slate-700/60 text-gray-500 dark:text-slate-400 font-semibold text-xs sm:text-sm rounded-lg cursor-default flex items-center justify-center space-x-1 border border-gray-200 dark:border-slate-600"
                >
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Đã gửi lời mời</span>
                </button>
              ) : (
                <button
                  onClick={onAdd}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm rounded-lg shadow-sm transition flex items-center justify-center space-x-1.5 cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Thêm bạn bè</span>
                </button>
              )}
              <button
                onClick={onRemove}
                className="w-full py-2 bg-gray-200 hover:bg-gray-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-gray-800 dark:text-slate-200 font-semibold text-xs sm:text-sm rounded-lg transition cursor-pointer"
              >
                <span>Gỡ</span>
              </button>
            </>
          )}

          {/* TYPE: FRIEND (Tất cả bạn bè) */}
          {type === 'friend' && (
            <>
              <button
                onClick={onChat}
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm rounded-lg shadow-sm transition flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Nhắn tin</span>
              </button>
              <button
                onClick={onUnfriend}
                className="w-full py-1.5 bg-gray-100 hover:bg-red-50 dark:hover:bg-red-950/40 hover:text-red-600 dark:bg-slate-700 text-gray-600 dark:text-slate-300 font-semibold text-xs rounded-lg transition cursor-pointer"
              >
                <span>Hủy kết bạn</span>
              </button>
            </>
          )}

          {/* TYPE: FOLLOWER */}
          {type === 'follower' && (
            <button
              onClick={onViewProfile}
              className="w-full py-2 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-800 dark:text-slate-200 font-semibold text-xs sm:text-sm rounded-lg transition cursor-pointer"
            >
              <span>Xem trang cá nhân</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
