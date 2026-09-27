import React from 'react';
import { Image, Paperclip, Send } from 'lucide-react';
import { UserAvatar } from '../../common/UserAvatar';
import { CreatePostPrivacySelector } from './CreatePostPrivacySelector';
import { CreatePostMediaPreview } from './CreatePostMediaPreview';

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
}) => {
  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-3.5">
      {/* User Info & Privacy Selector */}
      <div className="flex items-center space-x-3">
        <UserAvatar src={user?.avatar} alt={user?.fullName || user?.username} size="lg" />
        <div>
          <h4 className="font-bold text-sm text-gray-900 dark:text-[#e4e6eb]">
            {user?.fullName || user?.username || 'Người dùng'}
          </h4>
          <div className="flex items-center space-x-1.5 mt-0.5">
            <CreatePostPrivacySelector privacy={privacy} setPrivacy={setPrivacy} />
          </div>
        </div>
      </div>

      {/* Content Textarea */}
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={`${t('whatsOnYourMind') || 'Bạn đang nghĩ gì thế'}, ${
          user?.fullName || user?.username || ''
        }?`}
        rows={4}
        className="w-full bg-transparent text-gray-900 dark:text-[#e4e6eb] text-sm focus:outline-none resize-none placeholder-gray-400 dark:placeholder-[#b0b3b8] leading-relaxed"
        autoFocus
      />

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
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting || (!content.trim() && !imageUrl.trim() && !filePreview)}
        className="w-full bg-[#1877f2] hover:bg-[#166fe5] active:bg-[#1464d2] text-white font-semibold text-sm py-2.5 rounded-lg disabled:opacity-50 disabled:bg-[#1877f2] dark:disabled:bg-[#3a3b3c] dark:disabled:text-[#737578] transition flex items-center justify-center space-x-2 cursor-pointer shadow-sm"
      >
        {isSubmitting ? (
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <>
            <Send className="w-4 h-4" />
            <span>Đăng bài viết</span>
          </>
        )}
      </button>
    </form>
  );
};
