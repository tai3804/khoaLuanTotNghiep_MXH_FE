import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { userService, postService } from '../../../services/api';
import { mediaService } from '../../../services/mediaService';
import { Post, UserProfile } from '../../../types';

interface UseProfileViewDataProps {
  userId?: string | null;
}

export const useProfileViewData = ({ userId }: UseProfileViewDataProps) => {
  const navigate = useNavigate();
  const { user: currentUser, refreshUserProfile, updateUser } = useAuth();
  const toast = useToast();

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
  const [showMediaGalleryModal, setShowMediaGalleryModal] = useState(false);
  const [friendRequested, setFriendRequested] = useState(false);
  const [selectedHobbies, setSelectedHobbies] = useState<string[]>([
    '🎧 Nghe nhạc',
    '✈️ Du lịch',
    '💻 Lập trình',
  ]);

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

  useEffect(() => {
    try {
      const uId = currentUser?.id || 'default';
      const saved = localStorage.getItem(`user_hobbies_${uId}`);
      if (saved) {
        setSelectedHobbies(JSON.parse(saved));
      }
    } catch {}
  }, [currentUser?.id]);

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

        const postOwnerId = userProf?.userId || userProf?.id || (isOwnProfileInitial ? currentUser?.id : userId);
        if (postOwnerId && postOwnerId !== 'me') {
          const userPosts = await postService.getUserPosts(postOwnerId);
          if (isMounted) setPosts(userPosts);
        } else if (currentUser?.id) {
          const userPosts = await postService.getUserPosts(currentUser.id);
          if (isMounted) setPosts(userPosts);
        }

        try {
          const mf = await userService.getFriends();
          if (isMounted) setMyFriends(Array.isArray(mf) ? mf : []);
        } catch {}

        if (!isOwnProfileInitial && postOwnerId && postOwnerId !== 'me') {
          try {
            const st = await userService.getConnectionStatus(postOwnerId);
            if (isMounted && st) setConnectionStatus(st);
          } catch {}
        }

        try {
          const fList = isOwnProfileInitial
            ? await userService.getFriends()
            : await userService.getUserFriends(postOwnerId);
          if (isMounted) setFriends(Array.isArray(fList) ? fList : []);
        } catch {}
      } catch (e) {
        console.error('Error loading profile:', e);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadProfileData();

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

  const handlePostDeleted = (postId: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  };

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

  const handleUnfriendProfile = async () => {
    const fullNameStr = profile
      ? `${profile.lastName || ''} ${profile.firstName || ''}`.trim() || profile.fullName || 'người dùng này'
      : 'người dùng này';
    if (!window.confirm(`Bạn có chắc muốn hủy kết bạn với ${fullNameStr}?`)) return;
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

  const fullName = profile
    ? `${profile.lastName || ''} ${profile.firstName || ''}`.trim() || profile.fullName || currentUser?.fullName || 'Người dùng'
    : currentUser?.fullName || 'Người dùng';

  const avatarUrl = profile?.avatarUrl || currentUser?.avatar || '';
  const coverUrl = profile?.coverUrl || '';

  const allPostPhotos: string[] = [];
  posts.forEach((p) => {
    if (p.mediaUrls && p.mediaUrls.length > 0) {
      p.mediaUrls.forEach((m) => allPostPhotos.push(m));
    }
  });

  return {
    navigate,
    currentUser,
    profile,
    setProfile,
    posts,
    friends,
    myFriends,
    connectionStatus,
    loading,
    activeTab,
    setActiveTab,
    isEditingBio,
    setIsEditingBio,
    bioInput,
    setBioInput,
    coverError,
    setCoverError,
    showEditModal,
    setShowEditModal,
    showMediaGalleryModal,
    setShowMediaGalleryModal,
    selectedHobbies,
    isOwnProfile,
    targetUserId,
    isFriend,
    hasPendingSent,
    hasPendingReceived,
    fullName,
    avatarUrl,
    coverUrl,
    allPostPhotos,
    handleAvatarFileSelect,
    handleCoverFileSelect,
    handleSaveBio,
    handlePostCreated,
    handlePostDeleted,
    handleAddFriendProfile,
    handleCancelSentRequest,
    handleAcceptFriendRequest,
    handleRejectFriendRequest,
    handleUnfriendProfile,
  };
};
