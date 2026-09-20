import React, { useState } from 'react';
import { X, Users, Globe, Lock, Loader2 } from 'lucide-react';
import { groupService } from '../../services/groupService';
import { useNavigate } from 'react-router-dom';

interface CreateCommunityGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateCommunityGroupModal: React.FC<CreateCommunityGroupModalProps> = ({
  isOpen,
  onClose
}) => {
  const [name, setName] = useState('');
  const [privacy, setPrivacy] = useState<'PUBLIC' | 'PRIVATE'>('PUBLIC');
  const [creating, setCreating] = useState(false);
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleCreateGroup = async () => {
    if (!name.trim()) return;
    try {
      setCreating(true);
      const group = await groupService.createGroup({
        name: name.trim(),
        privacy: privacy,
      });
      onClose();
      navigate(`/groups/${group.id}`);
    } catch (error) {
      console.error('Failed to create group', error);
      alert('Không thể tạo nhóm, vui lòng thử lại sau.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm"
        onClick={!creating ? onClose : undefined}
      ></div>

      {/* Modal */}
      <div className="relative bg-white dark:bg-[#242526] w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-200 dark:border-[#393a3b] flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-900 dark:text-[#e4e6eb]">Tạo nhóm cộng đồng</h3>
          <button
            onClick={onClose}
            disabled={creating}
            className="p-2 bg-gray-100 hover:bg-gray-200 dark:bg-[#3a3b3c] dark:hover:bg-[#4e4f50] rounded-full text-gray-500 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-5">
          <div className="flex items-center gap-3">
             <div className="w-12 h-12 bg-gray-200 dark:bg-[#3a3b3c] rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-gray-500 dark:text-gray-400" />
             </div>
             <div>
               <div className="font-bold text-gray-900 dark:text-[#e4e6eb]">Quản trị viên</div>
               <div className="text-xs text-gray-500 dark:text-[#b0b3b8]">Bạn đang tạo nhóm với tư cách Cá nhân</div>
             </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-bold text-gray-700 dark:text-[#b0b3b8]">Tên nhóm</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ví dụ: Hội những người yêu mèo..."
              className="w-full px-4 py-3 bg-gray-50 dark:bg-[#3a3b3c]/50 border border-gray-200 dark:border-[#393a3b] rounded-xl text-sm text-gray-900 dark:text-[#e4e6eb] focus:outline-none focus:border-[#1877f2] focus:ring-1 focus:ring-[#1877f2]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-bold text-gray-700 dark:text-[#b0b3b8]">Quyền riêng tư</label>
            <div className="space-y-2">
              <label className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition ${privacy === 'PUBLIC' ? 'border-[#1877f2] bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-[#393a3b] hover:bg-gray-50 dark:hover:bg-[#3a3b3c]/50'}`}>
                <input type="radio" name="privacy" checked={privacy === 'PUBLIC'} onChange={() => setPrivacy('PUBLIC')} className="mt-1" />
                <div className="flex-1">
                  <div className="font-bold flex items-center gap-1.5 text-gray-900 dark:text-[#e4e6eb]">
                    <Globe className="w-4 h-4" /> Công khai
                  </div>
                  <div className="text-xs text-gray-500 dark:text-[#b0b3b8] mt-0.5">Bất kỳ ai cũng có thể tìm thấy nhóm và xem nội dung.</div>
                </div>
              </label>

              <label className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition ${privacy === 'PRIVATE' ? 'border-[#1877f2] bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-[#393a3b] hover:bg-gray-50 dark:hover:bg-[#3a3b3c]/50'}`}>
                <input type="radio" name="privacy" checked={privacy === 'PRIVATE'} onChange={() => setPrivacy('PRIVATE')} className="mt-1" />
                <div className="flex-1">
                  <div className="font-bold flex items-center gap-1.5 text-gray-900 dark:text-[#e4e6eb]">
                    <Lock className="w-4 h-4" /> Riêng tư
                  </div>
                  <div className="text-xs text-gray-500 dark:text-[#b0b3b8] mt-0.5">Chỉ thành viên mới nhìn thấy những ai trong nhóm và nội dung họ đăng.</div>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-gray-200 dark:border-[#393a3b] bg-gray-50 dark:bg-[#242526]">
          <button
            disabled={!name.trim() || creating}
            onClick={handleCreateGroup}
            className="w-full py-3 bg-[#1877f2] hover:bg-[#166fe5] text-white font-bold rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {creating ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
            Tạo nhóm
          </button>
        </div>
      </div>
    </div>
  );
};
