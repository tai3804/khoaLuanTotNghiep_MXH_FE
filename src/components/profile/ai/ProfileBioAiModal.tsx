import React, { useState } from 'react';
import { Sparkles, X, Check, RefreshCw, User, Briefcase, Heart } from 'lucide-react';
import { aiService } from '../../../services/aiService';

interface ProfileBioAiModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectBio: (bio: string) => void;
  userName?: string;
}

const TONES = [
  'Năng động & Trẻ trung 🚀',
  'Chuyên nghiệp & Tinh tế 💼',
  'Tối giản & Sâu lắng 🌱',
];

export const ProfileBioAiModal: React.FC<ProfileBioAiModalProps> = ({
  isOpen,
  onClose,
  onSelectBio,
  userName = '',
}) => {
  const [major, setMajor] = useState('');
  const [interests, setInterests] = useState('');
  const [tone, setTone] = useState(TONES[0]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const items = await aiService.suggestBio({
        name: userName,
        major: major.trim(),
        interests: interests.trim(),
        tone,
      });
      setSuggestions(items);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (bio: string) => {
    onSelectBio(bio);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white dark:bg-[#242526] w-full max-w-md rounded-2xl shadow-2xl border border-gray-200 dark:border-[#393a3b] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-[#393a3b] flex items-center justify-between bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-blue-950/20 dark:to-indigo-950/20">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/40 text-[#1877f2] flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-gray-900 dark:text-white">
                Gợi ý tiểu sử bằng AI
              </h3>
              <p className="text-[11px] text-gray-500 dark:text-[#b0b3b8]">
                Tạo bio trang cá nhân ấn tượng chỉ trong vài giây
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#3a3b3c] transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-4 space-y-3.5 overflow-y-auto">
          {/* Major / Job */}
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1 flex items-center space-x-1">
              <Briefcase className="w-3.5 h-3.5 text-blue-500" />
              <span>Chuyên ngành / Công việc hiện tại:</span>
            </label>
            <input
              type="text"
              value={major}
              onChange={(e) => setMajor(e.target.value)}
              placeholder="Ví dụ: Kỹ thuật phần mềm, Marketing, Thiết kế Đồ họa..."
              className="w-full text-xs p-2.5 rounded-xl border border-gray-200 dark:border-[#393a3b] bg-gray-50 dark:bg-[#3a3b3c] text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#1877f2]"
            />
          </div>

          {/* Interests */}
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1 flex items-center space-x-1">
              <Heart className="w-3.5 h-3.5 text-pink-500" />
              <span>Sở thích / Đam mê nổi bật:</span>
            </label>
            <input
              type="text"
              value={interests}
              onChange={(e) => setInterests(e.target.value)}
              placeholder="Ví dụ: Lập trình, Đọc sách, Đi phượt, Nhiếp ảnh, Cà phê..."
              className="w-full text-xs p-2.5 rounded-xl border border-gray-200 dark:border-[#393a3b] bg-gray-50 dark:bg-[#3a3b3c] text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#1877f2]"
            />
          </div>

          {/* Tone Selector */}
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
              Phong cách mong muốn:
            </label>
            <div className="flex flex-wrap gap-1.5">
              {TONES.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTone(t)}
                  className={`px-2.5 py-1 rounded-full text-xs font-semibold transition cursor-pointer ${
                    tone === t
                      ? 'bg-[#1877f2] text-white shadow-xs'
                      : 'bg-gray-100 dark:bg-[#3a3b3c] text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#4e4f50]'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Action button */}
          <button
            type="button"
            disabled={loading}
            onClick={handleGenerate}
            className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 shadow-md shadow-blue-500/20 transition disabled:opacity-60 cursor-pointer"
          >
            {loading ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>AI đang sáng tạo tiểu sử...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Tạo 3 mẫu tiểu sử hay</span>
              </>
            )}
          </button>

          {/* Suggestions List */}
          {suggestions.length > 0 && (
            <div className="pt-2 space-y-2 border-t border-gray-100 dark:border-[#393a3b]">
              <p className="text-xs font-bold text-gray-600 dark:text-gray-400">
                Chọn một mẫu bên dưới để áp dụng vào hồ sơ:
              </p>
              {suggestions.map((bio, index) => (
                <div
                  key={index}
                  className="p-3 rounded-xl border border-gray-200 dark:border-[#393a3b] bg-gray-50/70 dark:bg-[#2b2d2f] hover:border-blue-300 dark:hover:border-blue-700 transition flex items-start justify-between gap-2.5"
                >
                  <p className="text-xs text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-line flex-1">
                    {bio}
                  </p>
                  <button
                    type="button"
                    onClick={() => handleSelect(bio)}
                    className="px-2.5 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-[#1877f2] dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-lg text-xs font-bold shrink-0 flex items-center space-x-1 transition cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Dùng</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
