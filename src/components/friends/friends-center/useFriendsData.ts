import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useLanguage } from '../../../context/LanguageContext';
import { useToast } from '../../../context/ToastContext';
import { userService } from '../../../services/api';

export const useFriendsData = () => {
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

  const visibleSuggestions = suggestions.filter((s) => !removedSuggestions.has(String(s.id || s.userId)));

  return {
    currentUser,
    isAuthenticated,
    openLoginModal,
    t,
    activeTab,
    setActiveTab,
    friends,
    suggestions,
    visibleSuggestions,
    requests,
    followers,
    following,
    sentRequests,
    loading,
    searchTerm,
    setSearchTerm,
    actionMessage,
    targetUserId,
    setTargetUserId,
    sendingRequest,
    loadAllData,
    handleAcceptRequest,
    handleRejectRequest,
    handleAddFriend,
    handleRemoveSuggestion,
    handleUnfriend,
    handleSendRequestById,
  };
};
