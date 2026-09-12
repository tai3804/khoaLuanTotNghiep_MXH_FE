import React from 'react';
import { useToast } from '../../context/ToastContext';
import { useNotification } from '../../context/NotificationContext';
import {
  Bell,
  Volume2,
  Heart,
  MessageCircle,
  Share2,
  UserPlus,
  Phone,
  Mail,
} from 'lucide-react';

export const NotificationSettingsTab: React.FC = () => {
  const toast = useToast();
  const { settings, updateSettings, playNotificationSound } = useNotification();

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-100 dark:border-[#393a3b] pb-3">
        <h3 className="text-sm font-extrabold text-gray-900 dark:text-[#e4e6eb] flex items-center gap-2">
          <Bell className="w-4 h-4 text-blue-500" />
          <span>Cấu hình thông báo (UC-NO05)</span>
        </h3>
        <p className="text-xs text-gray-500 dark:text-[#b0b3b8] mt-1">
          Chọn loại thông báo bạn muốn nhận và bật âm thanh khi có tương tác mới.
        </p>
      </div>

      {/* Category 1: Social Interactions */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-[#8a8d91]">
          Tương tác & Bài viết
        </h4>

        <div className="space-y-2">
          {/* Like Post */}
          <div className="flex items-center justify-between p-3.5 bg-gray-50 dark:bg-[#3a3b3c]/50 rounded-xl">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-rose-100 dark:bg-rose-950/50 flex items-center justify-center text-rose-500">
                <Heart className="w-4 h-4 fill-rose-500" />
              </div>
              <div>
                <h5 className="text-xs font-bold text-gray-800 dark:text-[#e4e6eb]">Cảm xúc & Lượt thích</h5>
                <p className="text-[11px] text-gray-400">Khi ai đó thích hoặc bày tỏ cảm xúc về bài viết của bạn</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings?.likePost ?? true}
                onChange={async (e) => {
                  const val = e.target.checked;
                  await updateSettings({ likePost: val });
                  toast.showSuccess(val ? 'Đã bật thông báo lượt thích' : 'Đã tắt thông báo lượt thích');
                }}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Comment Post */}
          <div className="flex items-center justify-between p-3.5 bg-gray-50 dark:bg-[#3a3b3c]/50 rounded-xl">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-950/50 flex items-center justify-center text-blue-500">
                <MessageCircle className="w-4 h-4 fill-blue-500" />
              </div>
              <div>
                <h5 className="text-xs font-bold text-gray-800 dark:text-[#e4e6eb]">Bình luận & Phản hồi</h5>
                <p className="text-[11px] text-gray-400">Khi ai đó bình luận bài viết hoặc trả lời bình luận của bạn</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings?.commentPost ?? true}
                onChange={async (e) => {
                  const val = e.target.checked;
                  await updateSettings({ commentPost: val });
                  toast.showSuccess(val ? 'Đã bật thông báo bình luận' : 'Đã tắt thông báo bình luận');
                }}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Share Post */}
          <div className="flex items-center justify-between p-3.5 bg-gray-50 dark:bg-[#3a3b3c]/50 rounded-xl">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-500">
                <Share2 className="w-4 h-4" />
              </div>
              <div>
                <h5 className="text-xs font-bold text-gray-800 dark:text-[#e4e6eb]">Chia sẻ bài viết</h5>
                <p className="text-[11px] text-gray-400">Khi người khác chia sẻ bài viết của bạn lên trang cá nhân</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings?.sharePost ?? true}
                onChange={async (e) => {
                  const val = e.target.checked;
                  await updateSettings({ sharePost: val });
                  toast.showSuccess(val ? 'Đã bật thông báo chia sẻ' : 'Đã tắt thông báo chia sẻ');
                }}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Category 2: Connections & Friends */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-[#8a8d91]">
          Bạn bè & Mối quan hệ
        </h4>

        <div className="flex items-center justify-between p-3.5 bg-gray-50 dark:bg-[#3a3b3c]/50 rounded-xl">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-500">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <h5 className="text-xs font-bold text-gray-800 dark:text-[#e4e6eb]">Lời mời & Chấp nhận kết bạn</h5>
              <p className="text-[11px] text-gray-400">Khi nhận lời mời kết bạn mới hoặc ai đó chấp nhận lời mời</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings?.friendRequest ?? true}
              onChange={async (e) => {
                const val = e.target.checked;
                await updateSettings({ friendRequest: val });
                toast.showSuccess(val ? 'Đã bật thông báo kết bạn' : 'Đã tắt thông báo kết bạn');
              }}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
          </label>
        </div>
      </div>

      {/* Category 3: Messages & Calls */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-[#8a8d91]">
          Tin nhắn & Cuộc gọi
        </h4>

        <div className="space-y-2">
          <div className="flex items-center justify-between p-3.5 bg-gray-50 dark:bg-[#3a3b3c]/50 rounded-xl">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-sky-100 dark:bg-sky-950/50 flex items-center justify-center text-sky-500">
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <h5 className="text-xs font-bold text-gray-800 dark:text-[#e4e6eb]">Tin nhắn trực tiếp</h5>
                <p className="text-[11px] text-gray-400">Nhận thông báo khi có tin nhắn mới gửi đến bạn</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings?.message ?? true}
                onChange={async (e) => {
                  const val = e.target.checked;
                  await updateSettings({ message: val });
                  toast.showSuccess(val ? 'Đã bật thông báo tin nhắn' : 'Đã tắt thông báo tin nhắn');
                }}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-3.5 bg-gray-50 dark:bg-[#3a3b3c]/50 rounded-xl">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-teal-100 dark:bg-teal-950/50 flex items-center justify-center text-teal-500">
                <Phone className="w-4 h-4" />
              </div>
              <div>
                <h5 className="text-xs font-bold text-gray-800 dark:text-[#e4e6eb]">Cuộc gọi đến & Cuộc gọi nhỡ</h5>
                <p className="text-[11px] text-gray-400">Thông báo khi có người gọi hoặc khi bạn bị nhỡ cuộc gọi</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings?.call ?? true}
                onChange={async (e) => {
                  const val = e.target.checked;
                  await updateSettings({ call: val });
                  toast.showSuccess(val ? 'Đã bật thông báo cuộc gọi' : 'Đã tắt thông báo cuộc gọi');
                }}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Category 4: Sound & System */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-[#8a8d91]">
          Âm thanh & Hệ thống
        </h4>

        <div className="space-y-2">
          <div className="flex items-center justify-between p-3.5 bg-gray-50 dark:bg-[#3a3b3c]/50 rounded-xl">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-950/50 flex items-center justify-center text-amber-500">
                <Volume2 className="w-4 h-4" />
              </div>
              <div>
                <h5 className="text-xs font-bold text-gray-800 dark:text-[#e4e6eb]">Âm thanh thông báo realtime</h5>
                <p className="text-[11px] text-gray-400">Phát âm thanh nhẹ (chime) khi có thông báo mới gửi tới</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => playNotificationSound()}
                className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline px-2 py-1 cursor-pointer"
              >
                Thử âm thanh
              </button>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings?.sound ?? true}
                  onChange={async (e) => {
                    const val = e.target.checked;
                    await updateSettings({ sound: val });
                    if (val) playNotificationSound();
                    toast.showSuccess(val ? 'Đã bật âm thanh' : 'Đã tắt âm thanh');
                  }}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>

          <div className="flex items-center justify-between p-3.5 bg-gray-50 dark:bg-[#3a3b3c]/50 rounded-xl">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-950/50 flex items-center justify-center text-purple-500">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h5 className="text-xs font-bold text-gray-800 dark:text-[#e4e6eb]">Thông báo hệ thống & Cảnh báo</h5>
                <p className="text-[11px] text-gray-400">Các thông báo cập nhật, bảo trì và cảnh báo tài khoản</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings?.system ?? true}
                onChange={async (e) => {
                  const val = e.target.checked;
                  await updateSettings({ system: val });
                  toast.showSuccess(val ? 'Đã bật thông báo hệ thống' : 'Đã tắt thông báo hệ thống');
                }}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};
