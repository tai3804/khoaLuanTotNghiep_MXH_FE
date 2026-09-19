import React from 'react';
import { GraduationCap, MapPin, Mail, Clock } from 'lucide-react';
import { UserProfile } from '../../../types';

interface ProfileIntroBoxProps {
  profile: UserProfile | null;
  isOwnProfile: boolean;
  isEditingBio: boolean;
  setIsEditingBio: (val: boolean) => void;
  bioInput: string;
  setBioInput: (val: string) => void;
  onSaveBio: () => void;
  selectedHobbies: string[];
  onShowEditModal: () => void;
}

export const ProfileIntroBox: React.FC<ProfileIntroBoxProps> = ({
  profile,
  isOwnProfile,
  isEditingBio,
  setIsEditingBio,
  bioInput,
  setBioInput,
  onSaveBio,
  selectedHobbies,
  onShowEditModal,
}) => {
  return (
    <div className="bg-white dark:bg-[#242526] rounded-2xl p-4 shadow-sm border border-gray-200 dark:border-[#393a3b] transition">
      <h3 className="font-extrabold text-base text-gray-900 dark:text-[#e4e6eb] mb-3">
        Giới thiệu
      </h3>

      {/* Bio section */}
      {isEditingBio ? (
        <div className="space-y-2 mb-3">
          <textarea
            value={bioInput}
            onChange={(e) => setBioInput(e.target.value)}
            placeholder="Mô tả bản thân của bạn..."
            rows={3}
            className="w-full text-xs sm:text-sm p-2.5 rounded-xl border border-gray-300 dark:border-[#393a3b] bg-gray-50 dark:bg-[#3a3b3c] dark:text-[#e4e6eb] focus:outline-none focus:ring-2 focus:ring-[#1877f2]"
          />
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => setIsEditingBio(false)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 dark:bg-[#3a3b3c] text-gray-700 dark:text-[#b0b3b8] hover:bg-gray-200 dark:hover:bg-[#4e4f50]"
            >
              Hủy
            </button>
            <button
              onClick={onSaveBio}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#1877f2] text-white hover:bg-[#166fe5]"
            >
              Lưu
            </button>
          </div>
        </div>
      ) : (
        <div className="mb-3 text-center">
          {profile?.bio && (
            <p className="text-xs sm:text-sm text-gray-700 dark:text-[#b0b3b8]">
              {profile.bio}
            </p>
          )}
          {isOwnProfile && (
            <button
              onClick={() => setIsEditingBio(true)}
              className="w-full mt-2.5 py-1.5 rounded-xl bg-gray-100 dark:bg-[#3a3b3c] hover:bg-gray-200 dark:hover:bg-[#4e4f50] text-xs font-bold text-gray-800 dark:text-[#e4e6eb] transition cursor-pointer"
            >
              {profile?.bio ? 'Chỉnh sửa tiểu sử' : 'Thêm tiểu sử'}
            </button>
          )}
        </div>
      )}

      <div className="space-y-2.5 text-xs sm:text-sm text-gray-600 dark:text-[#b0b3b8] pt-2 border-t border-gray-100 dark:border-[#393a3b]">
        {(profile as any)?.education && (
          <div className="flex items-center space-x-3">
            <GraduationCap className="w-4 h-4 text-gray-400 dark:text-[#8a8d91] shrink-0" />
            <span>Học tại <b>{(profile as any).education}</b></span>
          </div>
        )}
        {profile?.location && (
          <div className="flex items-center space-x-3">
            <MapPin className="w-4 h-4 text-gray-400 dark:text-[#8a8d91] shrink-0" />
            <span>Sống tại <b>{profile.location}</b></span>
          </div>
        )}
        {profile?.email && (
          <div className="flex items-center space-x-3">
            <Mail className="w-4 h-4 text-gray-400 dark:text-[#8a8d91] shrink-0" />
            <span>{profile.email}</span>
          </div>
        )}
        {(profile as any)?.createdAt && (
          <div className="flex items-center space-x-3">
            <Clock className="w-4 h-4 text-gray-400 dark:text-[#8a8d91] shrink-0" />
            <span>
              Tham gia vào{' '}
              <b>
                Tháng {new Date((profile as any).createdAt).getMonth() + 1} năm {new Date((profile as any).createdAt).getFullYear()}
              </b>
            </span>
          </div>
        )}
      </div>

      {selectedHobbies.length > 0 && (
        <div className="pt-3 border-t border-gray-100 dark:border-[#393a3b]">
          <p className="text-xs font-bold text-gray-500 dark:text-[#b0b3b8] mb-2">Sở thích</p>
          <div className="flex flex-wrap gap-1.5">
            {selectedHobbies.map((hobby, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 dark:bg-[#3a3b3c] text-gray-700 dark:text-[#e4e6eb] border border-gray-200 dark:border-[#4e4f50]"
              >
                {hobby}
              </span>
            ))}
          </div>
        </div>
      )}

      {isOwnProfile && (
        <button
          onClick={onShowEditModal}
          className="w-full mt-4 py-2 rounded-xl bg-gray-100 dark:bg-[#3a3b3c] hover:bg-gray-200 dark:hover:bg-[#4e4f50] text-xs font-bold text-gray-800 dark:text-[#e4e6eb] transition cursor-pointer"
        >
          Chỉnh sửa chi tiết
        </button>
      )}
    </div>
  );
};
