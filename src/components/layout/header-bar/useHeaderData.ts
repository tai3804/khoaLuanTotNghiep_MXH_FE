import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useTheme } from '../../../context/ThemeContext';
import { useLanguage } from '../../../context/LanguageContext';
import { useNotification } from '../../../context/NotificationContext';
import { userService, postService } from '../../../services/api';
import { ChatUser } from '../../chat/ChatBox';

interface UseHeaderDataProps {
  onTabChange?: (tab: string) => void;
}

export const useHeaderData = ({ onTabChange }: UseHeaderDataProps) => {
  const { user, isAuthenticated, logout, openLoginModal } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const { unreadCount } = useNotification();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{ users: any[]; posts: any[] }>({ users: [], posts: [] });
  const [searching, setSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showMsgMenu, setShowMsgMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [chatContacts, setChatContacts] = useState<ChatUser[]>([]);
  const [loadingChatContacts, setLoadingChatContacts] = useState(false);
  const [msgSearch, setMsgSearch] = useState('');
  const [pendingReqCount, setPendingReqCount] = useState(0);

  const userMenuRef = useRef<HTMLDivElement>(null);
  const msgMenuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const notifMenuRef = useRef<HTMLDivElement>(null);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (userMenuRef.current && !userMenuRef.current.contains(target)) {
        setShowUserMenu(false);
      }
      if (msgMenuRef.current && !msgMenuRef.current.contains(target)) {
        setShowMsgMenu(false);
      }
      if (searchRef.current && !searchRef.current.contains(target)) {
        setShowSearchResults(false);
      }
      if (notifMenuRef.current && !notifMenuRef.current.contains(target)) {
        setShowNotifMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Search API effect with debounce
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults({ users: [], posts: [] });
      setShowSearchResults(false);
      return;
    }
    const timer = setTimeout(async () => {
      setSearching(true);
      setShowSearchResults(true);
      try {
        const [users, posts] = await Promise.all([
          userService.searchUsers(searchQuery.trim()).catch(() => []),
          postService.searchPosts ? postService.searchPosts(searchQuery.trim()).catch(() => []) : Promise.resolve([]),
        ]);
        setSearchResults({
          users: Array.isArray(users) ? users : [],
          posts: Array.isArray(posts) ? posts : [],
        });
      } catch {
        setSearchResults({ users: [], posts: [] });
      } finally {
        setSearching(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch pending friend requests
  useEffect(() => {
    if (!isAuthenticated) return;
    const fetchPending = async () => {
      try {
        const reqs = await userService.getPendingRequests();
        setPendingReqCount(Array.isArray(reqs) ? reqs.length : 0);
      } catch {}
    };

    fetchPending();
    const timer = setInterval(fetchPending, 4000);
    const handleFriendUpdate = () => fetchPending();
    window.addEventListener('friend_status_updated', handleFriendUpdate);

    return () => {
      clearInterval(timer);
      window.removeEventListener('friend_status_updated', handleFriendUpdate);
    };
  }, [isAuthenticated]);

  // Fetch chat contacts when messenger dropdown opens
  useEffect(() => {
    if (showMsgMenu && isAuthenticated) {
      setLoadingChatContacts(true);
      userService
        .getFriends()
        .then((friends) => {
          setChatContacts(Array.isArray(friends) ? friends : []);
        })
        .catch(() => {
          setChatContacts([]);
        })
        .finally(() => setLoadingChatContacts(false));
    }
  }, [showMsgMenu, isAuthenticated]);

  const handleNavClick = (tab: string) => {
    if (onTabChange) onTabChange(tab);
  };

  return {
    user,
    isAuthenticated,
    logout,
    openLoginModal,
    theme,
    toggleTheme,
    language,
    setLanguage,
    t,
    unreadCount,
    searchQuery,
    setSearchQuery,
    searchResults,
    searching,
    showSearchResults,
    setShowSearchResults,
    showNotifMenu,
    setShowNotifMenu,
    showMsgMenu,
    setShowMsgMenu,
    showUserMenu,
    setShowUserMenu,
    chatContacts,
    loadingChatContacts,
    msgSearch,
    setMsgSearch,
    pendingReqCount,
    userMenuRef,
    msgMenuRef,
    searchRef,
    notifMenuRef,
    handleNavClick,
  };
};
