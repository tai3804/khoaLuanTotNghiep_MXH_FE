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