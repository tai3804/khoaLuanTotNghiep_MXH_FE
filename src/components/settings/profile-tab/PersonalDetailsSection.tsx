import React from 'react';
import { User, Calendar, Info } from 'lucide-react';

interface PersonalDetailsSectionProps {
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
}

export const PersonalDetailsSection: React.FC<PersonalDetailsSectionProps> = ({
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
}) => {
  return (
    <div className="bg-gray-50/50 dark:bg-[#252728] border border-gray-200/80 dark:border-[#393a3b] rounded-2xl p-4 space-y-4">
      <h4 className="text-xs font-extrabold text-gray-700 dark:text-[#e4e6eb] uppercase tracking-wider flex items-center space-x-1.5">
        <User className="w-4 h-4 text-[#1877f2]" />
        <span>Thông Tin Cá Nhân Cơ Bản</span>
      </h4>

      {/* Name Fields Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-bold text-gray-700 dark:text-[#b0b3b8] mb-1">
            Họ <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Nguyễn"
            className="w-full bg-white dark:bg-[#3a3b3c] text-gray-900 dark:text-[#e4e6eb] px-3.5 py-2 rounded-xl border border-gray-200 dark:border-[#393a3b] text-xs focus:outline-none focus:ring-1 focus:ring-[#1877f2]"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 dark:text-[#b0b3b8] mb-1">
            Tên đệm
          </label>
          <input
            type="text"
            value={middleName}
            onChange={(e) => setMiddleName(e.target.value)}
            placeholder="Văn"
            className="w-full bg-white dark:bg-[#3a3b3c] text-gray-900 dark:text-[#e4e6eb] px-3.5 py-2 rounded-xl border border-gray-200 dark:border-[#393a3b] text-xs focus:outline-none focus:ring-1 focus:ring-[#1877f2]"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 dark:text-[#b0b3b8] mb-1">
            Tên chính <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="An"
            className="w-full bg-white dark:bg-[#3a3b3c] text-gray-900 dark:text-[#e4e6eb] px-3.5 py-2 rounded-xl border border-gray-200 dark:border-[#393a3b] text-xs focus:outline-none focus:ring-1 focus:ring-[#1877f2]"
          />
        </div>
      </div>

      {/* Date of Birth & Gender Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-bold text-gray-700 dark:text-[#b0b3b8] mb-1 flex items-center space-x-1">
            <Calendar className="w-3.5 h-3.5 text-[#1877f2]" />
            <span>Ngày sinh</span>
          </label>
          <input
            type="date"
            value={dateOfBirth}
            onChange={(e) => setDateOfBirth(e.target.value)}
            className="w-full bg-white dark:bg-[#3a3b3c] text-gray-900 dark:text-[#e4e6eb] px-3.5 py-2 rounded-xl border border-gray-200 dark:border-[#393a3b] text-xs focus:outline-none focus:ring-1 focus:ring-[#1877f2]"
          />
          <p className="text-[10px] text-gray-400 dark:text-[#8a8d91] mt-1 flex items-center space-x-1">
            <Info className="w-3 h-3 text-blue-500" />
            <span>Yêu cầu từ 13 tuổi trở lên.</span>
          </p>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 dark:text-[#b0b3b8] mb-1">
            Giới tính
          </label>
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            className="w-full bg-white dark:bg-[#3a3b3c] text-gray-900 dark:text-[#e4e6eb] px-3.5 py-2 rounded-xl border border-gray-200 dark:border-[#393a3b] text-xs focus:outline-none focus:ring-1 focus:ring-[#1877f2]"
          >
            <option value="MALE">Nam</option>
            <option value="FEMALE">Nữ</option>
            <option value="OTHER">Khác</option>
          </select>
        </div>
      </div>
    </div>
  );
};
