import React from 'react';
import { X } from 'lucide-react';

interface StoryViewerModalProps {
  selectedStory: any | null;
  onClose: () => void;
}

export const StoryViewerModal: React.FC<StoryViewerModalProps> = ({
  selectedStory,
  onClose,
}) => {
  if (!selectedStory) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 cursor-pointer"
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 p-2 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition cursor-pointer"
      >
        <X className="w-6 h-6" />
      </button>
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative max-w-sm w-full h-[80vh] rounded-2xl overflow-hidden bg-black flex flex-col justify-between p-4 shadow-2xl cursor-default"
      >
        {/* Author info */}
        <div className="flex items-center space-x-3 z-10 bg-gradient-to-b from-black/80 to-transparent p-2 rounded-xl">
          <img
            src={selectedStory.avatarSrc}
            alt={selectedStory.authorName}
            className="w-10 h-10 rounded-full object-cover ring-2 ring-blue-500"
          />
          <span className="font-bold text-white text-sm">{selectedStory.authorName}</span>
        </div>

        {/* Media Image */}
        <img
          src={selectedStory.firstStory?.mediaUrl || selectedStory.avatarSrc}
          alt={selectedStory.authorName}
          className="absolute inset-0 w-full h-full object-contain"
        />
      </div>
    </div>
  );
};
