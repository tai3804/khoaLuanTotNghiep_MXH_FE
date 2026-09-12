import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { userService, postService } from '../../services/api';
import { mediaService } from '../../services/mediaService';
import { MediaGalleryModal } from './MediaGalleryModal';
import { EditProfileModal } from './EditProfileModal';
import { Post, UserProfile } from '../../types';
import { PostCard } from '../post/PostCard';
import { CreatePostBox } from '../post/CreatePostBox';
import { ChatUser } from '../chat/ChatBox';
import {
  Camera,
  Edit3,
  Plus,
  UserPlus,
  UserX,
  MessageCircle,
  Briefcase,
  GraduationCap,
  Home,
  MapPin,
  Clock,
  Mail,
  Calendar,
  Image as ImageIcon,
  Users,
  Grid,
  Heart,
  Share2,
  Lock,
  Globe,
  Sparkles,
  Check,
  X,
  UserCheck,
  HardDrive,
  Upload,
  Link as LinkIcon,
  Loader2,
} from 'lucide-react';

const AVAILABLE_HOBBIES = [
  '🎧 Nghe nhạc',
  '⚽ Đá bóng',
  '✈️ Du lịch',
  '🎮 Chơi game',
  '📚 Đọc sách',
  '💻 Lập trình',
  '🍳 Nấu ăn',
  '📷 Chụp ảnh',
  '🎬 Xem phim',
  '☕ Cà phê',
  '🏃 Chạy bộ',
  '🎨 Vẽ tranh',
  '🎸 Chơi đàn',
  '🛍️ Mua sắm',
  '🧘 Thể hình & Gym',
  '🐾 Thú cưng',
];

interface ProfileViewProps {
  userId?: string | null;
  onSelectChatUser?: (user: ChatUser) => void;
  onViewProfile?: (userId: string) => void;
  onNavigateSettings?: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  userId,
  onSelectChatUser,
  onViewProfile,
  onNavigateSettings,
}) => {
  const navigate = useNavigate();
  const { user: currentUser, isAuthenticated, refreshUserProfile, updateUser } = useAuth();
  const { t } = useLanguage();
  const toast = useToast();

  // Determine if this is the logged-in user's own profile
  const isOwnProfileInitial = !userId || userId === 'me' || Boolean(
    currentUser && (
      String(userId).toLowerCase() === String(currentUser.id).toLowerCase() ||
      String(userId).toLowerCase() === String((currentUser as any).profileId || '').toLowerCase()
    )
  );

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [friends, setFriends] = useState<any[]>([]);
  const [myFriends, setMyFriends] = useState<any[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<{
    isFriend: boolean;
    isFollowing: boolean;
    isFollowedBy: boolean;
    hasPendingSent: boolean;
    hasPendingReceived: boolean;
    pendingRequestId: string | null;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'posts' | 'about' | 'friends' | 'photos'>('posts');
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bioInput, setBioInput] = useState('');
  const [coverError, setCoverError] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // Dynamic check once profile is loaded: if profile matches current logged-in user
  const isOwnProfileByData = Boolean(
    currentUser && profile && (
      (profile.userId && String(currentUser.id).toLowerCase() === String(profile.userId).toLowerCase()) ||
      (profile.id && String(currentUser.id).toLowerCase() === String(profile.id).toLowerCase()) ||
      (currentUser.email && profile.email && currentUser.email.toLowerCase() === profile.email.toLowerCase()) ||
      (currentUser.fullName && (
        `${profile.lastName || ''} ${profile.firstName || ''}`.trim().toLowerCase() === currentUser.fullName.trim().toLowerCase() ||
        (profile.fullName && profile.fullName.trim().toLowerCase() === currentUser.fullName.trim().toLowerCase())
      ))
    )
  );

  const isOwnProfile = isOwnProfileInitial || isOwnProfileByData;
  const targetUserId = isOwnProfile ? (currentUser?.id || 'me') : userId;

  // Media state
  const [showMediaGalleryModal, setShowMediaGalleryModal] = useState(false);
  const avatarInputRef = React.useRef<HTMLInputElement>(null);
  const coverInputRef = React.useRef<HTMLInputElement>(null);
  const [selectedHobbies, setSelectedHobbies] = useState<string[]>([
    '🎧 Nghe nhạc',
    '✈️ Du lịch',
    '💻 Lập trình',
  ]);

  // Load saved hobbies
  useEffect(() => {
    try {
      const uId = currentUser?.id || 'default';
      const saved = localStorage.getItem(`user_hobbies_${uId}`);
      if (saved) {
        setSelectedHobbies(JSON.parse(saved));
      }
    } catch {}
  }, [currentUser?.id]);

  const handleAvatarFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    toast.showInfo('Đang tải ảnh đại diện lên...');
    try {
      const uploaded = await mediaService.uploadMedia(file, 'avatars');
      let myProf = profile;
      if (!myProf || !myProf.firstName) {
        try {
          myProf = await userService.getMyProfile();
        } catch {}
      }
      const names = (myProf?.fullName || currentUser?.fullName || 'User User').split(' ');
      const fn = myProf?.firstName || names.slice(1).join(' ') || 'User';
      const ln = myProf?.lastName || names[0] || 'User';

      const updated = await userService.updateMyProfile({
        firstName: fn,
        lastName: ln,
        middleName: myProf?.middleName || undefined,
        bio: myProf?.bio || undefined,
        avatarUrl: uploaded.fileUrl,
        coverUrl: myProf?.coverUrl || undefined,
        location: myProf?.location || undefined,
        website: myProf?.website || undefined,
        gender: myProf?.gender || 'MALE',
        dateOfBirth: myProf?.dateOfBirth ? (typeof myProf.dateOfBirth === 'string' ? myProf.dateOfBirth.split('T')[0] : undefined) : undefined,
      });

      setProfile(updated);
      if (updateUser) {
        updateUser({ avatar: uploaded.fileUrl });
      }
      if (refreshUserProfile) refreshUserProfile();
      toast.showSuccess('Cập nhật ảnh đại diện thành công!');
    } catch (err: any) {
      toast.showError('Tải ảnh đại diện thất bại: ' + (err.response?.data?.message || err.message));
    } finally {
      if (e.target) e.target.value = '';
    }
  };

  const handleCoverFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    toast.showInfo('Đang tải ảnh bìa lên...');
    try {
      const uploaded = await mediaService.uploadMedia(file, 'covers');
      let myProf = profile;
      if (!myProf || !myProf.firstName) {
        try {
          myProf = await userService.getMyProfile();
        } catch {}
      }
      const names = (myProf?.fullName || currentUser?.fullName || 'User User').split(' ');
      const fn = myProf?.firstName || names.slice(1).join(' ') || 'User';
      const ln = myProf?.lastName || names[0] || 'User';

      const updated = await userService.updateMyProfile({
        firstName: fn,
        lastName: ln,
        middleName: myProf?.middleName || undefined,
        bio: myProf?.bio || undefined,
        avatarUrl: myProf?.avatarUrl || undefined,
        coverUrl: uploaded.fileUrl,
        location: myProf?.location || undefined,
        website: myProf?.website || undefined,
        gender: myProf?.gender || 'MALE',
        dateOfBirth: myProf?.dateOfBirth ? (typeof myProf.dateOfBirth === 'string' ? myProf.dateOfBirth.split('T')[0] : undefined) : undefined,
      });

      setProfile(updated);
      setCoverError(false);
      if (refreshUserProfile) refreshUserProfile();
      toast.showSuccess('Cập nhật ảnh bìa thành công!');
    } catch (err: any) {
      toast.showError('Tải ảnh bìa thất bại: ' + (err.response?.data?.message || err.message));
    } finally {
      if (e.target) e.target.value = '';
    }
  };

  // Load profile data and posts
  useEffect(() => {
    let isMounted = true;
    const loadProfileData = async () => {
      setLoading(true);
      setFriendRequested(false);
      setConnectionStatus(null);
      setProfile(null);
      try {
        let userProf: any = null;
        if (isOwnProfileInitial) {
          userProf = await userService.getMyProfile();
        } else if (userId) {
          try {
            userProf = await userService.getUserProfile(userId);
          } catch (e) {
            // If failed and userId belongs to currentUser, fallback to getMyProfile
            if (currentUser && (
              String(userId).toLowerCase() === String(currentUser.id).toLowerCase() ||
              String(userId).toLowerCase() === String((currentUser as any).profileId || '').toLowerCase()
            )) {
              userProf = await userService.getMyProfile();
            }
          }
        }

        if (isMounted && userProf) {
          setProfile(userProf);
          setBioInput(userProf.bio || '');
        }

        // Load posts for this profile
        const postOwnerId = userProf?.userId || userProf?.id || (isOwnProfileInitial ? currentUser?.id : userId);
        if (postOwnerId && postOwnerId !== 'me') {
          const userPosts = await postService.getUserPosts(postOwnerId);
          if (isMounted) setPosts(userPosts);
        } else if (currentUser?.id) {
          const userPosts = await postService.getUserPosts(currentUser.id);
          if (isMounted) setPosts(userPosts);
        }

        // Always load current user's friends to verify mutual friendship
        try {
          const mf = await userService.getFriends();
          if (isMounted) setMyFriends(Array.isArray(mf) ? mf : []);
        } catch {
          // ignore
        }

        // Load connection status with target user if viewing someone else
        if (!isOwnProfileInitial && postOwnerId && postOwnerId !== 'me') {
          try {
            const st = await userService.getConnectionStatus(postOwnerId);
            if (isMounted && st) setConnectionStatus(st);
          } catch {
            // ignore
          }
        }

        // Load friends list for the profile
        try {
          const fList = isOwnProfileInitial
            ? await userService.getFriends()
            : await userService.getUserFriends(postOwnerId);
          if (isMounted) setFriends(Array.isArray(fList) ? fList : []);
        } catch {
          // ignore
        }
      } catch (e) {
        console.error('Error loading profile:', e);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadProfileData();

    // Listen to real-time friend status update
    const handleRealtimeFriendUpdate = () => {
      userService.getFriends().then((mf) => {
        if (isMounted) setMyFriends(Array.isArray(mf) ? mf : []);
      }).catch(() => {});

      const postOwnerId = profile?.userId || profile?.id || (!isOwnProfileInitial ? userId : currentUser?.id);
      if (isOwnProfileInitial) {
        userService.getFriends().then((fList) => {
          if (isMounted) setFriends(Array.isArray(fList) ? fList : []);
        }).catch(() => {});
      } else if (postOwnerId && postOwnerId !== 'me') {
        userService.getUserFriends(postOwnerId).then((fList) => {
          if (isMounted) setFriends(Array.isArray(fList) ? fList : []);
        }).catch(() => {});
        userService.getConnectionStatus(postOwnerId).then((st) => {
          if (isMounted && st) setConnectionStatus(st);
        }).catch(() => {});
      }
    };
    window.addEventListener('friend_status_updated', handleRealtimeFriendUpdate);

    return () => {
      isMounted = false;
      window.removeEventListener('friend_status_updated', handleRealtimeFriendUpdate);
    };
  }, [userId, isOwnProfileInitial, currentUser?.id]);

  const handleSaveBio = async () => {
    try {
      await userService.updateMyProfile({
        firstName: profile?.firstName || '',
        lastName: profile?.lastName || '',
        bio: bioInput.trim(),
      });
      setProfile((prev) => (prev ? { ...prev, bio: bioInput.trim() } : prev));
      setIsEditingBio(false);
      if (updateUser) updateUser({ bio: bioInput.trim() });
      if (refreshUserProfile) refreshUserProfile();
      toast.showSuccess('Đã cập nhật tiểu sử thành công');
    } catch (err) {
      toast.showError('Không thể lưu tiểu sử');
    }
  };



  const handlePostCreated = (newPost: Post) => {
    setPosts((prev) => [newPost, ...prev]);
  };

  const [friendRequested, setFriendRequested] = useState(false);

  const handleAddFriendProfile = async () => {
    if (isOwnProfile || !targetUserId || targetUserId === 'me' || targetUserId === currentUser?.id || (profile?.userId && profile.userId === currentUser?.id)) {
      toast.showInfo('Đây là trang cá nhân của bạn!');
      return;
    }
    try {
      const resolvedTarget = profile?.userId || profile?.id || targetUserId;
      await userService.sendFriendRequest(resolvedTarget);
      setFriendRequested(true);
      setConnectionStatus((prev: any) => ({ ...prev, hasPendingSent: true, isFriend: false }));
      window.dispatchEvent(new CustomEvent('friend_status_updated'));
      toast.showSuccess('Đã gửi lời mời kết bạn thành công!');
    } catch (e: any) {
      toast.showError(e.response?.data?.message || e.message || 'Không thể gửi lời mời kết bạn');
    }
  };

  const handleCancelSentRequest = async () => {
    try {
      const resolvedTarget = profile?.userId || profile?.id || targetUserId;
      await userService.unfriend(resolvedTarget);
      setFriendRequested(false);
      setConnectionStatus((prev: any) => ({
        ...prev,
        hasPendingSent: false,
        isFriend: false,
      }));
      window.dispatchEvent(new CustomEvent('friend_status_updated'));
      toast.showSuccess('Đã thu hồi lời mời kết bạn thành công.');
    } catch (e: any) {
      toast.showError(e.response?.data?.message || e.message || 'Không thể thu hồi lời mời');
    }
  };

  const handleAcceptFriendRequest = async () => {
    try {
      const reqId = connectionStatus?.pendingRequestId;
      const resolvedTarget = profile?.userId || profile?.id || targetUserId;
      if (reqId) {
        await userService.acceptFriendRequest(reqId);
      } else {
        await userService.acceptFriendRequest(resolvedTarget);
      }
      setConnectionStatus((prev: any) => ({ ...prev, isFriend: true, hasPendingReceived: false }));
      window.dispatchEvent(new CustomEvent('friend_status_updated'));
      toast.showSuccess('Đã chấp nhận lời mời kết bạn!');
    } catch (e: any) {
      toast.showError(e.response?.data?.message || e.message || 'Không thể chấp nhận kết bạn');
    }
  };

  const handleRejectFriendRequest = async () => {
    try {
      const reqId = connectionStatus?.pendingRequestId;
      const resolvedTarget = profile?.userId || profile?.id || targetUserId;
      if (reqId) {
        await userService.rejectFriendRequest(reqId);
      } else {
        await userService.rejectFriendRequest(resolvedTarget);
      }
      setConnectionStatus((prev: any) => ({ ...prev, hasPendingReceived: false }));
      window.dispatchEvent(new CustomEvent('friend_status_updated'));
      toast.showInfo('Đã từ chối lời mời kết bạn.');
    } catch (e: any) {
      toast.showError(e.response?.data?.message || e.message || 'Không thể từ chối');
    }
  };

  const isFriend = Boolean(
    connectionStatus?.isFriend ||
    (profile && myFriends.some((f: any) => {
      const fId = String(f.userId || f.id || '').toLowerCase();
      const pUserId = String(profile.userId || '').toLowerCase();
      const pId = String(profile.id || '').toLowerCase();
      const tId = String(targetUserId || '').toLowerCase();
      return fId && (fId === pUserId || fId === pId || fId === tId);
    })) ||
    (currentUser && friends.some((f: any) => {
      const fId = String(f.userId || f.id || '').toLowerCase();
      const myId = String(currentUser.id || '').toLowerCase();
      return fId && fId === myId;
    }))
  );

  const hasPendingSent = Boolean(connectionStatus?.hasPendingSent || friendRequested);
  const hasPendingReceived = Boolean(connectionStatus?.hasPendingReceived);

  const handleUnfriendProfile = async () => {
    if (!window.confirm(`Bạn có chắc muốn hủy kết bạn với ${fullName}?`)) return;
    try {
      const resolvedTarget = profile?.userId || profile?.id || targetUserId;
      await userService.unfriend(resolvedTarget);
      setFriends((prev) => prev.filter((f) => f.userId !== resolvedTarget && f.id !== resolvedTarget));
      setMyFriends((prev) => prev.filter((f) => f.userId !== resolvedTarget && f.id !== resolvedTarget));
      setFriendRequested(false);
      setConnectionStatus((prev: any) => ({ ...prev, isFriend: false, hasPendingSent: false, hasPendingReceived: false }));
      window.dispatchEvent(new CustomEvent('friend_status_updated'));
      toast.showSuccess('Đã hủy kết bạn thành công.');
    } catch (e: any) {
      toast.showError(e.response?.data?.message || e.message || 'Không thể hủy kết bạn');
    }
  };

  const handlePostDeleted = (postId: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  };

  const fullName = profile
    ? `${profile.lastName || ''} ${profile.firstName || ''}`.trim() || profile.fullName || currentUser?.fullName || 'Người dùng'
    : currentUser?.fullName || 'Người dùng';

  const avatarUrl = profile?.avatarUrl || currentUser?.avatar || '';
  const coverUrl = profile?.coverUrl || '';

  // Extract photos from posts
  const allPostPhotos: string[] = [];
  posts.forEach((p) => {
    if (p.mediaUrls && p.mediaUrls.length > 0) {
      p.mediaUrls.forEach((m) => allPostPhotos.push(m));
    }
  });

  return (
    <div className="w-full bg-[#f0f2f5] dark:bg-[#18191a] min-h-screen pb-8 transition-colors">
      {/* 1. Header Banner & Cover Photo */}
      <div className="bg-white dark:bg-[#242526] shadow-sm border-b border-gray-200 dark:border-[#393a3b] transition-colors">
        <div className="max-w-6xl mx-auto px-0 sm:px-4">
          {/* Cover Container */}
          <div className="relative h-48 sm:h-72 md:h-80 lg:h-96 w-full rounded-b-none sm:rounded-b-2xl overflow-hidden bg-gray-200 dark:bg-[#3a3b3c]">
            {coverUrl && !coverError ? (
              <img
                src={coverUrl}
                alt=""
                className="w-full h-full object-cover"
                onError={() => setCoverError(true)}
              />
            ) : null}
            {isOwnProfile && (
              <>
                <input
                  id="profile-header-cover-input"
                  type="file"
                  onChange={handleCoverFileSelect}
                  accept="image/*"
                  className="hidden"
                />
                <label
                  htmlFor="profile-header-cover-input"
                  className="absolute right-4 bottom-4 z-20 bg-white/90 dark:bg-[#242526]/90 hover:bg-white dark:hover:bg-[#3a3b3c] text-gray-800 dark:text-[#e4e6eb] text-xs sm:text-sm font-semibold px-3 py-2 rounded-xl shadow-md backdrop-blur-sm flex items-center space-x-1.5 transition cursor-pointer"
                  title="Chỉnh sửa ảnh bìa"
                >
                  <Camera className="w-4 h-4" />
                  <span className="hidden sm:inline">Chỉnh sửa ảnh bìa</span>
                </label>
              </>
            )}
          </div>

          {/* User Profile Bar (Avatar + Info + Buttons) */}
          <div className="px-4 sm:px-8 pb-3 relative">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 -mt-16 sm:-mt-20 mb-3">
              {/* Left: Avatar + Names */}
              <div className="flex flex-col sm:flex-row items-center sm:items-end space-y-3 sm:space-y-0 sm:space-x-5 text-center sm:text-left">
                {/* Large Avatar */}
                <div className="relative group">
                  <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full ring-4 ring-white dark:ring-[#242526] overflow-hidden shadow-xl bg-gray-200 dark:bg-[#3a3b3c] flex items-center justify-center shrink-0">
                    <img
                      src={avatarUrl && avatarUrl.trim() !== '' ? avatarUrl : '/default-avatar.png'}
                      alt={fullName}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/default-avatar.png';
                      }}
                    />
                  </div>
                  {isOwnProfile && (
                    <>
                      <input
                        id="profile-header-avatar-input"
                        type="file"
                        onChange={handleAvatarFileSelect}
                        accept="image/*"
                        className="hidden"
                      />
                      <label
                        htmlFor="profile-header-avatar-input"
                        className="absolute right-1 bottom-1 z-20 bg-gray-200 dark:bg-[#3a3b3c] hover:bg-gray-300 dark:hover:bg-[#4e4f50] p-2 rounded-full shadow-md text-gray-700 dark:text-[#e4e6eb] transition cursor-pointer"
                        title="Thay đổi ảnh đại diện"
                      >
                        <Camera className="w-4 h-4" />
                      </label>
                    </>
                  )}
                </div>

                {/* Name & Basic Counts */}
                <div className="pb-1">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-[#e4e6eb] flex items-center justify-center sm:justify-start space-x-2">
                    <span>{fullName}</span>
                    <span className="inline-block w-2.5 h-2.5 rounded-full bg-green-500" title="Đang hoạt động" />
                  </h1>
                  <p className="text-xs sm:text-sm font-semibold text-gray-500 dark:text-[#b0b3b8] mt-1">
                    {friends.length > 0 ? friends.length : (profile?.friendCount || 0)} bạn bè • {posts.length} bài viết
                  </p>
                  {profile?.bio && (
                    <p className="text-xs sm:text-sm text-gray-700 dark:text-[#b0b3b8] mt-1 max-w-md italic">
                      "{profile.bio}"
                    </p>
                  )}
                </div>
              </div>

              {/* Right: Action Buttons */}
              <div className="flex items-center justify-center sm:justify-end space-x-2 pb-1">
                {isOwnProfile ? (
                  <>
                    <button
                      onClick={() => setShowMediaGalleryModal(true)}
                      className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-sm transition cursor-pointer"
                      title="Xem thư viện ảnh/video S3 và Quota 1GB"
                    >
                      <HardDrive className="w-4 h-4" />
                      <span>Thư viện Media & Quota</span>
                    </button>

                    <button
                      onClick={() => setShowEditModal(true)}
                      className="flex items-center space-x-2 bg-gray-200 dark:bg-[#3a3b3c] hover:bg-gray-300 dark:hover:bg-[#4e4f50] text-gray-800 dark:text-[#e4e6eb] font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-sm transition cursor-pointer"
                    >
                      <Edit3 className="w-4 h-4" />
                      <span>Chỉnh sửa trang cá nhân</span>
                    </button>
                  </>
                ) : (
                  <>
                    {isFriend ? (
                      <>
                        <button
                          onClick={handleUnfriendProfile}
                          className="flex items-center space-x-2 bg-gray-200 dark:bg-[#3a3b3c] hover:bg-gray-300 dark:hover:bg-[#4e4f50] text-gray-800 dark:text-[#e4e6eb] font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-sm transition cursor-pointer"
                          title="Nhấn để hủy kết bạn"
                        >
                          <UserCheck className="w-4 h-4 text-[#1877f2]" />
                          <span>Bạn bè</span>
                        </button>
                        <button
                          onClick={() => {
                            if (onSelectChatUser && profile) {
                              const targetId = profile.userId || targetUserId || 'chat';
                              onSelectChatUser({
                                id: targetId,
                                userId: targetId,
                                name: fullName,
                                avatar: avatarUrl,
                                online: true,
                              });
                            }
                          }}
                          className="flex items-center space-x-2 bg-[#1877f2] hover:bg-[#166fe5] text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-sm transition cursor-pointer"
                        >
                          <MessageCircle className="w-4 h-4" />
                          <span>Nhắn tin</span>
                        </button>
                      </>
                    ) : hasPendingReceived ? (
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={handleAcceptFriendRequest}
                          className="flex items-center space-x-1.5 bg-[#1877f2] hover:bg-[#166fe5] text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-sm transition cursor-pointer"
                        >
                          <Check className="w-4 h-4" />
                          <span>Xác nhận</span>
                        </button>
                        <button
                          onClick={handleRejectFriendRequest}
                          className="flex items-center space-x-1.5 bg-gray-200 dark:bg-[#3a3b3c] hover:bg-gray-300 dark:hover:bg-[#4e4f50] text-gray-800 dark:text-[#e4e6eb] font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-sm transition cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                          <span>Xóa lời mời</span>
                        </button>
                      </div>
                    ) : hasPendingSent ? (
                      <button
                        onClick={handleCancelSentRequest}
                        className="flex items-center space-x-2 bg-gray-200 dark:bg-[#3a3b3c] hover:bg-gray-300 dark:hover:bg-[#4e4f50] text-gray-800 dark:text-[#e4e6eb] font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-sm transition cursor-pointer"
                        title="Nhấn để thu hồi lời mời kết bạn"
                      >
                        <UserX className="w-4 h-4 text-red-500" />
                        <span>Hủy lời mời</span>
                      </button>
                    ) : (
                      <button
                        onClick={handleAddFriendProfile}
                        className="flex items-center space-x-2 bg-[#1877f2] hover:bg-[#166fe5] text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-sm transition cursor-pointer"
                      >
                        <UserPlus className="w-4 h-4" />
                        <span>Thêm bạn bè</span>
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Navigation Tabs (Facebook Style) */}
            <div className="border-t border-gray-200 dark:border-[#393a3b] pt-1 mt-2">
              <div className="flex items-center space-x-1 overflow-x-auto no-scrollbar">
                {[
                  { id: 'posts', label: 'Bài viết' },
                  { id: 'about', label: 'Giới thiệu' },
                  { id: 'friends', label: 'Bạn bè' },
                  { id: 'photos', label: 'Ảnh' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`py-3 px-4 text-xs sm:text-sm font-semibold rounded-lg transition-colors cursor-pointer shrink-0 ${
                      activeTab === tab.id
                        ? 'text-[#1877f2] dark:text-[#4599ff] border-b-2 border-[#1877f2] dark:border-[#4599ff] rounded-b-none'
                        : 'text-gray-600 dark:text-[#b0b3b8] hover:bg-gray-100 dark:hover:bg-[#3a3b3c]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Tab Content Body */}
      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-5">
        {activeTab === 'posts' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5">
            {/* Left Column: Intro + Photos + Friends (Width: 5/12) */}
            <div className="lg:col-span-5 space-y-4">
              {/* Intro Box */}
              <div className="bg-white dark:bg-[#242526] rounded-2xl p-4 shadow-sm border border-gray-200 dark:border-[#393a3b] transition">
                <h3 className="font-extrabold text-base text-gray-900 dark:text-[#e4e6eb] mb-3">
                  Giới thiệu
                </h3>

                {/* Bio section */}
                {isEditingBio ? (
                  <div className="space-y-2 mb-3">
                    <textarea
                      value={bioInput}
                      onChange={(e) => setBioInput(e.target.value)}
                      placeholder="Mô tả bản thân của bạn..."
                      rows={3}
                      className="w-full text-xs sm:text-sm p-2.5 rounded-xl border border-gray-300 dark:border-[#393a3b] bg-gray-50 dark:bg-[#3a3b3c] dark:text-[#e4e6eb] focus:outline-none focus:ring-2 focus:ring-[#1877f2]"
                    />
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => setIsEditingBio(false)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 dark:bg-[#3a3b3c] text-gray-700 dark:text-[#b0b3b8] hover:bg-gray-200 dark:hover:bg-[#4e4f50]"
                      >
                        Hủy
                      </button>
                      <button
                        onClick={handleSaveBio}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#1877f2] text-white hover:bg-[#166fe5]"
                      >
                        Lưu
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="mb-3 text-center">
                    {profile?.bio && (
                      <p className="text-xs sm:text-sm text-gray-700 dark:text-[#b0b3b8]">
                        {profile.bio}
                      </p>
                    )}
                    {isOwnProfile && (
                      <button
                        onClick={() => setIsEditingBio(true)}
                        className="w-full mt-2.5 py-1.5 rounded-xl bg-gray-100 dark:bg-[#3a3b3c] hover:bg-gray-200 dark:hover:bg-[#4e4f50] text-xs font-bold text-gray-800 dark:text-[#e4e6eb] transition cursor-pointer"
                      >
                        {profile?.bio ? 'Chỉnh sửa tiểu sử' : 'Thêm tiểu sử'}
                      </button>
                    )}
                  </div>
                )}

                <div className="space-y-2.5 text-xs sm:text-sm text-gray-600 dark:text-[#b0b3b8] pt-2 border-t border-gray-100 dark:border-[#393a3b]">
                  {(profile as any)?.education && (
                    <div className="flex items-center space-x-3">
                      <GraduationCap className="w-4 h-4 text-gray-400 dark:text-[#8a8d91] shrink-0" />
                      <span>Học tại <b>{(profile as any).education}</b></span>
                    </div>
                  )}
                  {profile?.location && (
                    <div className="flex items-center space-x-3">
                      <MapPin className="w-4 h-4 text-gray-400 dark:text-[#8a8d91] shrink-0" />
                      <span>Sống tại <b>{profile.location}</b></span>
                    </div>
                  )}
                  {profile?.email && (
                    <div className="flex items-center space-x-3">
                      <Mail className="w-4 h-4 text-gray-400 dark:text-[#8a8d91] shrink-0" />
                      <span>{profile.email}</span>
                    </div>
                  )}
                  {(profile as any)?.createdAt && (
                    <div className="flex items-center space-x-3">
                      <Clock className="w-4 h-4 text-gray-400 dark:text-[#8a8d91] shrink-0" />
                      <span>
                        Tham gia vào{' '}
                        <b>
                          Tháng {new Date((profile as any).createdAt).getMonth() + 1} năm {new Date((profile as any).createdAt).getFullYear()}
                        </b>
                      </span>
                    </div>
                  )}
                </div>

                {selectedHobbies.length > 0 && (
                  <div className="pt-3 border-t border-gray-100 dark:border-[#393a3b]">
                    <p className="text-xs font-bold text-gray-500 dark:text-[#b0b3b8] mb-2">Sở thích</p>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedHobbies.map((hobby, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 dark:bg-[#3a3b3c] text-gray-700 dark:text-[#e4e6eb] border border-gray-200 dark:border-[#4e4f50]"
                        >
                          {hobby}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {isOwnProfile && (
                  <button
                    onClick={() => setShowEditModal(true)}
                    className="w-full mt-4 py-2 rounded-xl bg-gray-100 dark:bg-[#3a3b3c] hover:bg-gray-200 dark:hover:bg-[#4e4f50] text-xs font-bold text-gray-800 dark:text-[#e4e6eb] transition cursor-pointer"
                  >
                    Chỉnh sửa chi tiết
                  </button>
                )}
              </div>

              {/* Photos Grid Box */}
              <div className="bg-white dark:bg-[#242526] rounded-2xl p-4 shadow-sm border border-gray-200 dark:border-[#393a3b] transition">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-extrabold text-base text-gray-900 dark:text-[#e4e6eb]">
                    Ảnh
                  </h3>
                  <button
                    onClick={() => setActiveTab('photos')}
                    className="text-xs font-semibold text-[#1877f2] dark:text-[#4599ff] hover:underline cursor-pointer"
                  >
                    Xem tất cả ảnh
                  </button>
                </div>
                {allPostPhotos.length > 0 ? (
                  <div className="grid grid-cols-3 gap-1.5 rounded-xl overflow-hidden">
                    {allPostPhotos.slice(0, 9).map((photo, i) => (
                      <div key={i} className="aspect-square bg-gray-100 dark:bg-[#3a3b3c] overflow-hidden group">
                        <img
                          src={photo}
                          alt="Photo"
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-200 cursor-pointer"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-xs text-gray-400 dark:text-[#8a8d91]">
                    Chưa có ảnh nào được đăng tải.
                  </div>
                )}
              </div>

              {/* Friends Box */}
              <div className="bg-white dark:bg-[#242526] rounded-2xl p-4 shadow-sm border border-gray-200 dark:border-[#393a3b] transition">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-extrabold text-base text-gray-900 dark:text-[#e4e6eb]">
                      Bạn bè
                    </h3>
                    <p className="text-[11px] text-gray-400 dark:text-[#8a8d91]">{friends.length} người bạn</p>
                  </div>
                  <button
                    onClick={() => setActiveTab('friends')}
                    className="text-xs font-semibold text-[#1877f2] dark:text-[#4599ff] hover:underline cursor-pointer"
                  >
                    Xem tất cả bạn bè
                  </button>
                </div>

                {friends.length > 0 ? (
                  <div className="grid grid-cols-3 gap-3">
                    {friends.slice(0, 6).map((friend, i) => (
                      <div
                        key={i}
                        onClick={() => onViewProfile && onViewProfile(friend.userId || friend.id)}
                        className="cursor-pointer group"
                      >
                        <div className="aspect-square rounded-xl overflow-hidden bg-gray-200 dark:bg-[#3a3b3c] mb-1">
                          <img
                            src={friend.avatar || friend.avatarUrl || '/default-avatar.png'}
                            alt={friend.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition"
                          />
                        </div>
                        <p className="text-[11px] font-bold text-gray-800 dark:text-[#e4e6eb] truncate group-hover:underline">
                          {friend.name || `${friend.lastName || ''} ${friend.firstName || ''}`.trim() || 'Bạn bè'}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-xs text-gray-400 dark:text-[#8a8d91]">
                    Chưa có bạn bè nào.
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Create Post Box + User Posts (Width: 7/12) */}
            <div className="lg:col-span-7 space-y-4">
              {isOwnProfile && (
                <CreatePostBox onPostCreated={handlePostCreated} />
              )}

              <div className="bg-white dark:bg-[#242526] rounded-2xl p-3 px-4 shadow-sm border border-gray-200 dark:border-[#393a3b] flex items-center justify-between">
                <h3 className="font-extrabold text-sm text-gray-900 dark:text-[#e4e6eb]">
                  Bài viết ({posts.length})
                </h3>
              </div>

              {loading ? (
                <div className="text-center py-12 text-sm text-gray-400 dark:text-[#8a8d91] animate-pulse">
                  Đang tải bài viết...
                </div>
              ) : posts.length > 0 ? (
                posts.map((p) => (
                  <PostCard
                    key={p.id}
                    post={p}
                    onDeletePost={handlePostDeleted}
                  />
                ))
              ) : (
                <div className="bg-white dark:bg-[#242526] rounded-2xl p-8 text-center shadow-sm border border-gray-200 dark:border-[#393a3b]">
                  <p className="font-bold text-base text-gray-800 dark:text-[#e4e6eb]">
                    Chưa có bài viết nào
                  </p>
                  <p className="text-xs text-gray-400 dark:text-[#8a8d91] mt-1">
                    {isOwnProfile ? 'Hãy chia sẻ khoảnh khắc đầu tiên của bạn lên trang cá nhân!' : 'Người dùng này chưa đăng bài viết nào.'}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab: About (Giới thiệu) */}
        {activeTab === 'about' && (
          <div className="bg-white dark:bg-[#242526] rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-[#393a3b] max-w-4xl mx-auto space-y-6">
            <h2 className="text-xl font-extrabold text-gray-900 dark:text-[#e4e6eb] pb-3 border-b border-gray-100 dark:border-[#393a3b]">
              Tổng quan thông tin cá nhân
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-400 dark:text-[#8a8d91] uppercase">Họ và tên</label>
                  <p className="font-semibold text-gray-900 dark:text-[#e4e6eb] mt-0.5">{fullName}</p>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 dark:text-[#8a8d91] uppercase">Email liên hệ</label>
                  <p className="font-semibold text-gray-900 dark:text-[#e4e6eb] mt-0.5">{profile?.email || currentUser?.email || 'Chưa cập nhật'}</p>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 dark:text-[#8a8d91] uppercase">Nơi sinh sống</label>
                  <p className="font-semibold text-gray-900 dark:text-[#e4e6eb] mt-0.5">{profile?.location || 'TP. Hồ Chí Minh, Việt Nam'}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-400 dark:text-[#8a8d91] uppercase">Giới tính</label>
                  <p className="font-semibold text-gray-900 dark:text-[#e4e6eb] mt-0.5">
                    {profile?.gender === 'MALE' ? 'Nam' : profile?.gender === 'FEMALE' ? 'Nữ' : 'Khác'}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 dark:text-[#8a8d91] uppercase">Ngày sinh</label>
                  <p className="font-semibold text-gray-900 dark:text-[#e4e6eb] mt-0.5">{profile?.dateOfBirth || 'Chưa cập nhật'}</p>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 dark:text-[#8a8d91] uppercase">Tiểu sử</label>
                  <p className="font-semibold text-gray-900 dark:text-[#e4e6eb] mt-0.5">{profile?.bio || 'Chưa có'}</p>
                </div>
              </div>
            </div>
            {isOwnProfile && (
              <div className="pt-4 border-t border-gray-100 dark:border-[#393a3b] flex justify-end">
                <button
                  onClick={() => setShowEditModal(true)}
                  className="bg-[#1877f2] hover:bg-[#166fe5] text-white text-xs font-bold px-4 py-2 rounded-xl transition cursor-pointer"
                >
                  Chỉnh sửa thông tin
                </button>
              </div>
            )}
          </div>
        )}

        {/* Tab: Friends (Bạn bè) */}
        {activeTab === 'friends' && (
          <div className="bg-white dark:bg-[#242526] rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-[#393a3b] max-w-5xl mx-auto">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-[#393a3b] mb-6">
              <div>
                <h2 className="text-xl font-extrabold text-gray-900 dark:text-[#e4e6eb]">
                  Bạn bè ({friends.length})
                </h2>
                <p className="text-xs text-gray-400 dark:text-[#8a8d91]">Tất cả những người bạn đã kết nối trên KLTN Social</p>
              </div>
            </div>

            {friends.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {friends.map((friend, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 rounded-2xl border border-gray-100 dark:border-[#393a3b] hover:bg-gray-50 dark:hover:bg-[#3a3b3c]/50 transition"
                  >
                    <div
                      onClick={() => onViewProfile && onViewProfile(friend.userId || friend.id)}
                      className="flex items-center space-x-3 cursor-pointer"
                    >
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-200 dark:bg-[#3a3b3c]">
                        <img
                          src={friend.avatar || friend.avatarUrl || '/default-avatar.png'}
                          alt={friend.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-gray-900 dark:text-[#e4e6eb] hover:underline">
                          {friend.name || `${friend.lastName || ''} ${friend.firstName || ''}`.trim() || 'Bạn bè'}
                        </h4>
                        <p className="text-xs text-gray-400 dark:text-[#8a8d91]">Bạn bè trên KLTN Social</p>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        if (onSelectChatUser) {
                          onSelectChatUser({
                            id: friend.userId || friend.id,
                            name: friend.name || `${friend.lastName || ''} ${friend.firstName || ''}`.trim(),
                            avatar: friend.avatar || friend.avatarUrl || '/default-avatar.png',
                            online: true,
                          });
                        }
                      }}
                      className="bg-blue-50 dark:bg-[#1877f2]/20 text-[#1877f2] dark:text-[#4599ff] hover:bg-blue-100 dark:hover:bg-[#1877f2]/30 text-xs font-bold px-3 py-2 rounded-xl transition"
                    >
                      Nhắn tin
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-sm text-gray-400 dark:text-[#8a8d91]">
                Chưa có người bạn nào trong danh sách.
              </div>
            )}
          </div>
        )}

        {/* Tab: Photos (Ảnh) */}
        {activeTab === 'photos' && (
          <div className="bg-white dark:bg-[#242526] rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-[#393a3b] max-w-5xl mx-auto">
            <h2 className="text-xl font-extrabold text-gray-900 dark:text-[#e4e6eb] pb-3 border-b border-gray-100 dark:border-[#393a3b] mb-6">
              Ảnh của {fullName}
            </h2>
            {allPostPhotos.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {allPostPhotos.map((photo, i) => (
                  <div key={i} className="aspect-square rounded-xl overflow-hidden bg-gray-100 dark:bg-[#3a3b3c] group">
                    <img
                      src={photo}
                      alt="User photo"
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-200 cursor-pointer"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 text-sm text-gray-400 dark:text-[#8a8d91]">
                Chưa có ảnh nào được đăng tải.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Media Gallery & S3 Storage Quota Modal */}
      <MediaGalleryModal
        userId={targetUserId || ''}
        isOpen={showMediaGalleryModal}
        onClose={() => setShowMediaGalleryModal(false)}
      />

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        profile={profile}
        onProfileUpdated={(updated) => {
          setProfile(updated);
          setCoverError(false);
        }}
      />
    </div>
  );
};
