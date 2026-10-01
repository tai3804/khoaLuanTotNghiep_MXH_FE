import React from 'react';
import { X, Play, Image as ImageIcon } from 'lucide-react';

interface CreatePostMediaPreviewProps {
  showImageInput: boolean;
  setShowImageInput: (show: boolean) => void;
  imageUrl: string;
  setImageUrl: (url: string) => void;
  filePreview: string | null;
  selectedFileType?: 'image' | 'video' | null;
  onClearFile: () => void;
}

export const CreatePostMediaPreview: React.FC<CreatePostMediaPreviewProps> = ({
  showImageInput,
  setShowImageInput,
  imageUrl,
  setImageUrl,
  filePreview,
  selectedFileType,
  onClearFile,
}) => {
  return (
    <div className="space-y-2">
      {/* Remote Image URL Input Section */}
      {showImageInput && (
        <div className="relative p-3 bg-gray-50 dark:bg-[#18191a] rounded-xl border border-gray-200 dark:border-[#393a3b] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-600 dark:text-[#b0b3b8] flex items-center space-x-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-[#1877f2]" />
              <span>Thêm liên kết hình ảnh / media</span>
            </span>
            <button
              type="button"
              onClick={() => {
                setShowImageInput(false);
                setImageUrl('');
              }}
              className="text-gray-400 hover:text-red-500 text-xs font-medium cursor-pointer"
            >
              Đóng
            </button>
          </div>
          <input
            type="text"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="Dán đường dẫn ảnh hoặc video (URL)..."
            className="w-full bg-white dark:bg-[#242526] text-gray-900 dark:text-[#e4e6eb] text-xs p-2.5 rounded-lg border border-gray-200 dark:border-[#393a3b] focus:outline-none focus:ring-1 focus:ring-[#1877f2]"
          />
          {imageUrl.trim() && (
            <div className="relative rounded-lg overflow-hidden max-h-48 bg-black/5 flex items-center justify-center">
              {imageUrl.match(/\.(mp4|webm|ogg|mov|m4v)(\?.*)?$/i) ? (
                <video src={imageUrl} controls className="w-full max-h-48 object-contain bg-black" />
              ) : (
                <img
                  src={imageUrl}
                  alt="Remote Preview"
                  className="w-full max-h-48 object-cover"
                  onError={(e) => {
                    (e.currentTarget as HTMLElement).style.display = 'none';
                  }}
                />
              )}
            </div>
          )}
        </div>
      )}

      {/* Local File Attachment Preview */}
      {filePreview && (
        <div className="relative rounded-xl overflow-hidden bg-black/10 dark:bg-black/30 border border-gray-200 dark:border-[#393a3b]">
          {selectedFileType === 'video' ? (
            <div className="relative w-full bg-black rounded-xl overflow-hidden">
              <video
                src={filePreview}
                controls
                playsInline
                className="w-full max-h-64 object-contain bg-black"
              />
              <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/70 text-white text-[10px] font-semibold rounded-md flex items-center space-x-1">
                <Play className="w-3 h-3 fill-white" />
                <span>Video đã chọn</span>
              </div>
            </div>
          ) : (
            <img
              src={filePreview}
              alt="Selected attachment"
              className="w-full max-h-64 object-cover"
              onError={(e) => {
                (e.currentTarget as HTMLElement).style.display = 'none';
              }}
            />
          )}

          <button
            type="button"
            onClick={onClearFile}
            className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-full transition cursor-pointer z-10"
            title="Xóa tệp đính kèm"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
