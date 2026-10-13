import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Users,
  Globe,
  Lock,
  Loader2,
  UserPlus,
  Check,
  Search,
  Sparkles,
  ShieldCheck,
  FileText,
  Eye,
  Monitor,
  MessageSquare,
  Compass,
} from 'lucide-react';
import { groupService } from '../../services/groupService';
import { userService } from '../../services/userService';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { UserAvatar } from '../common/UserAvatar';
import { GroupAvatar } from '../common/GroupAvatar';

interface CreateCommunityGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGroupCreated?: (group: any) => void;
}

export const CreateCommunityGroupModal: React.FC<CreateCommunityGroupModalProps> = ({
  isOpen,
  onClose,
  onGroupCreated,
}) => {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [privacy, setPrivacy] = useState<'PUBLIC' | 'PRIVATE'>('PUBLIC');
  const [postApprovalRequired, setPostApprovalRequired] = useState(false);
  const [rules, setRules] = useState('');
  const [friends, setFriends] = useState<any[]>([]);
  const [selectedFriendIds, setSelectedFriendIds] = useState<Set<string>>(new Set());
  const [friendSearch, setFriendSearch] = useState('');
  const [loadingFriends, setLoadingFriends] = useState(false);
  const [creating, setCreating] = useState(false);
  const [previewTab, setPreviewTab] = useState<'desktop' | 'mobile'>('desktop');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    if (isOpen) {
      setName('');
      setDescription('');
      setSelectedFriendIds(new Set());
      setPostApprovalRequired(false);
      setRules('');
      setFriendSearch('');
      setShowAdvanced(false);
      loadFriends();
    }
  }, [isOpen]);

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

  if (!isOpen) return null;

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

  const filteredFriends = friends.filter((f) => {
    const n = getFriendName(f);
    return n.toLowerCase().includes(friendSearch.toLowerCase());
  });

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
        privacy: privacy,
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

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={!creating ? onClose : undefined}
      />

      {/* Main Container - Facebook Style Dual Pane */}
      <div className="relative bg-white dark:bg-[#242526] w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] border border-gray-200/80 dark:border-[#393a3b] transition-all transform animate-in fade-in zoom-in-95 duration-200">
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-gray-100 dark:border-[#393a3b] flex items-center justify-between bg-white dark:bg-[#242526] shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-[#1877f2] shadow-xs">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-[#e4e6eb] leading-tight">
                Tạo nhóm cộng đồng mới
              </h3>
              <p className="text-xs text-gray-500 dark:text-[#b0b3b8]">
                Xây dựng và phát triển không gian thảo luận cho cộng đồng của bạn
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={creating}
            className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-[#3a3b3c] text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body - 2 Panes */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Pane: Controls Form */}
          <div className="w-full lg:w-1/2 p-5 sm:p-6 overflow-y-auto space-y-5 border-r border-gray-100 dark:border-[#393a3b] scrollbar-thin">
            {/* Creator Header row */}
            <div className="flex items-center space-x-3 p-3 rounded-2xl bg-gray-50 dark:bg-[#1f2021] border border-gray-200/70 dark:border-[#393a3b]">
              <UserAvatar
                src={user?.avatar}
                alt={user?.fullName || 'Admin'}
                size="md"
              />
              <div className="min-w-0 flex-1">
                <span className="text-xs font-bold text-gray-900 dark:text-[#e4e6eb] block leading-tight truncate">
                  {user?.fullName || 'Bạn'}
                </span>
                <span className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold flex items-center gap-1 mt-0.5">
                  <ShieldCheck className="w-3 h-3" /> Quản trị viên nhóm
                </span>
              </div>
            </div>

            {/* Input: Group Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 dark:text-[#b0b3b8] flex items-center justify-between">
                <span>
                  Tên nhóm <span className="text-red-500">*</span>
                </span>
                <span className="text-[10px] text-gray-400 font-normal">{name.length}/100</span>
              </label>
              <input
                type="text"
                value={name}
                maxLength={100}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nhập tên nhóm của bạn..."
                className="w-full px-4 py-2.5 bg-gray-50/80 dark:bg-[#1a1b1d] border border-gray-200 dark:border-[#393a3b] rounded-2xl text-xs sm:text-sm text-gray-900 dark:text-[#e4e6eb] placeholder-gray-400 focus:outline-none focus:border-[#1877f2] focus:ring-1 focus:ring-[#1877f2] transition"
                autoFocus
              />
            </div>

            {/* Input: Description */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 dark:text-[#b0b3b8]">
                Mô tả nhóm <span className="text-gray-400 font-normal">(tùy chọn)</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Giới thiệu về mục đích hoạt động và chủ đề của nhóm..."
                rows={2}
                className="w-full px-4 py-2.5 bg-gray-50/80 dark:bg-[#1a1b1d] border border-gray-200 dark:border-[#393a3b] rounded-2xl text-xs sm:text-sm text-gray-900 dark:text-[#e4e6eb] placeholder-gray-400 focus:outline-none focus:border-[#1877f2] focus:ring-1 focus:ring-[#1877f2] transition resize-none"
              />
            </div>

            {/* Privacy Selection Cards */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-700 dark:text-[#b0b3b8]">
                Chọn quyền riêng tư
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* Public Option */}
                <div
                  onClick={() => setPrivacy('PUBLIC')}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition select-none flex flex-col justify-between ${
                    privacy === 'PUBLIC'
                      ? 'border-[#1877f2] bg-blue-50/70 dark:bg-blue-900/20 shadow-xs'
                      : 'border-gray-200 dark:border-[#393a3b] hover:bg-gray-50 dark:hover:bg-[#3a3b3c]/40'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-[#1877f2] flex items-center justify-center">
                        <Globe className="w-4 h-4" />
                      </div>
                      <span className="font-bold text-xs text-gray-900 dark:text-[#e4e6eb]">
                        Công khai
                      </span>
                    </div>
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        privacy === 'PUBLIC'
                          ? 'border-[#1877f2] bg-[#1877f2]'
                          : 'border-gray-300 dark:border-gray-600'
                      }`}
                    >
                      {privacy === 'PUBLIC' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                  </div>
                  <p className="text-[11px] text-gray-500 dark:text-[#b0b3b8] leading-relaxed">
                    Mọi người đều có thể tìm thấy nhóm và xem bài viết.
                  </p>
                </div>

                {/* Private Option */}
                <div
                  onClick={() => setPrivacy('PRIVATE')}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition select-none flex flex-col justify-between ${
                    privacy === 'PRIVATE'
                      ? 'border-[#1877f2] bg-blue-50/70 dark:bg-blue-900/20 shadow-xs'
                      : 'border-gray-200 dark:border-[#393a3b] hover:bg-gray-50 dark:hover:bg-[#3a3b3c]/40'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-900/40 text-amber-500 flex items-center justify-center">
                        <Lock className="w-4 h-4" />
                      </div>
                      <span className="font-bold text-xs text-gray-900 dark:text-[#e4e6eb]">
                        Riêng tư
                      </span>
                    </div>
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        privacy === 'PRIVATE'
                          ? 'border-[#1877f2] bg-[#1877f2]'
                          : 'border-gray-300 dark:border-gray-600'
                      }`}
                    >
                      {privacy === 'PRIVATE' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                  </div>
                  <p className="text-[11px] text-gray-500 dark:text-[#b0b3b8] leading-relaxed">
                    Chỉ thành viên mới nhìn thấy nội dung và danh sách thành viên.
                  </p>
                </div>
              </div>
            </div>

            {/* Invite Friends */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-gray-700 dark:text-[#b0b3b8] flex items-center gap-1.5">
                  <UserPlus className="w-3.5 h-3.5 text-[#1877f2]" /> Mời bạn bè tham gia
                </label>
                {selectedFriendIds.size > 0 && (
                  <span className="text-[11px] font-bold text-[#1877f2] bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-900">
                    Đã chọn {selectedFriendIds.size} bạn bè
                  </span>
                )}
              </div>

              <div className="relative">
                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={friendSearch}
                  onChange={(e) => setFriendSearch(e.target.value)}
                  placeholder="Tìm kiếm bạn bè..."
                  className="w-full pl-9 pr-3 py-2 bg-gray-50/80 dark:bg-[#1a1b1d] border border-gray-200 dark:border-[#393a3b] rounded-xl text-xs text-gray-900 dark:text-[#e4e6eb] placeholder-gray-400 focus:outline-none focus:border-[#1877f2]"
                />
              </div>

              <div className="max-h-36 overflow-y-auto border border-gray-200/80 dark:border-[#393a3b] rounded-2xl p-1 divide-y divide-gray-100 dark:divide-gray-800 scrollbar-thin">
                {loadingFriends ? (
                  <div className="py-5 flex items-center justify-center text-xs text-gray-400 gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-[#1877f2]" /> Đang tải danh sách...
                  </div>
                ) : filteredFriends.length === 0 ? (
                  <div className="py-5 text-center text-xs text-gray-400 dark:text-[#b0b3b8]">
                    {friends.length === 0 ? 'Bạn chưa có bạn bè nào.' : 'Không tìm thấy bạn bè phù hợp.'}
                  </div>
                ) : (
                  filteredFriends.map((f) => {
                    const uid = String(f.userId || f.id);
                    const friendName = getFriendName(f);
                    const isSelected = selectedFriendIds.has(uid);
                    return (
                      <div
                        key={uid}
                        onClick={() => toggleFriend(uid)}
                        className={`flex items-center justify-between p-2 rounded-xl cursor-pointer transition ${
                          isSelected
                            ? 'bg-blue-50/80 dark:bg-blue-950/40'
                            : 'hover:bg-gray-100 dark:hover:bg-[#3a3b3c]'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <UserAvatar
                            src={f.avatarUrl || f.avatar}
                            alt={friendName}
                            size="sm"
                          />
                          <span className="text-xs font-semibold text-gray-900 dark:text-[#e4e6eb] truncate">
                            {friendName}
                          </span>
                        </div>
                        <div
                          className={`w-4 h-4 rounded-md border flex items-center justify-center transition ${
                            isSelected
                              ? 'bg-[#1877f2] border-[#1877f2]'
                              : 'border-gray-300 dark:border-gray-600'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 text-white" />}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Advanced Settings (Rules & Moderation) */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setShowAdvanced((prev) => !prev)}
                className="text-xs font-bold text-[#1877f2] hover:underline cursor-pointer flex items-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>{showAdvanced ? 'Thu gọn cài đặt nâng cao' : 'Thêm nội quy & cài đặt kiểm duyệt'}</span>
              </button>

              {showAdvanced && (
                <div className="mt-3 p-3.5 rounded-2xl border border-gray-200 dark:border-[#393a3b] bg-gray-50/50 dark:bg-[#1a1b1d]/50 space-y-3 animate-in fade-in duration-200">
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={postApprovalRequired}
                      onChange={(e) => setPostApprovalRequired(e.target.checked)}
                      className="mt-1 rounded text-[#1877f2] focus:ring-0"
                    />
                    <div>
                      <span className="text-xs font-bold text-gray-900 dark:text-[#e4e6eb] block">
                        Phê duyệt bài viết trước khi đăng
                      </span>
                      <span className="text-[11px] text-gray-500 dark:text-[#b0b3b8] block mt-0.5">
                        Mọi bài viết của thành viên cần được quản trị viên xét duyệt.
                      </span>
                    </div>
                  </label>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700 dark:text-[#b0b3b8] block">
                      Nội quy nhóm ban đầu
                    </label>
                    <textarea
                      value={rules}
                      onChange={(e) => setRules(e.target.value)}
                      rows={3}
                      placeholder="1. Tôn trọng các thành viên khác&#10;2. Không đăng bài quảng cáo, spam&#10;3. Nội dung văn minh, lịch sự..."
                      className="w-full px-3 py-2 bg-white dark:bg-[#242526] border border-gray-200 dark:border-[#393a3b] rounded-xl text-xs text-gray-900 dark:text-[#e4e6eb] focus:outline-none focus:border-[#1877f2] resize-none"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Pane: Live Desktop Preview (Facebook Style) */}
          <div className="hidden lg:flex lg:w-1/2 bg-gray-100/70 dark:bg-[#18191a] p-6 flex-col justify-between overflow-y-auto">
            <div className="space-y-4">
              {/* Preview Header indicator */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5 text-xs font-bold text-gray-500 dark:text-[#b0b3b8]">
                  <Monitor className="w-4 h-4 text-[#1877f2]" />
                  <span>Bản xem trước trực tiếp</span>
                </div>
                <span className="text-[10px] bg-blue-50 dark:bg-blue-900/40 text-[#1877f2] font-semibold px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-800">
                  Thời gian thực
                </span>
              </div>

              {/* Group Preview Mockup Card */}
              <div className="bg-white dark:bg-[#242526] rounded-2xl border border-gray-200 dark:border-[#393a3b] shadow-md overflow-hidden transition-all duration-300">
                {/* Mock Cover Banner */}
                <div className="h-32 w-full bg-gradient-to-r from-slate-200 via-gray-300 to-slate-200 dark:from-[#2a2b2d] dark:via-[#343538] dark:to-[#222325] relative flex items-center justify-center overflow-hidden">
                  <div className="opacity-40">
                    <GroupAvatar name={name || 'N'} size="2xl" shape="squircle" />
                  </div>
                </div>

                {/* Mock Header Info */}
                <div className="p-4 space-y-3 relative">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1 min-w-0 pr-2">
                      <h4 className="text-base font-extrabold text-gray-900 dark:text-[#e4e6eb] truncate leading-tight">
                        {name.trim() || 'Tên nhóm của bạn'}
                      </h4>
                      <div className="flex items-center gap-1.5 text-[11px] text-gray-500 dark:text-[#b0b3b8] font-medium">
                        {privacy === 'PUBLIC' ? (
                          <>
                            <Globe className="w-3 h-3 text-[#1877f2]" />
                            <span>Nhóm Công khai</span>
                          </>
                        ) : (
                          <>
                            <Lock className="w-3 h-3 text-amber-500" />
                            <span>Nhóm Riêng tư</span>
                          </>
                        )}
                        <span>·</span>
                        <span>{selectedFriendIds.size + 1} thành viên</span>
                      </div>
                    </div>

                    {/* Dynamic Realtime Group Avatar */}
                    <div className="-mt-8 ring-4 ring-white dark:ring-[#242526] rounded-xl shadow-md shrink-0">
                      <GroupAvatar
                        name={name || 'Nhóm'}
                        size="md"
                        shape="squircle"
                      />
                    </div>
                  </div>

                  {description.trim() && (
                    <p className="text-xs text-gray-600 dark:text-[#b0b3b8] line-clamp-2 leading-relaxed bg-gray-50 dark:bg-[#1a1b1d] p-2 rounded-xl">
                      {description.trim()}
                    </p>
                  )}

                  {/* Mock Tab Navigation Bar */}
                  <div className="flex items-center gap-2 border-t border-gray-100 dark:border-[#393a3b] pt-2 text-[11px] font-bold text-gray-500 dark:text-[#b0b3b8]">
                    <span className="text-[#1877f2] border-b-2 border-[#1877f2] pb-1">
                      Thảo luận
                    </span>
                    <span className="hover:text-gray-900 pb-1">Đáng chú ý</span>
                    <span className="hover:text-gray-900 pb-1">Thành viên</span>
                    <span className="hover:text-gray-900 pb-1">File phương tiện</span>
                  </div>

                  {/* Mock Post Creator */}
                  <div className="bg-gray-50 dark:bg-[#1f2021] p-2.5 rounded-xl border border-gray-200/70 dark:border-[#393a3b] flex items-center space-x-2">
                    <UserAvatar src={user?.avatar} size="xs" />
                    <div className="bg-white dark:bg-[#2b2c2e] rounded-full px-3 py-1 text-[11px] text-gray-400 flex-1 truncate">
                      Tạo bài viết trong nhóm...
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-gray-400 dark:text-gray-500 text-center pt-4">
              Giao diện trang nhóm sẽ được tạo tự động với các tùy chọn bạn đã thiết lập.
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-gray-100 dark:border-[#393a3b] bg-gray-50 dark:bg-[#1f2021] flex items-center justify-between shrink-0">
          <div className="text-xs text-gray-500 dark:text-[#b0b3b8] font-medium hidden sm:block">
            {selectedFriendIds.size > 0
              ? `Sẽ gửi lời mời đến ${selectedFriendIds.size} bạn bè sau khi tạo.`
              : 'Bạn có thể mời thêm thành viên sau khi tạo nhóm.'}
          </div>

          <div className="flex items-center space-x-2.5 ml-auto">
            <button
              onClick={onClose}
              disabled={creating}
              className="px-4 py-2 text-xs font-bold text-gray-700 dark:text-[#e4e6eb] hover:bg-gray-200/70 dark:hover:bg-[#3a3b3c] rounded-xl transition cursor-pointer"
            >
              Hủy
            </button>
            <button
              disabled={!name.trim() || creating}
              onClick={handleCreateGroup}
              className="px-6 py-2 bg-gradient-to-r from-[#1877f2] to-[#1264d0] hover:from-[#166fe5] hover:to-[#0f54b0] text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md cursor-pointer"
            >
              {creating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              <span>Tạo nhóm cộng đồng</span>
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default CreateCommunityGroupModal;
