import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { userService, postService } from '../../services/api';
import { mediaService } from '../../services/mediaService';
import { MediaGalleryModal } from './MediaGalleryModal';
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
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  userId,
  onSelectChatUser,
  onViewProfile,
}) => {
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

  // Edit form & Media state
  const [showMediaGalleryModal, setShowMediaGalleryModal] = useState(false);
  const avatarInputRef = React.useRef<HTMLInputElement>(null);
  const coverInputRef = React.useRef<HTMLInputElement>(null);
  const modalAvatarRef = React.useRef<HTMLInputElement>(null);
  const modalCoverRef = React.useRef<HTMLInputElement>(null);
  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editAvatarUrl, setEditAvatarUrl] = useState('');
  const [editCoverUrl, setEditCoverUrl] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editWebsite, setEditWebsite] = useState('');
  const [editEducation, setEditEducation] = useState('');
  const [editGender, setEditGender] = useState('OTHER');
  const [editDateOfBirth, setEditDateOfBirth] = useState('');
  const [selectedHobbies, setSelectedHobbies] = useState<string[]>([
    '🎧 Nghe nhạc',
    '✈️ Du lịch',
    '💻 Lập trình',
  ]);
  const [isEditingModalBio, setIsEditingModalBio] = useState(false);
  const [isEditingDetails, setIsEditingDetails] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingHobbies, setIsEditingHobbies] = useState(false);
  const [showAvatarUrlInput, setShowAvatarUrlInput] = useState(false);
  const [showCoverUrlInput, setShowCoverUrlInput] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

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
    toast.showInfo('Đang nén & tải ảnh đại diện lên AWS S3...');
    try {
      const uploaded = await mediaService.uploadMedia(file, 'avatars');
      const names = (profile?.fullName || currentUser?.fullName || 'User User').split(' ');
      const fn = profile?.firstName || names.slice(1).join(' ') || 'User';
      const ln = profile?.lastName || names[0] || 'User';

      const updated = await userService.updateMyProfile({
        firstName: fn,
        lastName: ln,
        avatarUrl: uploaded.fileUrl,
      });
      setProfile(updated);
      if (updateUser) {
        updateUser({ avatar: uploaded.fileUrl });
      }
      toast.showSuccess('Cập nhật ảnh đại diện trên AWS S3 thành công!');
    } catch (err: any) {
      toast.showError('Tải ảnh đại diện thất bại: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleCoverFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    toast.showInfo('Đang nén & tải ảnh bìa lên AWS S3...');
    try {
      const uploaded = await mediaService.uploadMedia(file, 'covers');
      const names = (profile?.fullName || currentUser?.fullName || 'User User').split(' ');
      const fn = profile?.firstName || names.slice(1).join(' ') || 'User';
      const ln = profile?.lastName || names[0] || 'User';

      const updated = await userService.updateMyProfile({
        firstName: fn,
        lastName: ln,
        coverUrl: uploaded.fileUrl,
      });
      setProfile(updated);
      toast.showSuccess('Cập nhật ảnh bìa trên AWS S3 thành công!');
    } catch (err: any) {
      toast.showError('Tải ảnh bìa thất bại: ' + (err.response?.data?.message || err.message));
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
          setEditFirstName(userProf.firstName || '');
          setEditLastName(userProf.lastName || '');
          setEditBio(userProf.bio || '');
          setEditAvatarUrl(userProf.avatarUrl || '');
          setEditCoverUrl(userProf.coverUrl || '');
          setEditLocation(userProf.location || '');
          setEditWebsite(userProf.website || '');
          setEditEducation((userProf as any).education || '');
          setEditGender(userProf.gender || 'OTHER');
          setEditDateOfBirth(userProf.dateOfBirth || '');
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

  const handleModalAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingAvatar(true);
    toast.showInfo('Đang tải ảnh đại diện lên AWS S3...');
    try {
      const uploaded = await mediaService.uploadMedia(file, 'avatars');
      setEditAvatarUrl(uploaded.fileUrl);
      toast.showSuccess('Đã tải ảnh đại diện lên AWS S3!');
    } catch (err: any) {
      toast.showError('Tải ảnh đại diện thất bại: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleModalCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingCover(true);
    toast.showInfo('Đang tải ảnh bìa lên AWS S3...');
    try {
      const uploaded = await mediaService.uploadMedia(file, 'covers');
      setEditCoverUrl(uploaded.fileUrl);
      toast.showSuccess('Đã tải ảnh bìa lên AWS S3!');
    } catch (err: any) {
      toast.showError('Tải ảnh bìa thất bại: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsUploadingCover(false);
    }
  };

  const toggleHobby = (hobby: string) => {
    setSelectedHobbies((prev) =>
      prev.includes(hobby) ? prev.filter((h) => h !== hobby) : [...prev, hobby]
    );
  };

  const handleSaveProfile = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    try {
      const updated = await userService.updateMyProfile({
        firstName: editFirstName.trim(),
        lastName: editLastName.trim(),
        bio: editBio.trim(),
        avatarUrl: editAvatarUrl.trim(),
        coverUrl: editCoverUrl.trim(),
        location: editLocation.trim(),
        website: editWebsite.trim(),
        gender: editGender,
        dateOfBirth: editDateOfBirth || undefined,
      });

      // Persist hobbies
      try {
        const uId = currentUser?.id || 'default';
        localStorage.setItem(`user_hobbies_${uId}`, JSON.stringify(selectedHobbies));
      } catch {}

      setProfile((prev) => ({
        ...(prev || {}),
        ...updated,
        education: editEducation.trim() || (prev as any)?.education,
      }));
      setShowEditModal(false);
      const newFullName = `${editLastName.trim()} ${editFirstName.trim()}`.trim();
      if (updateUser) {
        updateUser({
          fullName: newFullName,
          avatar: editAvatarUrl.trim(),
          bio: editBio.trim(),
        });
      }
      if (refreshUserProfile) refreshUserProfile();
      toast.showSuccess('Cập nhật hồ sơ cá nhân thành công!');
    } catch (err: any) {
      toast.showError('Cập nhật hồ sơ thất bại: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsSaving(false);
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
  const coverUrl = profile?.coverUrl || 'https://images.unsplash.com/photo-1707343843437-caacff5cfa74?w=1600';

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
          <div className="relative h-48 sm:h-72 md:h-80 lg:h-96 w-full rounded-b-none sm:rounded-b-2xl overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700">
            <img
              src={coverUrl}
              alt="Cover"
              className="w-full h-full object-cover"
            />
            {isOwnProfile && (
              <>
                <input
                  type="file"
                  ref={coverInputRef}
                  onChange={handleCoverFileSelect}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  onClick={() => coverInputRef.current?.click()}
                  className="absolute right-4 bottom-4 bg-white/90 dark:bg-[#242526]/90 hover:bg-white dark:hover:bg-[#3a3b3c] text-gray-800 dark:text-[#e4e6eb] text-xs sm:text-sm font-semibold px-3 py-2 rounded-xl shadow-md backdrop-blur-sm flex items-center space-x-1.5 transition cursor-pointer"
                  title="Tải ảnh bìa mới lên AWS S3"
                >
                  <Camera className="w-4 h-4" />
                  <span className="hidden sm:inline">Tải ảnh bìa mới lên S3</span>
                </button>
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
                        type="file"
                        ref={avatarInputRef}
                        onChange={handleAvatarFileSelect}
                        accept="image/*"
                        className="hidden"
                      />
                      <button
                        onClick={() => avatarInputRef.current?.click()}
                        className="absolute right-1 bottom-1 bg-gray-200 dark:bg-[#3a3b3c] hover:bg-gray-300 dark:hover:bg-[#4e4f50] p-2 rounded-full shadow-md text-gray-700 dark:text-[#e4e6eb] transition cursor-pointer"
                        title="Đổi avatar lên AWS S3"
                      >
                        <Camera className="w-4 h-4" />
                      </button>
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
                  className="bg-[#1877f2] hover:bg-[#166fe5] text-white text-xs font-bold px-4 py-2 rounded-xl transition"
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

      {/* 3. Edit Profile Modal (Facebook Authentic Style) */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-[#242526] rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col border border-gray-200 dark:border-[#393a3b] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-200 dark:border-[#393a3b] shrink-0">
              <div className="w-9" /> {/* Spacer for optical center balance */}
              <h3 className="font-extrabold text-lg sm:text-xl text-gray-900 dark:text-[#e4e6eb] text-center flex-1">
                Chỉnh sửa trang cá nhân
              </h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 dark:bg-[#3a3b3c] hover:bg-gray-200 dark:hover:bg-[#4e4f50] text-gray-600 dark:text-[#b0b3b8] transition cursor-pointer"
                title="Đóng"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body - Scrollable Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 divide-y divide-gray-200 dark:divide-[#393a3b] text-xs sm:text-sm">
              
              {/* SECTION 1: Ảnh đại diện (Profile Picture) */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-base font-bold text-gray-900 dark:text-[#e4e6eb]">
                    Ảnh đại diện
                  </h4>
                  <input
                    type="file"
                    ref={modalAvatarRef}
                    onChange={handleModalAvatarUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => modalAvatarRef.current?.click()}
                    disabled={isUploadingAvatar}
                    className="text-[#1877f2] dark:text-[#4599ff] hover:bg-blue-50 dark:hover:bg-[#1877f2]/10 px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer text-xs sm:text-sm"
                  >
                    {isUploadingAvatar ? 'Đang tải...' : 'Chỉnh sửa'}
                  </button>
                </div>

                <div className="flex flex-col items-center justify-center">
                  <div
                    onClick={() => modalAvatarRef.current?.click()}
                    className="w-36 h-36 sm:w-40 sm:h-40 rounded-full overflow-hidden ring-4 ring-gray-100 dark:ring-[#3a3b3c] shadow-md relative group cursor-pointer bg-gray-200 dark:bg-[#3a3b3c]"
                  >
                    <img
                      src={editAvatarUrl && editAvatarUrl.trim() !== '' ? editAvatarUrl : '/default-avatar.png'}
                      alt="Avatar Preview"
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-200"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/default-avatar.png';
                      }}
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white transition duration-200">
                      <Camera className="w-6 h-6 mb-1" />
                      <span className="text-[11px] font-bold">Thay đổi</span>
                    </div>
                    {isUploadingAvatar && (
                      <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white">
                        <Loader2 className="w-6 h-6 animate-spin mb-1 text-blue-400" />
                        <span className="text-[10px] font-semibold">Tải lên S3...</span>
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowAvatarUrlInput(!showAvatarUrlInput)}
                    className="mt-2 text-[11px] text-[#1877f2] dark:text-[#4599ff] hover:underline flex items-center space-x-1"
                  >
                    <LinkIcon className="w-3 h-3" />
                    <span>{showAvatarUrlInput ? 'Ẩn nhập link URL' : 'Hoặc dán link URL ảnh'}</span>
                  </button>

                  {showAvatarUrlInput && (
                    <div className="w-full max-w-md mt-2">
                      <input
                        type="url"
                        value={editAvatarUrl}
                        onChange={(e) => setEditAvatarUrl(e.target.value)}
                        placeholder="https://..."
                        className="w-full p-2 text-xs rounded-xl border border-gray-300 dark:border-[#393a3b] bg-gray-50 dark:bg-[#3a3b3c] dark:text-[#e4e6eb] focus:ring-2 focus:ring-[#1877f2]"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* SECTION 2: Ảnh bìa (Cover Photo) */}
              <div className="pt-6">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-base font-bold text-gray-900 dark:text-[#e4e6eb]">
                    Ảnh bìa
                  </h4>
                  <input
                    type="file"
                    ref={modalCoverRef}
                    onChange={handleModalCoverUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => modalCoverRef.current?.click()}
                    disabled={isUploadingCover}
                    className="text-[#1877f2] dark:text-[#4599ff] hover:bg-blue-50 dark:hover:bg-[#1877f2]/10 px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer text-xs sm:text-sm"
                  >
                    {isUploadingCover ? 'Đang tải...' : 'Chỉnh sửa'}
                  </button>
                </div>

                <div className="flex flex-col items-center justify-center">
                  <div
                    onClick={() => modalCoverRef.current?.click()}
                    className="w-full h-36 sm:h-44 rounded-2xl overflow-hidden shadow-sm relative group cursor-pointer bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700"
                  >
                    <img
                      src={editCoverUrl && editCoverUrl.trim() !== '' ? editCoverUrl : coverUrl}
                      alt="Cover Preview"
                      className="w-full h-full object-cover group-hover:scale-102 transition duration-200"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white transition duration-200">
                      <Camera className="w-6 h-6 mb-1" />
                      <span className="text-xs font-bold">Cập nhật ảnh bìa</span>
                    </div>
                    {isUploadingCover && (
                      <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white">
                        <Loader2 className="w-6 h-6 animate-spin mb-1 text-blue-400" />
                        <span className="text-xs font-semibold">Đang tải lên AWS S3...</span>
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowCoverUrlInput(!showCoverUrlInput)}
                    className="mt-2 text-[11px] text-[#1877f2] dark:text-[#4599ff] hover:underline flex items-center space-x-1"
                  >
                    <LinkIcon className="w-3 h-3" />
                    <span>{showCoverUrlInput ? 'Ẩn nhập link URL' : 'Hoặc dán link URL ảnh bìa'}</span>
                  </button>

                  {showCoverUrlInput && (
                    <div className="w-full max-w-md mt-2">
                      <input
                        type="url"
                        value={editCoverUrl}
                        onChange={(e) => setEditCoverUrl(e.target.value)}
                        placeholder="https://..."
                        className="w-full p-2 text-xs rounded-xl border border-gray-300 dark:border-[#393a3b] bg-gray-50 dark:bg-[#3a3b3c] dark:text-[#e4e6eb] focus:ring-2 focus:ring-[#1877f2]"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* SECTION 3: Tiểu sử (Bio) */}
              <div className="pt-6">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-base font-bold text-gray-900 dark:text-[#e4e6eb]">
                    Tiểu sử
                  </h4>
                  <button
                    type="button"
                    onClick={() => setIsEditingModalBio(!isEditingModalBio)}
                    className="text-[#1877f2] dark:text-[#4599ff] hover:bg-blue-50 dark:hover:bg-[#1877f2]/10 px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer text-xs sm:text-sm"
                  >
                    {isEditingModalBio ? 'Đóng' : editBio ? 'Chỉnh sửa' : 'Thêm'}
                  </button>
                </div>

                {isEditingModalBio ? (
                  <div className="space-y-2">
                    <textarea
                      value={editBio}
                      onChange={(e) => setEditBio(e.target.value.slice(0, 101))}
                      rows={3}
                      placeholder="Mô tả về bản thân..."
                      className="w-full p-3 rounded-xl border border-gray-300 dark:border-[#393a3b] bg-gray-50 dark:bg-[#3a3b3c] dark:text-[#e4e6eb] focus:ring-2 focus:ring-[#1877f2] text-xs sm:text-sm text-center resize-none"
                    />
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-[#b0b3b8]">
                      <div className="flex items-center space-x-1">
                        <Globe className="w-3.5 h-3.5" />
                        <span>Công khai</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span>Còn {101 - editBio.length} ký tự</span>
                        <button
                          type="button"
                          onClick={() => setIsEditingModalBio(false)}
                          className="px-3 py-1 rounded-lg bg-gray-100 dark:bg-[#3a3b3c] hover:bg-gray-200 dark:hover:bg-[#4e4f50] font-semibold text-gray-700 dark:text-[#e4e6eb]"
                        >
                          Xong
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-2 px-4">
                    {editBio ? (
                      <p className="text-gray-800 dark:text-[#e4e6eb] font-medium italic">
                        "{editBio}"
                      </p>
                    ) : (
                      <p className="text-gray-400 dark:text-[#8a8d91] italic">
                        Mô tả ngắn gọn về bản thân bạn với mọi người...
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* SECTION 4: Chỉnh sửa phần giới thiệu (Customize Details) */}
              <div className="pt-6">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-base font-bold text-gray-900 dark:text-[#e4e6eb]">
                    Chỉnh sửa phần giới thiệu
                  </h4>
                  <button
                    type="button"
                    onClick={() => setIsEditingDetails(!isEditingDetails)}
                    className="text-[#1877f2] dark:text-[#4599ff] hover:bg-blue-50 dark:hover:bg-[#1877f2]/10 px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer text-xs sm:text-sm"
                  >
                    {isEditingDetails ? 'Thu gọn' : 'Chỉnh sửa'}
                  </button>
                </div>

                {isEditingDetails ? (
                  <div className="space-y-3 bg-gray-50 dark:bg-[#3a3b3c]/40 p-4 rounded-2xl border border-gray-200 dark:border-[#393a3b]">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="font-bold text-gray-700 dark:text-[#b0b3b8] block mb-1 flex items-center space-x-1.5">
                          <MapPin className="w-3.5 h-3.5 text-red-500" />
                          <span>Tỉnh/Thành phố hiện tại</span>
                        </label>
                        <input
                          type="text"
                          value={editLocation}
                          onChange={(e) => setEditLocation(e.target.value)}
                          placeholder="Ví dụ: TP. Hồ Chí Minh"
                          className="w-full p-2.5 rounded-xl border border-gray-300 dark:border-[#393a3b] bg-white dark:bg-[#242526] dark:text-[#e4e6eb] focus:ring-2 focus:ring-[#1877f2]"
                        />
                      </div>

                      <div>
                        <label className="font-bold text-gray-700 dark:text-[#b0b3b8] block mb-1 flex items-center space-x-1.5">
                          <GraduationCap className="w-3.5 h-3.5 text-blue-500" />
                          <span>Học vấn / Trường học</span>
                        </label>
                        <input
                          type="text"
                          value={editEducation}
                          onChange={(e) => setEditEducation(e.target.value)}
                          placeholder="Ví dụ: Đại học Công nghiệp TP.HCM"
                          className="w-full p-2.5 rounded-xl border border-gray-300 dark:border-[#393a3b] bg-white dark:bg-[#242526] dark:text-[#e4e6eb] focus:ring-2 focus:ring-[#1877f2]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="font-bold text-gray-700 dark:text-[#b0b3b8] block mb-1 flex items-center space-x-1.5">
                          <Briefcase className="w-3.5 h-3.5 text-amber-500" />
                          <span>Website / Liên kết cá nhân</span>
                        </label>
                        <input
                          type="text"
                          value={editWebsite}
                          onChange={(e) => setEditWebsite(e.target.value)}
                          placeholder="https://..."
                          className="w-full p-2.5 rounded-xl border border-gray-300 dark:border-[#393a3b] bg-white dark:bg-[#242526] dark:text-[#e4e6eb] focus:ring-2 focus:ring-[#1877f2]"
                        />
                      </div>

                      <div>
                        <label className="font-bold text-gray-700 dark:text-[#b0b3b8] block mb-1 flex items-center space-x-1.5">
                          <Users className="w-3.5 h-3.5 text-purple-500" />
                          <span>Giới tính</span>
                        </label>
                        <select
                          value={editGender}
                          onChange={(e) => setEditGender(e.target.value)}
                          className="w-full p-2.5 rounded-xl border border-gray-300 dark:border-[#393a3b] bg-white dark:bg-[#242526] dark:text-[#e4e6eb] focus:ring-2 focus:ring-[#1877f2]"
                        >
                          <option value="MALE">Nam</option>
                          <option value="FEMALE">Nữ</option>
                          <option value="OTHER">Khác</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="font-bold text-gray-700 dark:text-[#b0b3b8] block mb-1 flex items-center space-x-1.5">
                        <Calendar className="w-3.5 h-3.5 text-green-500" />
                        <span>Ngày sinh</span>
                      </label>
                      <input
                        type="date"
                        value={editDateOfBirth}
                        onChange={(e) => setEditDateOfBirth(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-gray-300 dark:border-[#393a3b] bg-white dark:bg-[#242526] dark:text-[#e4e6eb] focus:ring-2 focus:ring-[#1877f2]"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 py-1 text-gray-700 dark:text-[#e4e6eb]">
                    <div className="flex items-center space-x-3">
                      <GraduationCap className="w-5 h-5 text-gray-400 dark:text-[#8a8d91] shrink-0" />
                      <span>Học vấn: <b>{editEducation || (profile as any)?.education || 'Chưa thêm thông tin học vấn'}</b></span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <MapPin className="w-5 h-5 text-gray-400 dark:text-[#8a8d91] shrink-0" />
                      <span>Sống tại <b>{editLocation || 'Chưa cập nhật nơi ở'}</b></span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Briefcase className="w-5 h-5 text-gray-400 dark:text-[#8a8d91] shrink-0" />
                      <span>Liên kết: <b>{editWebsite || 'Chưa thêm liên kết cá nhân'}</b></span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Calendar className="w-5 h-5 text-gray-400 dark:text-[#8a8d91] shrink-0" />
                      <span>
                        Ngày sinh: <b>{editDateOfBirth ? new Date(editDateOfBirth).toLocaleDateString('vi-VN') : 'Chưa cập nhật'}</b>
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Users className="w-5 h-5 text-gray-400 dark:text-[#8a8d91] shrink-0" />
                      <span>
                        Giới tính: <b>{editGender === 'MALE' ? 'Nam' : editGender === 'FEMALE' ? 'Nữ' : 'Khác'}</b>
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* SECTION 5: Sở thích (Hobbies) */}
              <div className="pt-6">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-base font-bold text-gray-900 dark:text-[#e4e6eb]">
                    Sở thích
                  </h4>
                  <button
                    type="button"
                    onClick={() => setIsEditingHobbies(!isEditingHobbies)}
                    className="text-[#1877f2] dark:text-[#4599ff] hover:bg-blue-50 dark:hover:bg-[#1877f2]/10 px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer text-xs sm:text-sm"
                  >
                    {isEditingHobbies ? 'Xong' : 'Chỉnh sửa'}
                  </button>
                </div>

                {isEditingHobbies ? (
                  <div className="space-y-3 bg-gray-50 dark:bg-[#3a3b3c]/40 p-4 rounded-2xl border border-gray-200 dark:border-[#393a3b]">
                    <p className="text-xs text-gray-500 dark:text-[#b0b3b8]">
                      Chọn những sở thích phản ánh đúng con người bạn:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {AVAILABLE_HOBBIES.map((hobby) => {
                        const isSelected = selectedHobbies.includes(hobby);
                        return (
                          <button
                            key={hobby}
                            type="button"
                            onClick={() => toggleHobby(hobby)}
                            className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer ${
                              isSelected
                                ? 'bg-[#1877f2] text-white shadow-sm'
                                : 'bg-white dark:bg-[#242526] text-gray-700 dark:text-[#e4e6eb] border border-gray-200 dark:border-[#393a3b] hover:bg-gray-100 dark:hover:bg-[#3a3b3c]'
                            }`}
                          >
                            <span>{hobby}</span>
                            {isSelected && <Check className="w-3.5 h-3.5 ml-1" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2 py-1">
                    {selectedHobbies.length > 0 ? (
                      selectedHobbies.map((hobby, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1.5 rounded-full text-xs font-semibold bg-blue-50 text-[#1877f2] dark:bg-[#1877f2]/20 dark:text-[#4599ff] border border-blue-200 dark:border-blue-800"
                        >
                          {hobby}
                        </span>
                      ))
                    ) : (
                      <p className="text-xs text-gray-400 dark:text-[#8a8d91] italic">
                        Chưa chọn sở thích nào. Bấm "Chỉnh sửa" để thêm.
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* SECTION 6: Họ và tên (Name) */}
              <div className="pt-6">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-base font-bold text-gray-900 dark:text-[#e4e6eb]">
                    Họ và tên
                  </h4>
                  <button
                    type="button"
                    onClick={() => setIsEditingName(!isEditingName)}
                    className="text-[#1877f2] dark:text-[#4599ff] hover:bg-blue-50 dark:hover:bg-[#1877f2]/10 px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer text-xs sm:text-sm"
                  >
                    {isEditingName ? 'Đóng' : 'Chỉnh sửa'}
                  </button>
                </div>

                {isEditingName ? (
                  <div className="grid grid-cols-2 gap-3 bg-gray-50 dark:bg-[#3a3b3c]/40 p-4 rounded-2xl border border-gray-200 dark:border-[#393a3b]">
                    <div>
                      <label className="font-bold text-gray-700 dark:text-[#b0b3b8] block mb-1">
                        Họ & Tên đệm
                      </label>
                      <input
                        type="text"
                        value={editLastName}
                        onChange={(e) => setEditLastName(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-gray-300 dark:border-[#393a3b] bg-white dark:bg-[#242526] dark:text-[#e4e6eb] focus:ring-2 focus:ring-[#1877f2]"
                        placeholder="Nguyễn Văn"
                        required
                      />
                    </div>
                    <div>
                      <label className="font-bold text-gray-700 dark:text-[#b0b3b8] block mb-1">
                        Tên
                      </label>
                      <input
                        type="text"
                        value={editFirstName}
                        onChange={(e) => setEditFirstName(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-gray-300 dark:border-[#393a3b] bg-white dark:bg-[#242526] dark:text-[#e4e6eb] focus:ring-2 focus:ring-[#1877f2]"
                        placeholder="An"
                        required
                      />
                    </div>
                  </div>
                ) : (
                  <p className="font-bold text-sm text-gray-800 dark:text-[#e4e6eb] py-1">
                    {editLastName} {editFirstName}
                  </p>
                )}
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 px-6 border-t border-gray-200 dark:border-[#393a3b] bg-gray-50 dark:bg-[#242526] flex items-center justify-between shrink-0">
              <span className="text-xs text-gray-500 dark:text-[#b0b3b8] hidden sm:inline">
                Tất cả thông tin chỉnh sửa sẽ được lưu vào hồ sơ cá nhân của bạn.
              </span>
              <div className="flex items-center space-x-2.5 ml-auto">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-gray-200 dark:bg-[#3a3b3c] text-gray-700 dark:text-[#e4e6eb] hover:bg-gray-300 dark:hover:bg-[#4e4f50] transition cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveProfile()}
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-[#1877f2] text-white hover:bg-[#166fe5] shadow-md transition cursor-pointer disabled:opacity-50 flex items-center space-x-1.5"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Đang lưu...</span>
                    </>
                  ) : (
                    <span>Lưu thay đổi</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Media Gallery & S3 Storage Quota Modal */}
      <MediaGalleryModal
        userId={targetUserId || ''}
        isOpen={showMediaGalleryModal}
        onClose={() => setShowMediaGalleryModal(false)}
      />
    </div>
  );
};
