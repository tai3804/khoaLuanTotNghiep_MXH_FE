import React from 'react';

interface EditPersonalInfoSectionProps {
  lastName: string;
  setLastName: (val: string) => void;
  middleName: string;
  setMiddleName: (val: string) => void;
  firstName: string;
  setFirstName: (val: string) => void;
  dateOfBirth: string;
  setDateOfBirth: (val: string) => void;
  gender: string;
  setGender: (val: string) => void;
  location: string;
  setLocation: (val: string) => void;
  website: string;
  setWebsite: (val: string) => void;
}

export const EditPersonalInfoSection: React.FC<EditPersonalInfoSectionProps> = ({
  lastName,
  setLastName,
  middleName,
  setMiddleName,
  firstName,
  setFirstName,
  dateOfBirth,
  setDateOfBirth,
  gender,
  setGender,
  location,
  setLocation,
  website,
  setWebsite,
}) => {
  return (
    <div className="space-y-3 pt-4 border-t border-gray-100 dark:border-[#393a3b]">
      <h4 className="text-sm font-extrabold text-gray-900 dark:text-[#e4e6eb]">
        Thông tin cá nhân
      </h4>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-bold text-gray-600 dark:text-[#b0b3b8] mb-1">Họ (*)</label>
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
            placeholder="Nguyễn"
            className="w-full bg-gray-50 dark:bg-[#3a3b3c] px-3 py-2 rounded-xl border border-gray-200 dark:border-[#393a3b] text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#1877f2]"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-600 dark:text-[#b0b3b8] mb-1">Tên đệm</label>
          <input
            type="text"
            value={middleName}
            onChange={(e) => setMiddleName(e.target.value)}
            placeholder="Văn"
            className="w-full bg-gray-50 dark:bg-[#3a3b3c] px-3 py-2 rounded-xl border border-gray-200 dark:border-[#393a3b] text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#1877f2]"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-600 dark:text-[#b0b3b8] mb-1">Tên (*)</label>
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
            placeholder="An"
            className="w-full bg-gray-50 dark:bg-[#3a3b3c] px-3 py-2 rounded-xl border border-gray-200 dark:border-[#393a3b] text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#1877f2]"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
        <div>
          <label className="block text-xs font-bold text-gray-600 dark:text-[#b0b3b8] mb-1">
            Ngày sinh
          </label>
          <input
            type="date"
            value={dateOfBirth}
            onChange={(e) => setDateOfBirth(e.target.value)}
            className="w-full bg-gray-50 dark:bg-[#3a3b3c] px-3 py-2 rounded-xl border border-gray-200 dark:border-[#393a3b] text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#1877f2]"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-600 dark:text-[#b0b3b8] mb-1">
            Giới tính
          </label>
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            className="w-full bg-gray-50 dark:bg-[#3a3b3c] px-3 py-2 rounded-xl border border-gray-200 dark:border-[#393a3b] text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#1877f2]"
          >
            <option value="MALE">Nam</option>
            <option value="FEMALE">Nữ</option>
            <option value="OTHER">Khác / Ẩn</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
        <div>
          <label className="block text-xs font-bold text-gray-600 dark:text-[#b0b3b8] mb-1">
            Nơi ở hiện tại
          </label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="TP. Hồ Chí Minh, Việt Nam"
            className="w-full bg-gray-50 dark:bg-[#3a3b3c] px-3 py-2 rounded-xl border border-gray-200 dark:border-[#393a3b] text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#1877f2]"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-600 dark:text-[#b0b3b8] mb-1">
            Website cá nhân
          </label>
          <input
            type="url"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="https://yourwebsite.com"
            className="w-full bg-gray-50 dark:bg-[#3a3b3c] px-3 py-2 rounded-xl border border-gray-200 dark:border-[#393a3b] text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#1877f2]"
          />
        </div>
      </div>
    </div>
  );
};
