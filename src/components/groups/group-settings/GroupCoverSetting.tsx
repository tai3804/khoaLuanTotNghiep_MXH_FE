import React from 'react';
import { Image as ImageIcon, Loader2 } from 'lucide-react';

interface GroupCoverSettingProps {
  coverUrl: string;
  setCoverUrl: (url: string) => void;
  canEditSettings: boolean;
  uploadingCover: boolean;
  coverInputRef: React.RefObject<HTMLInputElement | null>;
  onCoverUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const GroupCoverSetting: React.FC<GroupCoverSettingProps> = ({
  coverUrl,
  setCoverUrl,
  canEditSettings,
  uploadingCover,
  coverInputRef,
  onCoverUpload,
}) => {
  return (
    <div className="space-y-2">
      <label className="block text-xs font-bold text-gray-700 dark:text-[#b0b3b8]">
        Ảnh bìa nhóm
      </label>
      <div className="relative h-44 sm:h-56 w-full rounded-2xl overflow-hidden bg-gray-100 dark:bg-[#1a1b1d] border border-gray-200 dark:border-[#393a3b] flex items-center justify-center shadow-inner">
        {coverUrl ? (
          <img src={coverUrl} alt="Cover Preview" className="w-full h-full object-cover" />
        ) : (
          <div className="text-center text-gray-400 text-xs">
            <ImageIcon className="w-8 h-8 mx-auto mb-1 opacity-50" />
            <span>Chưa có ảnh bìa tùy chỉnh</span>
          </div>
        )}
        {canEditSettings && (
          <div className="absolute bottom-3 right-3 flex items-center gap-2">
            <input
              type="file"
              ref={coverInputRef}
              onChange={onCoverUpload}
              accept="image/*"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => coverInputRef.current?.click()}
              disabled={uploadingCover}
              className="bg-black/60 hover:bg-black/80 text-white text-xs font-bold px-3 py-1.5 rounded-xl backdrop-blur-sm transition flex items-center gap-1.5 cursor-pointer disabled:opacity-60 shadow-md"
            >
              {uploadingCover ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Đang tải ảnh...</span>
                </>
              ) : (
                <>
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>{coverUrl ? 'Thay đổi ảnh' : 'Tải ảnh lên'}</span>
                </>
              )}
            </button>
            {coverUrl && (
              <button
                type="button"
                onClick={() => setCoverUrl('')}
                className="bg-red-600/80 hover:bg-red-700 text-white text-xs font-bold px-2.5 py-1.5 rounded-xl backdrop-blur-sm transition cursor-pointer shadow-md"
                title="Gỡ ảnh bìa"
              >
                Gỡ
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
