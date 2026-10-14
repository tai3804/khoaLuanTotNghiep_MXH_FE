import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useLanguage } from '../../../context/LanguageContext';
import {
  Home,
  Users,
  Bookmark,
  Tv,
  Users2,
  Settings,
  ShieldCheck,
  HelpCircle,
  BarChart3,
} from 'lucide-react';

interface UseSidebarLeftDataProps {
  activeFilter?: string;
  onFilterChange?: (filter: string) => void;
  onNavigateSettings?: () => void;
}

export const useSidebarLeftData = ({
  activeFilter = 'all',
  onFilterChange,
  onNavigateSettings,
}: UseSidebarLeftDataProps) => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { t, language } = useLanguage();
  const isEn = language === 'en';

  const isExtendedFilter = ['support', 'settings', 'moderation', 'creator-dashboard'].includes(activeFilter);

  const [showMore, setShowMore] = useState<boolean>(() => {
    try {
      if (isExtendedFilter) return true;
      const saved = localStorage.getItem('kltn_sidebar_left_show_more');
      if (saved !== null) return saved === 'true';
    } catch {}
    return isExtendedFilter;
  });

  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('kltn_sidebar_left_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  // Auto expand if active filter is an extended item
  useEffect(() => {
    if (isExtendedFilter && !showMore) {
      setShowMore(true);
      try {
        localStorage.setItem('kltn_sidebar_left_show_more', 'true');
      } catch {}
    }
  }, [activeFilter, isExtendedFilter]);

  // Sync across tabs/windows
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'kltn_sidebar_left_collapsed' && e.newValue !== null) {
        setIsCollapsed(e.newValue === 'true');
      }
      if (e.key === 'kltn_sidebar_left_show_more' && e.newValue !== null) {
        setShowMore(e.newValue === 'true' || isExtendedFilter);
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [isExtendedFilter]);

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('kltn_sidebar_left_collapsed', String(next));
      } catch {}
      return next;
    });
  };

  const toggleShowMore = () => {
    setShowMore((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('kltn_sidebar_left_show_more', String(next));
      } catch {}
      return next;
    });
  };

  const canModerate = useMemo(() => {
    const allRoles = (user?.roles || []).map((r) => String(r).toUpperCase());
    return allRoles.some(
      (role) =>
        role === 'ROLE_MODERATOR' ||
        role === 'MODERATOR' ||
        role === 'ROLE_ADMIN' ||
        role === 'ADMIN'
    );
  }, [user]);

  const isProfessional = Boolean(
    (user as any)?.isProfessionalMode ||
    localStorage.getItem('kltn_prof_mode_enabled') === 'true'
  );

  // Core navigation items
  const homeItem = {
    id: 'home',
    label: t('nav.home') || 'Trang chủ',
    iconNode: (
      <div className="w-8 h-8 rounded-full bg-[#1877f2] flex items-center justify-center text-white shadow-sm">
        <Home className="w-4 h-4" />
      </div>
    ),
  };

  const watchItem = {
    id: 'watch',
    label: 'Video',
    iconNode: (
      <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-sm">
        <Tv className="w-4 h-4" />
      </div>
    ),
  };

  const friendsItem = {
    id: 'friends',
    label: t('friends') || 'Bạn bè',
    iconNode: (
      <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white shadow-sm">
        <Users className="w-4 h-4" />
      </div>
    ),
  };

  const groupsItem = {
    id: 'groups',
    label: t('nav.groups') || (isEn ? 'Groups' : 'Nhóm'),
    iconNode: (
      <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white shadow-sm">
        <Users2 className="w-4 h-4" />
      </div>
    ),
  };

  // Moderator / Admin special items (placed right below Home)
  const moderationItem = {
    id: 'moderation',
    label: t('sidebar.moderationCenter') || (isEn ? 'Moderation Center' : 'Trung tâm kiểm duyệt'),
    iconNode: (
      <div className="w-8 h-8 rounded-full bg-rose-600 flex items-center justify-center text-white shadow-sm">
        <ShieldCheck className="w-4 h-4" />
      </div>
    ),
  };

  const moderationAppealsItem = {
    id: 'moderation-appeals',
    label: t('sidebar.pendingAppeals') || (isEn ? 'Pending Appeals' : 'Kháng nghị chờ xử lý'),
    iconNode: (
      <div className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center text-white shadow-sm">
        <HelpCircle className="w-4 h-4" />
      </div>
    ),
  };

  // Creator Dashboard item (placed right below Home / Moderation)
  const creatorDashboardItem = {
    id: 'creator-dashboard',
    label: t('sidebar.professionalDashboard') || (isEn ? 'Professional Dashboard' : 'Bảng điều khiển chuyên nghiệp'),
    iconNode: (
      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-sm">
        <BarChart3 className="w-4 h-4" />
      </div>
    ),
  };

  // Secondary items (placed below user core choices)
  const savedItem = {
    id: 'saved',
    label: t('saved') || 'Đã lưu',
    iconNode: (
      <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white shadow-sm">
        <Bookmark className="w-4 h-4" />
      </div>
    ),
  };

  const supportItem = {
    id: 'support',
    label: t('sidebar.supportInbox') || (isEn ? 'Support Inbox' : 'Hộp thư hỗ trợ'),
    iconNode: (
      <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white shadow-sm">
        <HelpCircle className="w-4 h-4" />
      </div>
    ),
  };

  const settingsItem = {
    id: 'settings',
    label: t('settings') || 'Cài đặt & quyền riêng tư',
    iconNode: (
      <div className="w-8 h-8 rounded-full bg-gray-500 dark:bg-[#4e4f50] flex items-center justify-center text-white shadow-sm">
        <Settings className="w-4 h-4" />
      </div>
    ),
  };

  // Build items based on collapsed state:
  // When collapsed: exactly 4 nav items (Home, Video, Friends, Groups) which combine with Profile = 5 default items.
  // When expanded: Home -> [Moderation if mod] -> [Dashboard if pro] -> Video -> Friends -> Groups -> Other items below.
  let primaryItems: any[] = [];
  let secondaryItems: any[] = [];

  if (isCollapsed) {
    primaryItems = [homeItem, watchItem, friendsItem, groupsItem];
    secondaryItems = [];
  } else {
    const mainExpanded: any[] = [homeItem];
    if (canModerate) {
      mainExpanded.push(moderationItem, moderationAppealsItem);
    }
    if (isProfessional) {
      mainExpanded.push(creatorDashboardItem);
    }
    mainExpanded.push(watchItem, friendsItem, groupsItem);

    primaryItems = mainExpanded;
    secondaryItems = [savedItem];
    if (!canModerate) {
      secondaryItems.push(supportItem);
    }
    secondaryItems.push(settingsItem);
  }

  const handleItemClick = (id: string) => {
    if (id === 'settings' && onNavigateSettings) {
      onNavigateSettings();
      return;
    }
    if (id === 'creator-dashboard') {
      navigate('/profile/creator-dashboard');
      return;
    }
    if (onFilterChange) {
      onFilterChange(id);
    }
  };

  return {
    user,
    isAuthenticated,
    showMore,
    isCollapsed,
    toggleCollapse,
    toggleShowMore,
    primaryItems,
    secondaryItems,
    handleItemClick,
  };
};
