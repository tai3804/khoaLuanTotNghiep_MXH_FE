import React from 'react';
import { ShieldCheck } from 'lucide-react';

interface GroupRulesAndApprovalSettingProps {
  rules: string;
  setRules: (rules: string) => void;
  postApprovalRequired: boolean;
  setPostApprovalRequired: (required: boolean) => void;
  canEditSettings: boolean;
}

export const GroupRulesAndApprovalSetting: React.FC<GroupRulesAndApprovalSettingProps> = ({
  rules,
  setRules,
  postApprovalRequired,
  setPostApprovalRequired,
  canEditSettings,
}) => {
  return (
    <div className="space-y-4">
      {/* Rules */}
      <div className="space-y-1.5">
        <label className="block text-xs font-bold text-gray-700 dark:text-[#b0b3b8]">
          Nội quy nhóm
        </label>
        <textarea
          disabled={!canEditSettings}
          value={rules}
          onChange={(e) => setRules(e.target.value)}
          rows={4}
          placeholder="1. Tôn trọng lẫn nhau&#10;2. Không đăng bài quảng cáo, spam&#10;3. Giữ gìn văn hóa thảo luận văn minh..."
          className="w-full rounded-xl border border-gray-200 dark:border-[#393a3b] bg-gray-50/80 dark:bg-[#1a1b1d] px-4 py-2.5 text-xs sm:text-sm text-gray-900 dark:text-[#e4e6eb] focus:outline-none focus:border-[#1877f2] focus:ring-1 focus:ring-[#1877f2] disabled:opacity-60 transition resize-none"
        />
      </div>

      {/* Post Approval Toggle */}
      <label className="flex items-start gap-3 rounded-2xl border border-gray-200 dark:border-[#393a3b] p-3.5 cursor-pointer bg-gray-50/50 dark:bg-[#1a1b1d]/50">
        <input
          type="checkbox"
          disabled={!canEditSettings}
          checked={postApprovalRequired}
          onChange={(e) => setPostApprovalRequired(e.target.checked)}
          className="mt-1 rounded text-[#1877f2] focus:ring-0"
        />
        <div>
          <b className="text-xs sm:text-sm flex gap-1.5 items-center text-gray-900 dark:text-[#e4e6eb]">
            <ShieldCheck className="w-4 h-4 text-[#1877f2]" /> Duyệt bài viết trước khi hiển thị
          </b>
          <small className="block mt-0.5 text-[11px] text-gray-500 dark:text-[#b0b3b8]">
            Bài đăng của thành viên sẽ chờ quản trị viên hoặc người kiểm duyệt phê duyệt trước khi xuất hiện trên dòng thời gian nhóm.
          </small>
        </div>
      </label>
    </div>
  );
};
