import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { groupService, GroupResponse } from '../../../services/groupService';
import { userService } from '../../../services/userService';
import { mediaService } from '../../../services/mediaService';
import { useToast } from '../../../context/ToastContext';
import { useAuth } from '../../../context/AuthContext';

export interface UseCreateGroupDataProps {
  isOpen: boolean;
  onClose: () => void;
  onGroupCreated?: (group: GroupResponse) => void;
}

export const useCreateGroupData = ({ isOpen, onClose, onGroupCreated }: UseCreateGroupDataProps) => {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [uploadingCover, setUploadingCover] = useState(false);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const [privacy, setPrivacy] = useState<'PUBLIC' | 'PRIVATE'>('PUBLIC');
  const [postApprovalRequired, setPostApprovalRequired] = useState(false);
  const [rules, setRules] = useState('');
  const [friends, setFriends] = useState<any[]>([]);
  const [selectedFriendIds, setSelectedFriendIds] = useState<Set<string>>(new Set());
  const [friendSearch, setFriendSearch] = useState('');
  const [loadingFriends, setLoadingFriends] = useState(false);
  const [creating, setCreating] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    if (isOpen) {
      setName('');
      setDescription('');
      setCoverUrl('');
      setSelectedFriendIds(new Set());
      setPostApprovalRequired(false);
      setRules('');
      setFriendSearch('');
      setShowAdvanced(false);
      loadFriends();
    }
  }, [isOpen]);

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingCover(true);
      const media = await mediaService.uploadMedia(file, 'groups');
      if (media?.fileUrl) {
        setCoverUrl(media.fileUrl);
        toast.showSuccess('Đã tải ảnh bìa lên thành công!');
      }
    } catch (err: any) {
      toast.showError(err?.message || 'Không thể tải ảnh bìa lên.');
    } finally {
      setUploadingCover(false);
      if (coverInputRef.current) coverInputRef.current.value = '';
    }
  };

  const loadFriends = async () => {
    setLoadingFriends(true);
    try {
      const data = await userService.getFriends();
      if (Array.isArray(data)) {
        setFriends(data);
      }
    } catch (err) {
      console.error('Failed to load friends', err);
    } finally {
      setLoadingFriends(false);
    }
  };

  const toggleFriend = (id: string) => {
    setSelectedFriendIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const getFriendName = (friend: any): string => {
    if (!friend) return 'Bạn bè';
    if (typeof friend === 'string') return friend;
    if (friend.name && typeof friend.name === 'string' && friend.name.trim()) return friend.name.trim();
    if (friend.fullName && typeof friend.fullName === 'string' && friend.fullName.trim()) return friend.fullName.trim();
    if (friend.displayName && typeof friend.displayName === 'string' && friend.displayName.trim()) return friend.displayName.trim();
    const parts = [friend.lastName, friend.middleName, friend.firstName]
      .filter((p) => typeof p === 'string' && p.trim())
      .join(' ')
      .trim();
    if (parts) return parts;
    if (friend.username && typeof friend.username === 'string' && friend.username.trim()) return friend.username.trim();
    if (friend.email && typeof friend.email === 'string' && friend.email.trim()) return friend.email.trim();
    return 'Thành viên';
  };

  const filteredFriends = useMemo(() => {
    if (!friendSearch.trim()) return friends;
    const term = friendSearch.toLowerCase();
    return friends.filter((f) => {
      const n = getFriendName(f).toLowerCase();
      return n.includes(term);
    });
  }, [friends, friendSearch]);

  const handleCreateGroup = async () => {
    if (!name.trim()) {
      toast.showError('Vui lòng nhập tên nhóm cộng đồng.');
      return;
    }
    try {
      setCreating(true);
      const group = await groupService.createGroup({
        name: name.trim(),
        description: description.trim(),
        privacy,
        coverUrl: coverUrl.trim() || undefined,
        initialMemberIds: Array.from(selectedFriendIds),
        postApprovalRequired,
        rules: rules.trim(),
      });
      toast.showSuccess(`Đã tạo nhóm "${group.name}" thành công!`);
      onClose();
      if (onGroupCreated) {
        onGroupCreated(group);
      }
      navigate(`/groups/${group.id}`);
    } catch (error: any) {
      console.error('Failed to create group', error);
      toast.showError('Không thể tạo nhóm, vui lòng thử lại sau.');
    } finally {
      setCreating(false);
    }
  };

  return {
    user,
    name,
    setName,
    description,
    setDescription,
    coverUrl,
    setCoverUrl,
    uploadingCover,
    coverInputRef,
    handleCoverUpload,
    privacy,
    setPrivacy,
    postApprovalRequired,
    setPostApprovalRequired,
    rules,
    setRules,
    friends,
    selectedFriendIds,
    toggleFriend,
    friendSearch,
    setFriendSearch,
    filteredFriends,
    loadingFriends,
    creating,
    previewDevice,
    setPreviewDevice,
    showAdvanced,
    setShowAdvanced,
    getFriendName,
    handleCreateGroup,
  };
};
