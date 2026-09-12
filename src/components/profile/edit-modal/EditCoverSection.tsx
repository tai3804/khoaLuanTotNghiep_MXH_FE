import React from 'react';
import { Camera, Loader2, Link as LinkIcon } from 'lucide-react';

interface EditCoverSectionProps {
  coverUrl: string;
  coverError: boolean;
  setCoverError: (val: boolean) => void;
  uploadingCover: boolean;
  onCoverUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  showUrlInputs: boolean;
  setShowUrlInputs: (val: boolean) => void;
  avatarUrl: string;
  setAvatarUrl: (val: string) => void;
  setCoverUrl: (val: string) => void;
}

export const EditCoverSection: React.FC<EditCoverSectionProps> = ({
  coverUrl,
  coverError,
  setCoverError,
  uploadingCover,
  onCoverUpload,
  showUrlInputs,
  setShowUrlInputs,
  avatarUrl,
  setAvatarUrl,
  setCoverUrl,
}) => {
  return (
    <div className="space-y-3 pt-4 border-t border-gray-100 dark:border-[#393a3b]">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-extrabold text-gray-900 dark:text-[#e4e6eb]">
          Ảnh bìa
        </h4>
        <label
          htmlFor="edit-modal-cover-file-input"
          className="text-xs font-bold text-[#1877f2] hover:underline cursor-pointer flex items-center space-x-1"
        >
          {uploadingCover ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <span>Chỉnh sửa</span>
          )}
        </label>
      </div>

      {/* Interactive Cover Container (Blank when no cover photo exists or error) */}
      <div className="relative w-full h-36 sm:h-44 rounded-2xl overflow-hidden bg-gray-200 dark:bg-[#3a3b3c] group shadow-inner">
        {coverUrl && !coverError ? (
          <img
            src={coverUrl}
            alt=""
            className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
            onError={() => setCoverError(true)}
          />
        ) : null}

        <input
          id="edit-modal-cover-file-input"
          type="file"
          onChange={onCoverUpload}
          accept="image/*"
          className="hidden"
        />

        <label
          htmlFor="edit-modal-cover-file-input"
          className="absolute bottom-3 right-3 px-3 py-1.5 bg-black/60 hover:bg-black/80 text-white backdrop-blur-md rounded-xl text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer shadow-md"
        >
          {uploadingCover ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Camera className="w-3.5 h-3.5" />
          )}
          <span>{uploadingCover ? 'Đang tải...' : 'Tải ảnh bìa lên'}</span>
        </label>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setShowUrlInputs(!showUrlInputs)}
          className="text-[11px] font-bold text-gray-500 dark:text-[#b0b3b8] hover:text-[#1877f2] flex items-center space-x-1 cursor-pointer"
        >
          <LinkIcon className="w-3.5 h-3.5" />
          <span>{showUrlInputs ? 'Ẩn ô nhập URL' : 'Hoặc dán link URL ảnh'}</span>
        </button>
      </div>

      {showUrlInputs && (
        <div className="space-y-3 pt-2">
          <div>
            <label className="block text-xs font-bold text-gray-600 dark:text-[#b0b3b8] mb-1">
              Link URL ảnh đại diện
            </label>
            <input
              type="url"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://example.com/avatar.jpg"
              className="w-full bg-gray-50 dark:bg-[#3a3b3c] text-gray-900 dark:text-[#e4e6eb] px-3.5 py-2 rounded-xl border border-gray-200 dark:border-[#393a3b] text-xs focus:outline-none focus:ring-1 focus:ring-[#1877f2]"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-600 dark:text-[#b0b3b8] mb-1">
              Link URL ảnh bìa
            </label>
            <input
              type="url"
              value={coverUrl}
              onChange={(e) => {
                setCoverUrl(e.target.value);
                setCoverError(false);
              }}
              placeholder="https://example.com/cover.jpg"
              className="w-full bg-gray-50 dark:bg-[#3a3b3c] text-gray-900 dark:text-[#e4e6eb] px-3.5 py-2 rounded-xl border border-gray-200 dark:border-[#393a3b] text-xs focus:outline-none focus:ring-1 focus:ring-[#1877f2]"
            />
          </div>
        </div>
      )}
    </div>
  );
};
