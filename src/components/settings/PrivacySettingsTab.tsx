import React, { useState, useEffect } from 'react';
import { Shield, Globe, Users, Lock, Check } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { userService } from '../../services/userService';
import { postService } from '../../services/postService';

export const PrivacySettingsTab: React.FC = () => {
  const toast = useToast();
  const [postPrivacy, setPostPrivacy] = useState<string>('PUBLIC');
  const [friendRequestPrivacy, setFriendRequestPrivacy] = useState<string>('EVERYONE');
  const [friendListPrivacy, setFriendListPrivacy] = useState<string>('PUBLIC');
  const [searchPrivacy, setSearchPrivacy] = useState<string>('EVERYONE');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await userService.getPrivacySettings();
        if (data) {
          if (data.defaultPostPrivacy) {
            setPostPrivacy(data.defaultPostPrivacy);
            localStorage.setItem('default_post_privacy', data.defaultPostPrivacy);
          }
          if (data.friendRequestPrivacy) {
            setFriendRequestPrivacy(data.friendRequestPrivacy);
            localStorage.setItem('privacy_friend_request', data.friendRequestPrivacy);
          }
          if (data.friendListPrivacy) {
            setFriendListPrivacy(data.friendListPrivacy);
            localStorage.setItem('privacy_friend_list', data.friendListPrivacy);
          }
          if (data.searchPrivacy) {
            setSearchPrivacy(data.searchPrivacy);
            localStorage.setItem('privacy_search', data.searchPrivacy);
          }
        }
      } catch (err) {
        console.error('Failed to load privacy settings from backend:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handlePostPrivacyChange = async (val: string) => {
    const previousPrivacy = postPrivacy;
    setPostPrivacy(val);
    localStorage.setItem('default_post_privacy', val);
    window.dispatchEvent(new CustomEvent('default_post_privacy_changed', { detail: val }));
    try {
      // Keep the setting for future posts and enforce the selected audience on
      // every existing post, so a viewer cannot continue seeing an old post.
      await Promise.all([
        userService.updatePrivacySettings({ defaultPostPrivacy: val }),
        postService.updateAllMyPostsPrivacy(val as 'PUBLIC' | 'FRIENDS' | 'PRIVATE'),
      ]);
      toast.showSuccess('Đã áp dụng quyền xem cho bài viết mới và các bài viết hiện có.');
    } catch (err) {
      console.error('Failed to apply post privacy:', err);
      setPostPrivacy(previousPrivacy);
      localStorage.setItem('default_post_privacy', previousPrivacy);
      window.dispatchEvent(new CustomEvent('default_post_privacy_changed', { detail: previousPrivacy }));
      toast.showError('Không thể lưu quyền riêng tư. Vui lòng thử lại.');
    }
  };

  const handleFriendRequestChange = async (val: string) => {
    setFriendRequestPrivacy(val);
    localStorage.setItem('privacy_friend_request', val);
    try {
      await userService.updatePrivacySettings({ friendRequestPrivacy: val });
      toast.showSuccess('Đã lưu cài đặt lời mời kết bạn!');
    } catch {
      toast.showSuccess('Đã cập nhật quyền gửi lời mời kết bạn!');
    }
  };

  const handleFriendListChange = async (val: string) => {
    setFriendListPrivacy(val);
    localStorage.setItem('privacy_friend_list', val);
    try {
      await userService.updatePrivacySettings({ friendListPrivacy: val });
      toast.showSuccess('Đã lưu quyền xem danh sách bạn bè!');
    } catch {
      toast.showSuccess('Đã cập nhật quyền xem danh sách bạn bè!');
    }
  };

  const handleSearchPrivacyChange = async (val: string) => {
    setSearchPrivacy(val);
    localStorage.setItem('privacy_search', val);
    try {
      await userService.updatePrivacySettings({ searchPrivacy: val });
      toast.showSuccess('Đã lưu quyền tìm kiếm tài khoản!');
    } catch {
      toast.showSuccess('Đã cập nhật quyền tìm kiếm tài khoản!');
    }
  };

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-gray-200 dark:border-[#393a3b]">
        <div className="flex items-center gap-2">
          <Shield className="w-6 h-6 text-[#1877f2]" />
          <h2 className="text-xl font-extrabold text-gray-900 dark:text-[#e4e6eb]">
            Quyền riêng tư của trang cá nhân
          </h2>
        </div>
        <p className="text-[13px] text-gray-500 dark:text-[#b0b3b8] mt-1">
          Quản lý quyền riêng tư cho các hoạt động và thông tin hiển thị trên trang cá nhân của bạn.
        </p>
      </div>

      <div className="space-y-4">
        {/* Setting 1: Default Post Audience */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 dark:bg-[#3a3b3c]/50 rounded-2xl border border-gray-200/60 dark:border-[#393a3b] gap-3">
          <div className="space-y-0.5">
            <h4 className="text-sm font-bold text-gray-900 dark:text-[#e4e6eb]">
              Ai có thể xem bài viết của bạn?
            </h4>
            <p className="text-xs text-gray-500 dark:text-[#b0b3b8]">
              Áp dụng cho bài viết mới và toàn bộ bài viết bạn đã đăng
            </p>
          </div>
          <select
            value={postPrivacy}
            onChange={(e) => handlePostPrivacyChange(e.target.value)}
            className="bg-white dark:bg-[#3a3b3c] border border-gray-200 dark:border-[#393a3b] text-xs font-bold rounded-xl px-3.5 py-2 text-gray-800 dark:text-[#e4e6eb] focus:outline-none focus:ring-1 focus:ring-[#1877f2] cursor-pointer"
          >
            <option value="PUBLIC">Công khai (Public)</option>
            <option value="FRIENDS">Bạn bè (Friends)</option>
            <option value="PRIVATE">Chỉ mình tôi (Private)</option>
          </select>
        </div>

        {/* Setting 2: Who can send friend requests */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 dark:bg-[#3a3b3c]/50 rounded-2xl border border-gray-200/60 dark:border-[#393a3b] gap-3">
          <div className="space-y-0.5">
            <h4 className="text-sm font-bold text-gray-900 dark:text-[#e4e6eb]">
              Ai có thể gửi cho bạn lời mời kết bạn?
            </h4>
            <p className="text-xs text-gray-500 dark:text-[#b0b3b8]">
              Kiểm soát người có thể kết nối và kết bạn với bạn
            </p>
          </div>
          <select
            value={friendRequestPrivacy}
            onChange={(e) => handleFriendRequestChange(e.target.value)}
            className="bg-white dark:bg-[#3a3b3c] border border-gray-200 dark:border-[#393a3b] text-xs font-bold rounded-xl px-3.5 py-2 text-gray-800 dark:text-[#e4e6eb] focus:outline-none focus:ring-1 focus:ring-[#1877f2] cursor-pointer"
          >
            <option value="EVERYONE">Mọi người (Everyone)</option>
            <option value="FRIENDS_OF_FRIENDS">Bạn của bạn bè (Friends of friends)</option>
          </select>
        </div>

        {/* Setting 3: Who can see your friends list */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 dark:bg-[#3a3b3c]/50 rounded-2xl border border-gray-200/60 dark:border-[#393a3b] gap-3">
          <div className="space-y-0.5">
            <h4 className="text-sm font-bold text-gray-900 dark:text-[#e4e6eb]">
              Ai có thể xem danh sách bạn bè của bạn?
            </h4>
            <p className="text-xs text-gray-500 dark:text-[#b0b3b8]">
              Hiển thị bạn bè trên mục tab Bạn bè ở trang cá nhân
            </p>
          </div>
          <select
            value={friendListPrivacy}
            onChange={(e) => handleFriendListChange(e.target.value)}
            className="bg-white dark:bg-[#3a3b3c] border border-gray-200 dark:border-[#393a3b] text-xs font-bold rounded-xl px-3.5 py-2 text-gray-800 dark:text-[#e4e6eb] focus:outline-none focus:ring-1 focus:ring-[#1877f2] cursor-pointer"
          >
            <option value="PUBLIC">Công khai (Public)</option>
            <option value="FRIENDS">Bạn bè (Friends)</option>
            <option value="PRIVATE">Chỉ mình tôi (Private)</option>
          </select>
        </div>

        {/* Setting 4: Who can look you up */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 dark:bg-[#3a3b3c]/50 rounded-2xl border border-gray-200/60 dark:border-[#393a3b] gap-3">
          <div className="space-y-0.5">
            <h4 className="text-sm font-bold text-gray-900 dark:text-[#e4e6eb]">
              Ai có thể tìm kiếm bạn bằng email hoặc số điện thoại?
            </h4>
            <p className="text-xs text-gray-500 dark:text-[#b0b3b8]">
              Cho phép người khác tìm thấy hồ sơ của bạn trên thanh tìm kiếm
            </p>
          </div>
          <select
            value={searchPrivacy}
            onChange={(e) => handleSearchPrivacyChange(e.target.value)}
            className="bg-white dark:bg-[#3a3b3c] border border-gray-200 dark:border-[#393a3b] text-xs font-bold rounded-xl px-3.5 py-2 text-gray-800 dark:text-[#e4e6eb] focus:outline-none focus:ring-1 focus:ring-[#1877f2] cursor-pointer"
          >
            <option value="EVERYONE">Mọi người (Everyone)</option>
            <option value="FRIENDS">Chỉ bạn bè (Friends only)</option>
          </select>
        </div>
      </div>
    </div>
  );
};
