import React from 'react';
import { X, Upload, Image as ImageIcon, Loader2 } from 'lucide-react';

interface CreateStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  setImageUrl: (url: string) => void;
  creating: boolean;
  uploadingMedia: boolean;
  storyFileInputRef: React.RefObject<HTMLInputElement | null>;
  handleStoryFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleCreateStorySubmit: (e: React.FormEvent) => void;
}

export const CreateStoryModal: React.FC<CreateStoryModalProps> = ({
  isOpen,
  onClose,
  imageUrl,
  setImageUrl,
  creating,
  uploadingMedia,
  storyFileInputRef,
  handleStoryFileSelect,
  handleCreateStorySubmit,
}) => {
  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-[#242526] rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200 dark:border-[#393a3b] space-y-4 cursor-default"
      >
        <div className="flex items-center justify-between border-b pb-3 border-gray-100 dark:border-[#393a3b]">
          <h3 className="text-lg font-black text-gray-900 dark:text-[#e4e6eb]">Tạo tin 24h</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-[#3a3b3c] text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleCreateStorySubmit} className="space-y-4">
          {/* File Upload Button */}
          <div>
            <input
              type="file"
              ref={storyFileInputRef}
              onChange={handleStoryFileSelect}
              accept="image/*,video/*"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => storyFileInputRef.current?.click()}
              disabled={uploadingMedia}
              className="w-full py-3.5 px-4 rounded-xl border-2 border-dashed border-gray-300 dark:border-[#4e4f50] hover:border-[#1877f2] bg-gray-50 dark:bg-[#18191a] hover:bg-blue-50/50 text-gray-700 dark:text-[#e4e6eb] font-semibold text-xs flex items-center justify-center space-x-2 transition cursor-pointer disabled:opacity-50"
            >
              {uploadingMedia ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#1877f2]" />
                  <span>Đang nén & tải file lên Cloud Storage...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 text-[#1877f2]" />
                  <span>Tải ảnh / video từ thiết bị</span>
                </>
              )}
            </button>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-[#e4e6eb] mb-1">
              Hoặc nhập URL trực tiếp
            </label>
            <div className="relative">
              <ImageIcon className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-gray-100 dark:bg-[#3a3b3c] border border-gray-200 dark:border-[#4e4f50] text-gray-900 dark:text-[#e4e6eb] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#1877f2]"
              />
            </div>
          </div>

          {imageUrl.trim() && (
            <div className="w-full h-44 rounded-xl overflow-hidden bg-gray-100 dark:bg-[#3a3b3c] border border-gray-200 dark:border-[#4e4f50] flex items-center justify-center">
              {imageUrl.endsWith('.mp4') || imageUrl.endsWith('.webm') ? (
                <video src={imageUrl.trim()} controls className="w-full h-full object-cover" />
              ) : (
                <img src={imageUrl.trim()} alt="Preview" className="w-full h-full object-cover" />
              )}
            </div>
          )}

          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#3a3b3c] rounded-xl transition cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={creating || !imageUrl.trim()}
              className="px-5 py-2 text-xs font-bold text-white bg-[#1877f2] hover:bg-[#166fe5] disabled:opacity-50 rounded-xl shadow transition cursor-pointer"
            >
              {creating ? 'Đang chia sẻ...' : 'Chia sẻ lên tin'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
