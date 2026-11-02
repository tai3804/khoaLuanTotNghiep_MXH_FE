import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useTheme } from '../../../context/ThemeContext';
import { useLanguage } from '../../../context/LanguageContext';
import { useNotification } from '../../../context/NotificationContext';
import { useChat } from '../../../context/ChatContext';
import { userService, postService, groupService } from '../../../services/api';
import { ChatUser } from '../../../components/chat/chat-box';

interface UseHeaderDataProps {
  onTabChange?: (tab: string) => void;
}


export const useHeaderData = ({ onTabChange }: UseHeaderDataProps) => {
  const { user, isAuthenticated, logout, openLoginModal } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const { unreadCount } = useNotification();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{ users: any[]; posts: any[]; groups: any[] }>({ users: [], posts: [], groups: [] });
  const [searching, setSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showMsgMenu, setShowMsgMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const {
    conversations: chatContacts,
    loadingConversations: loadingChatContacts,
    totalUnreadCount: messageUnreadCount,
  } = useChat();
  const [msgSearch, setMsgSearch] = useState('');
  const [msgSearchResults, setMsgSearchResults] = useState<ChatUser[]>([]);
  const [msgSearching, setMsgSearching] = useState(false);
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
      setSearchResults({ users: [], posts: [], groups: [] });
      setShowSearchResults(false);
      return;
    }
    const timer = setTimeout(async () => {
      setSearching(true);
      setShowSearchResults(true);
      try {
        const [users, posts, groups] = await Promise.all([
          userService.searchUsers(searchQuery.trim()).catch(() => []),
          postService.searchPosts ? postService.searchPosts(searchQuery.trim()).catch(() => []) : Promise.resolve([]),
          groupService.searchGroups(searchQuery.trim()).catch(() => []),
        ]);
        setSearchResults({
          users: Array.isArray(users) ? users : [],
          posts: Array.isArray(posts) ? posts : [],
          groups: Array.isArray(groups) ? groups : [],
        });
      } catch {
        setSearchResults({ users: [], posts: [], groups: [] });
      } finally {
        setSearching(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Messenger search API effect with debounce
  useEffect(() => {
    if (!msgSearch.trim()) {
      setMsgSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setMsgSearching(true);
      try {
        const users = await userService.searchUsers(msgSearch.trim());
        if (Array.isArray(users)) {
          const formattedUsers = users.map((u: any) => {
            const uid = String(u.userId || u.id);
            const nameParts = [u.lastName, u.middleName, u.firstName].filter(Boolean);
            const name = u.fullName || (nameParts.length > 0 ? nameParts.join(' ').trim() : u.username) || 'Người dùng';
            const avatar = u.avatarUrl || u.avatar || '/default-avatar.png';
            return {
              id: uid,
              userId: uid,
              name,
              avatar,
              online: false,
              status: 'ACCEPTED'
            } as ChatUser;
          });
          setMsgSearchResults(formattedUsers);
        } else {
          setMsgSearchResults([]);
        }
      } catch {
        setMsgSearchResults([]);
      } finally {
        setMsgSearching(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [msgSearch]);

  // Fetch pending friend requests on mount & on friend update event
  useEffect(() => {
    if (!isAuthenticated) return;
    const fetchPending = async () => {
      try {
        const reqs = await userService.getPendingRequests();
        setPendingReqCount(Array.isArray(reqs) ? reqs.length : 0);
      } catch {}
    };

    fetchPending();
    const handleFriendUpdate = () => fetchPending();
    window.addEventListener('friend_status_updated', handleFriendUpdate);

    return () => {
      window.removeEventListener('friend_status_updated', handleFriendUpdate);
    };
  }, [isAuthenticated]);

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
    messageUnreadCount,
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
    msgSearchResults,
    msgSearching,
    pendingReqCount,
    userMenuRef,
    msgMenuRef,
    searchRef,
    notifMenuRef,
    handleNavClick,
  };
};
