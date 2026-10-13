import React from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';

interface GroupDangerZoneSettingProps {
  onDeleteGroup: () => void;
}

export const GroupDangerZoneSetting: React.FC<GroupDangerZoneSettingProps> = ({
  onDeleteGroup,
}) => {
  return (
    <section className="bg-white dark:bg-[#242526] rounded-2xl shadow-sm p-6 border border-red-200 dark:border-red-900/50 space-y-3">
      <h3 className="font-bold text-base flex gap-2 items-center text-red-600 dark:text-red-400">
        <AlertTriangle className="w-5 h-5" /> Vùng nguy hiểm
      </h3>
      <p className="text-xs text-gray-500 dark:text-[#b0b3b8]">
        Giải tán nhóm sẽ xóa vĩnh viễn nhóm và gỡ bỏ tất cả bài viết, thành viên. Hành động này không thể hoàn tác.
      </p>
      <button
        onClick={onDeleteGroup}
        className="rounded-xl bg-red-600 hover:bg-red-700 text-white px-4 py-2 text-xs sm:text-sm font-bold flex gap-2 items-center transition cursor-pointer shadow-xs"
      >
        <Trash2 className="w-4 h-4" />
        <span>Giải tán nhóm</span>
      </button>
    </section>
  );
};
