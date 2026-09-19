import React from 'react';
import { Globe, MapPin, Link as LinkIcon } from 'lucide-react';

interface BioContactSectionProps {
  bio: string;
  setBio: (val: string) => void;
  location: string;
  setLocation: (val: string) => void;
  website: string;
  setWebsite: (val: string) => void;
}

export const BioContactSection: React.FC<BioContactSectionProps> = ({
  bio,
  setBio,
  location,
  setLocation,
  website,
  setWebsite,
}) => {
  return (
    <div className="bg-gray-50/50 dark:bg-[#252728] border border-gray-200/80 dark:border-[#393a3b] rounded-2xl p-4 space-y-4">
      <h4 className="text-xs font-extrabold text-gray-700 dark:text-[#e4e6eb] uppercase tracking-wider flex items-center space-x-1.5">
        <Globe className="w-4 h-4 text-[#1877f2]" />
        <span>Giới Thiệu & Liên Hệ</span>
      </h4>

      {/* Bio Field */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="block text-xs font-bold text-gray-700 dark:text-[#b0b3b8]">
            Tiểu sử (Bio)
          </label>
          <span className="text-[10px] text-gray-400">{bio.length}/500</span>
        </div>
        <textarea
          rows={3}
          maxLength={500}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Giới thiệu đôi nét về bản thân, công việc hoặc sở thích của bạn..."
          className="w-full bg-white dark:bg-[#3a3b3c] text-gray-900 dark:text-[#e4e6eb] px-4 py-2.5 rounded-xl border border-gray-200 dark:border-[#393a3b] text-xs focus:outline-none focus:ring-1 focus:ring-[#1877f2] resize-none leading-relaxed"
        />
      </div>

      {/* Location & Website Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-bold text-gray-700 dark:text-[#b0b3b8] mb-1 flex items-center space-x-1">
            <MapPin className="w-3.5 h-3.5 text-red-500" />
            <span>Tỉnh / Thành phố</span>
          </label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Ví dụ: TP. Hồ Chí Minh"
            className="w-full bg-white dark:bg-[#3a3b3c] text-gray-900 dark:text-[#e4e6eb] px-3.5 py-2 rounded-xl border border-gray-200 dark:border-[#393a3b] text-xs focus:outline-none focus:ring-1 focus:ring-[#1877f2]"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 dark:text-[#b0b3b8] mb-1 flex items-center space-x-1">
            <LinkIcon className="w-3.5 h-3.5 text-emerald-500" />
            <span>Website / Link cá nhân</span>
          </label>
          <input
            type="url"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="https://yourwebsite.com"
            className="w-full bg-white dark:bg-[#3a3b3c] text-gray-900 dark:text-[#e4e6eb] px-3.5 py-2 rounded-xl border border-gray-200 dark:border-[#393a3b] text-xs focus:outline-none focus:ring-1 focus:ring-[#1877f2]"
          />
        </div>
      </div>
    </div>
  );
};
