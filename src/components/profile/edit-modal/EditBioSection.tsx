import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { ProfileBioAiModal } from '../ai/ProfileBioAiModal';

interface EditBioSectionProps {
  bio: string;
  setBio: (val: string) => void;
}

export const EditBioSection: React.FC<EditBioSectionProps> = ({ bio, setBio }) => {
  const [showAiModal, setShowAiModal] = useState(false);

  return (
    <div className="space-y-3 pt-4 border-t border-gray-100 dark:border-[#393a3b]">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-extrabold text-gray-900 dark:text-[#e4e6eb]">
          Tiểu sử
        </h4>
        <button
          type="button"
          onClick={() => setShowAiModal(true)}
          className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-bold text-[#1877f2] bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Gợi ý bằng AI</span>
        </button>
      </div>
      <textarea
        value={bio}
        onChange={(e) => setBio(e.target.value)}
        placeholder="Mô tả bản thân của bạn..."
        maxLength={101}
        rows={3}
        className="w-full text-xs sm:text-sm p-3 rounded-xl border border-gray-200 dark:border-[#393a3b] bg-gray-50 dark:bg-[#3a3b3c] text-gray-900 dark:text-[#e4e6eb] focus:outline-none focus:ring-2 focus:ring-[#1877f2]"
      />
      <p className="text-[11px] text-right text-gray-400 dark:text-[#8a8d91]">
        Còn {101 - bio.length} ký tự
      </p>

      {showAiModal && (
        <ProfileBioAiModal
          isOpen={showAiModal}
          onClose={() => setShowAiModal(false)}
          onSelectBio={(newBio) => setBio(newBio.slice(0, 101))}
        />
      )}
    </div>
  );
};
