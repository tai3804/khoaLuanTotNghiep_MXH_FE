import React, { createContext, useContext, useState } from 'react';
import { Language, LanguageContextType } from '../types';

const translations = {
  vi: {
    'nav.search': 'Tìm kiếm...',
    'nav.home': 'Trang chủ',
    'nav.watch': 'Watch',
    'nav.marketplace': 'Marketplace',
    'nav.groups': 'Nhóm',
    'nav.gaming': 'Gaming',
    searchPlaceholder: 'Tìm kiếm...',
    whatsOnYourMind: 'Bạn đang nghĩ gì thế',
    photoVideo: 'Ảnh/video',
    tagFriends: 'Gắn thẻ bạn bè',
    feelingActivity: 'Cảm xúc/hoạt động',
    post: 'Đăng bài',
    createStory: 'Tạo tin',
    sponsored: 'Được tài trợ',
    contacts: 'Người liên hệ',
    friends: 'Bạn bè',
    saved: 'Đã lưu',
    memories: 'Kỷ niệm',
    video: 'Video',
    marketplace: 'Marketplace',
    events: 'Sự kiện',
    seeMore: 'Xem thêm',
    login: 'Đăng nhập',
    register: 'Đăng ký',
    logout: 'Đăng xuất',
    like: 'Thích',
    comment: 'Bình luận',
    share: 'Chia sẻ',
    comments: 'bình luận',
    shares: 'chia sẻ',
    writeComment: 'Viết bình luận...',
    send: 'Gửi',
    usernameOrEmail: 'Tên đăng nhập hoặc Email',
    password: 'Mật khẩu',
    fullName: 'Họ và tên',
    email: 'Email',
    username: 'Tên đăng nhập',
    dontHaveAccount: 'Chưa có tài khoản? Đăng ký ngay',
    alreadyHaveAccount: 'Đã có tài khoản? Đăng nhập ngay',
    authTitle: 'Kết Nối Với Bạn Bè Và Thế Giới Xung Quanh',
    authSubTitle: 'Mạng xã hội thế hệ mới dành cho học tập, làm việc và giải trí.',
    confirmPassword: 'Xác nhận mật khẩu',
    passwordsDoNotMatch: 'Mật khẩu xác nhận không khớp!',
    loginSuccess: 'Đăng nhập thành công!',
    registerSuccess: 'Đăng ký tài khoản thành công! Vui lòng đăng nhập.',
    'friends.title': 'Bạn bè',
    'friends.home': 'Trang chủ bạn bè',
    'friends.requests': 'Lời mời kết bạn',
    'friends.suggestions': 'Gợi ý kết bạn',
    'friends.allFriends': 'Tất cả bạn bè',
    'friends.followers': 'Người theo dõi',
    'friends.following': 'Đang theo dõi',
    'friends.filterPlaceholder': 'Lọc danh sách...',
    'friends.searchPlaceholder': 'Tìm kiếm bạn bè...',
    'friends.peopleYouMayKnow': 'Những người bạn có thể biết',
    'friends.suggestionsSub': 'Gợi ý dựa trên bạn bè chung và người dùng trong hệ thống',
    'friends.seeAll': 'Xem tất cả',
    'friends.noSuggestions': 'Hiện không còn gợi ý kết bạn mới',
    'friends.noSuggestionsSub': 'Bạn có thể quay lại sau để xem các gợi ý kết bạn mới.',
    'friends.noRequests': 'Không có lời mời kết bạn nào',
    'friends.noRequestsSub': 'Khi có người gửi lời mời kết bạn đến bạn, lời mời sẽ xuất hiện ở đây.',
    'friends.noFriends': 'Bạn chưa có người bạn nào',
    'friends.noFriendsSub': 'Hãy kết bạn với những người khác để cùng trò chuyện và tương tác!',
    'friends.noFollowers': 'Danh sách người theo dõi hiện đang trống',
    'friends.noFollowing': 'Danh sách đang theo dõi hiện đang trống',
    'friends.confirm': 'Xác nhận',
    'friends.delete': 'Xóa',
    'friends.addFriend': 'Thêm bạn bè',
    'friends.requestSent': 'Đã gửi lời mời',
    'friends.remove': 'Gỡ',
    'friends.message': 'Nhắn tin',
    'friends.unfriend': 'Hủy kết bạn',
    'friends.viewProfile': 'Xem trang cá nhân',

    // User Menu
    'userMenu.seeProfile': 'Xem trang cá nhân của bạn',
    'userMenu.settings': 'Cài đặt & quyền riêng tư',
    'userMenu.darkMode': 'Chế độ tối (Dark Mode)',
    'userMenu.language': 'Ngôn ngữ',
    'userMenu.on': 'Bật',
    'userMenu.off': 'Tắt',

    // Messenger
    'messenger.chats': 'Đoạn chat',
    'messenger.markRead': 'Đánh dấu đã đọc',
    'messenger.search': 'Tìm kiếm trên Messenger...',
    'messenger.loading': 'Đang tải cuộc trò chuyện...',
    'messenger.noFriends': 'Chưa có bạn bè để trò chuyện',
    'messenger.noFriendsSub': 'Kết bạn với người dùng khác để bắt đầu nhắn tin qua Messenger!',
    'messenger.clickToChat': 'Nhấn để nhắn tin ngay 👋',

    // Search
    'search.results': 'Kết quả tìm kiếm',
    'search.close': 'Đóng',
    'search.searching': 'Đang tìm kiếm...',
    'search.noResults': 'Không tìm thấy kết quả phù hợp',
    'search.people': 'MỌI NGƯỜI',
    'search.posts': 'BÀI VIẾT',
  },
  en: {
    'nav.search': 'Search...',
    'nav.home': 'Home',
    'nav.watch': 'Watch',
    'nav.marketplace': 'Marketplace',
    'nav.groups': 'Groups',
    'nav.gaming': 'Gaming',
    searchPlaceholder: 'Search...',
    whatsOnYourMind: 'What is on your mind',
    photoVideo: 'Photo/video',
    tagFriends: 'Tag friends',
    feelingActivity: 'Feeling/activity',
    post: 'Post',
    createStory: 'Create story',
    sponsored: 'Sponsored',
    contacts: 'Contacts',
    friends: 'Friends',
    saved: 'Saved',
    memories: 'Memories',
    video: 'Video',
    marketplace: 'Marketplace',
    events: 'Events',
    seeMore: 'See More',
    login: 'Log In',
    register: 'Sign Up',
    logout: 'Log Out',
    like: 'Like',
    comment: 'Comment',
    share: 'Share',
    comments: 'comments',
    shares: 'shares',
    writeComment: 'Write a comment...',
    send: 'Send',
    usernameOrEmail: 'Username or Email',
    password: 'Password',
    fullName: 'Full Name',
    email: 'Email',
    username: 'Username',
    dontHaveAccount: "Don't have an account? Sign up",
    alreadyHaveAccount: 'Already have an account? Log in',
    authTitle: 'Connect With Friends And The World Around You',
    authSubTitle: 'Next-generation social network for learning, work, and entertainment.',
    confirmPassword: 'Confirm Password',
    passwordsDoNotMatch: 'Passwords do not match!',
    loginSuccess: 'Login successful!',
    registerSuccess: 'Account registered successfully! Please log in.',
    'friends.title': 'Friends',
    'friends.home': 'Friends Home',
    'friends.requests': 'Friend Requests',
    'friends.suggestions': 'Suggestions',
    'friends.allFriends': 'All Friends',
    'friends.followers': 'Followers',
    'friends.following': 'Following',
    'friends.filterPlaceholder': 'Filter list...',
    'friends.searchPlaceholder': 'Search friends...',
    'friends.peopleYouMayKnow': 'People You May Know',
    'friends.suggestionsSub': 'Suggestions based on mutual friends and system users',
    'friends.seeAll': 'See all',
    'friends.noSuggestions': 'No new friend suggestions right now',
    'friends.noSuggestionsSub': 'You can check back later for new suggestions.',
    'friends.noRequests': 'No Friend Requests',
    'friends.noRequestsSub': 'When someone sends you a friend request, it will appear here.',
    'friends.noFriends': 'No friends yet',
    'friends.noFriendsSub': 'Connect with others to start chatting and interacting!',
    'friends.noFollowers': 'Your followers list is currently empty',
    'friends.noFollowing': 'Your following list is currently empty',
    'friends.confirm': 'Confirm',
    'friends.delete': 'Delete',
    'friends.addFriend': 'Add Friend',
    'friends.requestSent': 'Request Sent',
    'friends.remove': 'Remove',
    'friends.message': 'Message',
    'friends.unfriend': 'Unfriend',
    'friends.viewProfile': 'View Profile',

    // User Menu
    'userMenu.seeProfile': 'See your profile',
    'userMenu.settings': 'Settings & privacy',
    'userMenu.darkMode': 'Dark Mode',
    'userMenu.language': 'Language',
    'userMenu.on': 'On',
    'userMenu.off': 'Off',

    // Messenger
    'messenger.chats': 'Chats',
    'messenger.markRead': 'Mark all as read',
    'messenger.search': 'Search Messenger...',
    'messenger.loading': 'Loading chats...',
    'messenger.noFriends': 'No friends to chat with',
    'messenger.noFriendsSub': 'Add friends to start messaging on Messenger!',
    'messenger.clickToChat': 'Click to send a message 👋',

    // Search
    'search.results': 'Search Results',
    'search.close': 'Close',
    'search.searching': 'Searching...',
    'search.noResults': 'No matching results found',
    'search.people': 'PEOPLE',
    'search.posts': 'POSTS',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const stored = localStorage.getItem('language');
    return stored === 'vi' || stored === 'en' ? stored : 'vi';
  });

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key: string): string => {
    const langDict = translations[language] || translations.vi;
    return (langDict as Record<string, string>)[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
};