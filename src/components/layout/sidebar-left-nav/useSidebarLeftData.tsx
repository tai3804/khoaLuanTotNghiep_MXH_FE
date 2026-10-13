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
  const { t } = useLanguage();

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

  // Sync across tabs/components
  useEffect(() => {
    const handleStorage = () => {
      try {
        const collapsedVal = localStorage.getItem('kltn_sidebar_left_collapsed') === 'true';
        setIsCollapsed(collapsedVal);
        const showMoreVal = localStorage.getItem('kltn_sidebar_left_show_more') === 'true';
        setShowMore(showMoreVal || isExtendedFilter);
      } catch {}
    };
    window.addEventListener('sidebar_state_changed', handleStorage);
    return () => window.removeEventListener('sidebar_state_changed', handleStorage);
  }, [isExtendedFilter]);

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('kltn_sidebar_left_collapsed', String(next));
        window.dispatchEvent(new Event('sidebar_state_changed'));
      } catch {}
      return next;
    });
  };

  const toggleShowMore = () => {
    setShowMore((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('kltn_sidebar_left_show_more', String(next));
        window.dispatchEvent(new Event('sidebar_state_changed'));
      } catch {}
      return next;
    });
  };

  // Full Facebook menu items with unified w-8 h-8 rounded-full icons
  const menuItems = [
    {
      id: 'home',
      label: t('nav.home') || 'Trang chủ',
      iconNode: (
        <div className="w-8 h-8 rounded-full bg-[#1877f2] flex items-center justify-center text-white shadow-sm">
          <Home className="w-4 h-4" />
        </div>
      ),
    },
    {
      id: 'friends',
      label: t('friends') || 'Bạn bè',
      iconNode: (
        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white shadow-sm">
          <Users className="w-4 h-4" />
        </div>
      ),
    },
    {
      id: 'groups',
      label: 'Nhóm',
      iconNode: (
        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white shadow-sm">
          <Users2 className="w-4 h-4" />
        </div>
      ),
    },
    {
      id: 'watch',
      label: 'Video',
      iconNode: (
        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-sm">
          <Tv className="w-4 h-4" />
        </div>
      ),
    },
    {
      id: 'saved',
      label: t('saved') || 'Đã lưu',
      iconNode: (
        <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white shadow-sm">
          <Bookmark className="w-4 h-4" />
        </div>
      ),
    },
    {
      id: 'support',
      label: 'Hộp thư hỗ trợ',
      iconNode: (
        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white shadow-sm">
          <HelpCircle className="w-4 h-4" />
        </div>
      ),
    },
    {
      id: 'settings',
      label: t('settings') || 'Cài đặt & quyền riêng tư',
      iconNode: (
        <div className="w-8 h-8 rounded-full bg-gray-500 dark:bg-[#4e4f50] flex items-center justify-center text-white shadow-sm">
          <Settings className="w-4 h-4" />
        </div>
      ),
    },
  ];

  const isProfessional = Boolean(
    (user as any)?.isProfessionalMode ||
    localStorage.getItem('kltn_prof_mode_enabled') === 'true'
  );

  if (isProfessional) {
    menuItems.splice(5, 0, {
      id: 'creator-dashboard',
      label: 'Bảng điều khiển chuyên nghiệp',
      iconNode: (
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-sm">
          <BarChart3 className="w-4 h-4" />
        </div>
      ),
    });
  }

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

  if (canModerate) {
    // Moderator/Admin uses the dedicated moderation work queue. Support Inbox
    // is reserved for regular users appealing decisions on their own content.
    const supportIndex = menuItems.findIndex((item) => item.id === 'support');
    if (supportIndex >= 0) menuItems.splice(supportIndex, 1);
    menuItems.splice(2, 0, {
      id: 'moderation',
      label: 'Trung tâm kiểm duyệt',
      iconNode: (
        <div className="w-8 h-8 rounded-full bg-rose-600 flex items-center justify-center text-white shadow-sm">
          <ShieldCheck className="w-4 h-4" />
        </div>
      ),
    });
    menuItems.splice(3, 0, {
      id: 'moderation-appeals', label: 'Kháng nghị chờ xử lý',
      iconNode: <div className="w-9 h-9 rounded-full bg-violet-600 flex items-center justify-center text-white shadow-sm"><HelpCircle className="w-5 h-5" /></div>,
    });
  }

  const primaryLimit = (canModerate ? 6 : 5) + (isProfessional ? 1 : 0);
  const primaryItems = menuItems.slice(0, primaryLimit);
  const secondaryItems = menuItems.slice(primaryLimit);

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
