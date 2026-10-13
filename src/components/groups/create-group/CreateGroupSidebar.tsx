import React from 'react';
import {
  X,
  Globe,
  Lock,
  Loader2,
  UserPlus,
  Check,
  Search,
  Sparkles,
  ShieldCheck,
  FileText,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { UserAvatar } from '../../common/UserAvatar';

interface CreateGroupSidebarProps {
  user: any;
  name: string;
  setName: (name: string) => void;
  description: string;
  setDescription: (desc: string) => void;
  privacy: 'PUBLIC' | 'PRIVATE';
  setPrivacy: (p: 'PUBLIC' | 'PRIVATE') => void;
  postApprovalRequired: boolean;
  setPostApprovalRequired: (v: boolean) => void;
  rules: string;
  setRules: (r: string) => void;
  selectedFriendIds: Set<string>;
  toggleFriend: (id: string) => void;
  friendSearch: string;
  setFriendSearch: (s: string) => void;
  filteredFriends: any[];
  friendsCount: number;
  loadingFriends: boolean;
  creating: boolean;
  showAdvanced: boolean;
  setShowAdvanced: React.Dispatch<React.SetStateAction<boolean>>;
  getFriendName: (friend: any) => string;
  onClose: () => void;
  onSubmit: () => void;
}

export const CreateGroupSidebar: React.FC<CreateGroupSidebarProps> = ({
  user,
  name,
  setName,
  description,
  setDescription,
  privacy,
  setPrivacy,
  postApprovalRequired,
  setPostApprovalRequired,
  rules,
  setRules,
  selectedFriendIds,
  toggleFriend,
  friendSearch,
  setFriendSearch,
  filteredFriends,
  friendsCount,
  loadingFriends,
  creating,
  showAdvanced,
  setShowAdvanced,
  getFriendName,
  onClose,
  onSubmit,
}) => {
  return (
    <aside className="w-full md:w-[380px] lg:w-[410px] xl:w-[430px] bg-white dark:bg-[#242526] h-full flex flex-col border-r border-gray-200 dark:border-[#393a3b] shadow-xl z-20 shrink-0">
      {/* Top Header / Breadcrumb */}
      <div className="px-4 sm:px-5 py-3.5 border-b border-gray-100 dark:border-[#393a3b] flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-3">
          <button
            onClick={onClose}
            disabled={creating}
            className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-[#3a3b3c] dark:hover:bg-[#4e4f50] flex items-center justify-center text-gray-600 dark:text-[#e4e6eb] transition cursor-pointer"
            title="Đóng giao diện tạo nhóm"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center text-xs font-semibold text-gray-500 dark:text-[#b0b3b8] space-x-1">
            <span>Nhóm</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-gray-900 dark:text-gray-100 font-bold">Tạo nhóm</span>
          </div>
        </div>
      </div>

      {/* Scrollable Form Body */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5 scrollbar-thin">
        {/* Title */}
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-[#e4e6eb] tracking-tight">
            Tạo nhóm
          </h1>
          <p className="text-xs text-gray-500 dark:text-[#b0b3b8] mt-0.5">
            Xây dựng không gian giao lưu và kết nối cho cộng đồng của bạn
          </p>
        </div>

        {/* Admin Card */}
        <div className="flex items-center space-x-3 p-3 rounded-2xl bg-gray-50 dark:bg-[#1c1d1e] border border-gray-200/80 dark:border-[#393a3b]">
          <UserAvatar
            src={user?.avatar}
            alt={user?.fullName || 'Admin'}
            size="md"
          />
          <div className="min-w-0 flex-1">
            <span className="text-sm font-bold text-gray-900 dark:text-[#e4e6eb] block leading-tight truncate">
              {user?.fullName || 'Bạn'}
            </span>
            <span className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold flex items-center gap-1 mt-0.5">
              <ShieldCheck className="w-3.5 h-3.5" /> Quản trị viên
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
            placeholder="Đặt tên cho nhóm của bạn..."
            className="w-full px-4 py-2.5 bg-gray-50/80 dark:bg-[#1a1b1d] border border-gray-200 dark:border-[#393a3b] rounded-2xl text-xs sm:text-sm text-gray-900 dark:text-[#e4e6eb] placeholder-gray-400 focus:outline-none focus:border-[#1877f2] focus:ring-2 focus:ring-blue-500/20 transition shadow-inner"
            autoFocus
          />
        </div>

        {/* Privacy Selector Cards */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-700 dark:text-[#b0b3b8]">
            Chọn quyền riêng tư <span className="text-red-500">*</span>
          </label>
          <div className="space-y-2">
            {/* Public Option */}
            <div
              onClick={() => setPrivacy('PUBLIC')}
              className={`p-3.5 rounded-2xl border cursor-pointer transition select-none flex items-start gap-3 ${
                privacy === 'PUBLIC'
                  ? 'border-[#1877f2] bg-blue-50/70 dark:bg-blue-900/20 shadow-xs'
                  : 'border-gray-200 dark:border-[#393a3b] hover:bg-gray-50 dark:hover:bg-[#3a3b3c]/40'
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/40 text-[#1877f2] flex items-center justify-center shrink-0 mt-0.5">
                <Globe className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs sm:text-sm text-gray-900 dark:text-[#e4e6eb]">
                    Công khai
                  </span>
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
                <p className="text-[11px] text-gray-500 dark:text-[#b0b3b8] leading-relaxed mt-0.5">
                  Bất kỳ ai cũng có thể nhìn thấy mọi người trong nhóm và những gì họ đăng.
                </p>
              </div>
            </div>

            {/* Private Option */}
            <div
              onClick={() => setPrivacy('PRIVATE')}
              className={`p-3.5 rounded-2xl border cursor-pointer transition select-none flex items-start gap-3 ${
                privacy === 'PRIVATE'
                  ? 'border-[#1877f2] bg-blue-50/70 dark:bg-blue-900/20 shadow-xs'
                  : 'border-gray-200 dark:border-[#393a3b] hover:bg-gray-50 dark:hover:bg-[#3a3b3c]/40'
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-500 flex items-center justify-center shrink-0 mt-0.5">
                <Lock className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs sm:text-sm text-gray-900 dark:text-[#e4e6eb]">
                    Riêng tư
                  </span>
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
                <p className="text-[11px] text-gray-500 dark:text-[#b0b3b8] leading-relaxed mt-0.5">
                  Chỉ thành viên mới nhìn thấy những người trong nhóm và những gì họ đăng.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Input: Description */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-gray-700 dark:text-[#b0b3b8]">
            Mô tả nhóm <span className="text-gray-400 font-normal">(không bắt buộc)</span>
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Giới thiệu về nội dung thảo luận và mục đích của nhóm..."
            rows={2}
            className="w-full px-4 py-2.5 bg-gray-50/80 dark:bg-[#1a1b1d] border border-gray-200 dark:border-[#393a3b] rounded-2xl text-xs sm:text-sm text-gray-900 dark:text-[#e4e6eb] placeholder-gray-400 focus:outline-none focus:border-[#1877f2] focus:ring-2 focus:ring-blue-500/20 transition resize-none shadow-inner"
          />
        </div>

        {/* Invite Friends */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-gray-700 dark:text-[#b0b3b8] flex items-center gap-1.5">
              <UserPlus className="w-3.5 h-3.5 text-[#1877f2]" /> Mời bạn bè
              <span className="text-gray-400 font-normal">(không bắt buộc)</span>
            </label>
            {selectedFriendIds.size > 0 && (
              <span className="text-[11px] font-bold text-[#1877f2] bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-900">
                Đã chọn {selectedFriendIds.size}
              </span>
            )}
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={friendSearch}
              onChange={(e) => setFriendSearch(e.target.value)}
              placeholder="Tìm kiếm bạn bè theo tên..."
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
                {friendsCount === 0 ? 'Bạn chưa có bạn bè nào.' : 'Không tìm thấy bạn bè phù hợp.'}
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

        {/* Collapsible Advanced Settings (Rules & Moderation) */}
        <div className="pt-1">
          <button
            type="button"
            onClick={() => setShowAdvanced((prev) => !prev)}
            className="w-full flex items-center justify-between text-xs font-bold text-gray-700 dark:text-[#b0b3b8] hover:text-[#1877f2] dark:hover:text-[#1877f2] cursor-pointer py-1.5 transition"
          >
            <div className="flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-[#1877f2]" />
              <span>Thiết lập kiểm duyệt & nội quy</span>
            </div>
            {showAdvanced ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>

          {showAdvanced && (
            <div className="mt-2.5 p-3.5 rounded-2xl border border-gray-200 dark:border-[#393a3b] bg-gray-50/60 dark:bg-[#1a1b1d]/60 space-y-3 animate-in fade-in duration-200">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={postApprovalRequired}
                  onChange={(e) => setPostApprovalRequired(e.target.checked)}
                  className="mt-1 rounded text-[#1877f2] focus:ring-0"
                />
                <div>
                  <span className="text-xs font-bold text-gray-900 dark:text-[#e4e6eb] block">
                    Phê duyệt bài viết
                  </span>
                  <span className="text-[11px] text-gray-500 dark:text-[#b0b3b8] block mt-0.5">
                    Bài viết của thành viên cần được quản trị viên duyệt trước khi đăng lên nhóm.
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
                  placeholder="1. Tôn trọng mọi thành viên&#10;2. Không đăng bài quảng cáo, spam&#10;3. Giữ gìn văn hóa thảo luận lịch sự..."
                  className="w-full px-3 py-2 bg-white dark:bg-[#242526] border border-gray-200 dark:border-[#393a3b] rounded-xl text-xs text-gray-900 dark:text-[#e4e6eb] focus:outline-none focus:border-[#1877f2] resize-none"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sticky Bottom Action Bar */}
      <div className="p-4 bg-white dark:bg-[#242526] border-t border-gray-200 dark:border-[#393a3b] shrink-0">
        <button
          disabled={!name.trim() || creating}
          onClick={onSubmit}
          className="w-full py-2.5 bg-[#1877f2] hover:bg-[#166fe5] text-white text-sm font-bold rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-45 disabled:cursor-not-allowed shadow-md cursor-pointer"
        >
          {creating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Đang tạo nhóm...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Tạo nhóm</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
};
