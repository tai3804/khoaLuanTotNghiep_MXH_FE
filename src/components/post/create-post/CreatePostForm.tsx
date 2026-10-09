import React, { useState, useRef } from 'react';
import { Image, Paperclip, Send, Sparkles, Tag, Users, X, CalendarClock } from 'lucide-react';
import { UserAvatar } from '../../common/UserAvatar';
import { CreatePostPrivacySelector } from './CreatePostPrivacySelector';
import { CreatePostMediaPreview } from './CreatePostMediaPreview';
import { CreatePostAiAssistant } from './CreatePostAiAssistant';
import { TagFriendsModal, TaggedFriend } from './tag-friends';
import { useMentionSuggestions, MentionDropdown } from '../../common/mention-autocomplete';
import { PostSchedulePicker } from '../../profile/professional/scheduler/PostSchedulePicker';

interface CreatePostFormProps {
  user: any;
  privacy: 'public' | 'friends' | 'private';
  setPrivacy: (privacy: 'public' | 'friends' | 'private') => void;
  content: string;
  setContent: (content: string) => void;
  showImageInput: boolean;
  setShowImageInput: (show: boolean) => void;
  imageUrl: string;
  setImageUrl: (url: string) => void;
  filePreview: string | null;
  selectedFileType?: 'image' | 'video' | null;
  onClearFile: () => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isSubmitting: boolean;
  handleSubmit: (e: React.FormEvent) => void;
  t: (key: string) => string;
  taggedFriends?: TaggedFriend[];
  setTaggedFriends?: React.Dispatch<React.SetStateAction<TaggedFriend[]>>;
  showTagFriendsModal?: boolean;
  setShowTagFriendsModal?: (show: boolean) => void;
  scheduledPublishAt?: string;
  setScheduledPublishAt?: (val?: string) => void;
}

export const CreatePostForm: React.FC<CreatePostFormProps> = ({
  user,
  privacy,
  setPrivacy,
  content,
  setContent,
  showImageInput,
  setShowImageInput,
  imageUrl,
  setImageUrl,
  filePreview,
  selectedFileType,
  onClearFile,
  fileInputRef,
  handleFileChange,
  isSubmitting,
  handleSubmit,
  t,
  taggedFriends = [],
  setTaggedFriends,
  showTagFriendsModal = false,
  setShowTagFriendsModal,
  scheduledPublishAt,
  setScheduledPublishAt,
}) => {
  const [showAiAssistant, setShowAiAssistant] = useState(false);
  const [showSchedulePicker, setShowSchedulePicker] = useState(false);
  const [cursorPos, setCursorPos] = useState<number | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const {
    isOpen: isMentionOpen,
    loading: isMentionLoading,
    candidates: mentionCandidates,
    selectedIndex: mentionSelectedIndex,
    selectCandidate: handleSelectMention,
    handleKeyDown: handleMentionKeyDown,
  } = useMentionSuggestions({
    text: content,
    cursorPosition: cursorPos,
    onMentionSelected: (candidate, markdown) => {
      if (cursorPos === null) return;
      const textBefore = content.slice(0, cursorPos);
      const textAfter = content.slice(cursorPos);
      const atIndex = textBefore.lastIndexOf('@');
      const newContent = textBefore.slice(0, atIndex) + markdown + textAfter;
      setContent(newContent);

      if (setTaggedFriends) {
        setTaggedFriends((prev) => {
          const id = candidate.id || candidate.userId;
          if (prev.some((f) => (f.id || f.userId) === id)) return prev;
          return [
            ...prev,
            {
              id,
              userId: id,
              name: candidate.name || candidate.fullName,
              avatar: candidate.avatar || candidate.avatarUrl,
            },
          ];
        });
      }
    },
  });

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-3.5">
      {/* User Info & Privacy Selector */}
      <div className="flex items-center space-x-3">
        <UserAvatar src={user?.avatar} alt={user?.fullName || user?.username} size="lg" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center flex-wrap gap-1">
            <h4 className="font-bold text-sm text-gray-900 dark:text-[#e4e6eb]">
              {user?.fullName || user?.username || 'Người dùng'}
            </h4>
            {taggedFriends.length > 0 && (
              <span className="text-xs text-gray-500 dark:text-[#b0b3b8] flex items-center gap-1 flex-wrap">
                <span>— cùng với</span>
                <span className="font-semibold text-gray-800 dark:text-[#e4e6eb]">
                  {taggedFriends[0].name}
                </span>
                {taggedFriends.length > 1 && (
                  <span>và {taggedFriends.length - 1} người khác</span>
                )}
                {setShowTagFriendsModal && (
                  <button
                    type="button"
                    onClick={() => setShowTagFriendsModal(true)}
                    className="text-[#1877f2] hover:underline font-semibold ml-0.5 text-[11px] cursor-pointer"
                  >
                    (Chỉnh sửa)
                  </button>
                )}
              </span>
            )}
          </div>
          <div className="flex items-center space-x-1.5 mt-0.5">
            <CreatePostPrivacySelector privacy={privacy} setPrivacy={setPrivacy} />
          </div>
        </div>
      </div>

      {/* Content Textarea with Mention Autocomplete */}
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => {
            setContent(e.target.value);
            setCursorPos(e.target.selectionStart);
          }}
          onKeyUp={(e) => setCursorPos(e.currentTarget.selectionStart)}
          onClick={(e) => setCursorPos(e.currentTarget.selectionStart)}
          onKeyDown={(e) => {
            if (handleMentionKeyDown(e)) return;
          }}
          placeholder={`${t('whatsOnYourMind') || 'Bạn đang nghĩ gì thế'}, ${
            user?.fullName || user?.username || ''
          }? (Gõ @ để gắn thẻ bạn bè, # để thêm hashtag)`}
          rows={4}
          className="w-full bg-transparent text-gray-900 dark:text-[#e4e6eb] text-sm focus:outline-none resize-none placeholder-gray-400 dark:placeholder-[#b0b3b8] leading-relaxed"
          autoFocus
        />

        {/* Inline Mention Dropdown */}
        <MentionDropdown
          isOpen={isMentionOpen}
          loading={isMentionLoading}
          candidates={mentionCandidates}
          selectedIndex={mentionSelectedIndex}
          onSelect={handleSelectMention}
          className="top-full left-0 mt-1"
        />
      </div>

      {/* AI Assistant Drawer */}
      {showAiAssistant && (
        <CreatePostAiAssistant
          currentContent={content}
          onApplyContent={(newText) => setContent(newText)}
          onClose={() => setShowAiAssistant(false)}
        />
      )}

      {/* Media Preview (Local Image/Video or Remote Link) */}
      <CreatePostMediaPreview
        showImageInput={showImageInput}
        setShowImageInput={setShowImageInput}
        imageUrl={imageUrl}
        setImageUrl={setImageUrl}
        filePreview={filePreview}
        selectedFileType={selectedFileType}
        onClearFile={onClearFile}
      />

      {/* Hidden File Input for Images & Videos */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/mp4,video/webm,video/ogg,video/quicktime,video/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Additional Attachment Actions */}
      <div className="border border-gray-200 dark:border-[#393a3b] rounded-xl p-3 flex items-center justify-between bg-white dark:bg-[#242526] shadow-sm">
        <span className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-[#e4e6eb]">
          Thêm vào bài viết của bạn
        </span>
        <div className="flex items-center space-x-1">
          <button
            type="button"
            onClick={() => setShowAiAssistant(!showAiAssistant)}
            className={`flex items-center space-x-1.5 py-1.5 px-2.5 rounded-lg transition cursor-pointer ${
              showAiAssistant
                ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300'
                : 'hover:bg-purple-50 dark:hover:bg-purple-950/30 text-purple-600 dark:text-purple-400'
            }`}
            title="Trợ lý AI viết bài & kiểm tra chuẩn mực"
          >
            <Sparkles className="w-5 h-5" />
            <span className="text-xs font-semibold">Trợ lý AI</span>
          </button>
          <button
            type="button"
            onClick={() => setShowTagFriendsModal?.(true)}
            className="flex items-center space-x-1.5 py-1.5 px-2.5 hover:bg-blue-50 dark:hover:bg-blue-950/30 text-[#1877f2] rounded-lg transition cursor-pointer"
            title="Gắn thẻ bạn bè"
          >
            <Tag className="w-5 h-5 text-[#1877f2]" />
            <span className="text-xs font-semibold">Gắn thẻ</span>
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center space-x-1.5 py-1.5 px-2.5 hover:bg-green-50 dark:hover:bg-green-950/30 text-[#45bd62] rounded-lg transition cursor-pointer"
            title="Tải ảnh hoặc video từ máy"
          >
            <Image className="w-5 h-5" />
            <span className="text-xs font-semibold">Ảnh/Video</span>
          </button>
          <button
            type="button"
            onClick={() => setShowImageInput(!showImageInput)}
            className="flex items-center space-x-1.5 py-1.5 px-2.5 hover:bg-blue-50 dark:hover:bg-blue-950/30 text-[#1877f2] rounded-lg transition cursor-pointer"
            title="Chèn đường dẫn ảnh/video trực tiếp"
          >
            <Paperclip className="w-4 h-4" />
            <span className="text-xs font-semibold">Chèn link</span>
          </button>
          <button
            type="button"
            onClick={() => setShowSchedulePicker(!showSchedulePicker)}
            className={`flex items-center space-x-1.5 py-1.5 px-2.5 rounded-lg transition cursor-pointer ${
              scheduledPublishAt || showSchedulePicker
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300'
                : 'hover:bg-emerald-50 dark:hover:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400'
            }`}
            title="Hẹn giờ lên lịch đăng bài viết"
          >
            <CalendarClock className="w-4 h-4" />
            <span className="text-xs font-semibold">Lên lịch</span>
          </button>
        </div>
      </div>

      {/* Tag Friends Modal */}
      {showTagFriendsModal && setShowTagFriendsModal && setTaggedFriends && (
        <TagFriendsModal
          isOpen={showTagFriendsModal}
          onClose={() => setShowTagFriendsModal(false)}
          taggedFriends={taggedFriends}
          onSaveTags={setTaggedFriends}
        />
      )}

      {/* Schedule Picker Popover */}
      {showSchedulePicker && setScheduledPublishAt && (
        <div className="relative">
          <PostSchedulePicker
            scheduledAt={scheduledPublishAt}
            onChange={(val) => {
              setScheduledPublishAt(val);
              setShowSchedulePicker(false);
            }}
            onClose={() => setShowSchedulePicker(false)}
          />
        </div>
      )}

      {/* Scheduled Time Indicator */}
      {scheduledPublishAt && (
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/20 text-xs text-emerald-700 dark:text-emerald-300 font-semibold animate-in fade-in">
          <div className="flex items-center gap-2">
            <CalendarClock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>
              Hẹn giờ đăng: {new Date(scheduledPublishAt).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' })}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setScheduledPublishAt?.(undefined)}
            className="text-xs text-red-500 hover:underline cursor-pointer"
          >
            Hủy
          </button>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting || (!content.trim() && !imageUrl.trim() && !filePreview)}
        className={`w-full ${
          scheduledPublishAt
            ? 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800'
            : 'bg-[#1877f2] hover:bg-[#166fe5] active:bg-[#1464d2]'
        } text-white font-semibold text-sm py-2.5 rounded-lg disabled:opacity-50 disabled:bg-[#1877f2] dark:disabled:bg-[#3a3b3c] dark:disabled:text-[#737578] transition flex items-center justify-center space-x-2 cursor-pointer shadow-sm`}
      >
        {isSubmitting ? (
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <>
            {scheduledPublishAt ? <CalendarClock className="w-4 h-4" /> : <Send className="w-4 h-4" />}
            <span>{scheduledPublishAt ? 'Lên lịch xuất bản bài viết' : 'Đăng bài viết'}</span>
          </>
        )}
      </button>
    </form>
  );
};
