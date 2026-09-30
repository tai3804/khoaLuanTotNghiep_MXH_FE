import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useTheme } from '../../../context/ThemeContext';
import { useLanguage } from '../../../context/LanguageContext';
import { useNotification } from '../../../context/NotificationContext';
import { userService, postService } from '../../../services/api';
import { chatService } from '../../../services/chatService';
import { fetchAuthorProfile } from '../../../services/userService';
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
  const [searchResults, setSearchResults] = useState<{ users: any[]; posts: any[] }>({ users: [], posts: [] });
  const [searching, setSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showMsgMenu, setShowMsgMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [chatContacts, setChatContacts] = useState<ChatUser[]>([]);
  const [loadingChatContacts, setLoadingChatContacts] = useState(false);
  const [msgSearch, setMsgSearch] = useState('');
  const [msgSearchResults, setMsgSearchResults] = useState<ChatUser[]>([]);
  const [msgSearching, setMsgSearching] = useState(false);
  const [pendingReqCount, setPendingReqCount] = useState(0);
  const [messageUnreadCount, setMessageUnreadCount] = useState(0);

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

  // Fetch chat contacts (conversations) when messenger dropdown opens
  useEffect(() => {
    if (showMsgMenu && isAuthenticated) {
      setLoadingChatContacts(true);
      chatService
        .getConversations()
        .then(async (convs) => {
          if (Array.isArray(convs)) {
            // Chat service stores only member IDs for direct chats.  Hydrate
            // them from user-service so the menu shows the actual display name
            // and avatar rather than the generic fallback.
            const mapped = await Promise.all(convs.map(async (c: any) => {
              const isGroup = c.type === 'GROUP';
              const profile = !isGroup && c.otherParticipantId
                ? await fetchAuthorProfile(String(c.otherParticipantId))
                : null;
              return {
                id: isGroup ? c.conversationId : c.otherParticipantId,
                userId: c.otherParticipantId,
                conversationId: c.conversationId,
                isGroup,
                name: c.name || profile?.name || 'Người dùng',
                avatar: c.avatarUrl || profile?.avatar || '/default-avatar.png',
                online: c.isOnline || false,
                lastMessageContent: c.lastMessageContent,
                lastMessageAt: c.lastMessageAt,
                unreadCount: Number(c.unreadCount || 0),
              } as any;
            }));
            mapped.sort((left: any, right: any) => {
              const leftTime = left.lastMessageAt ? new Date(left.lastMessageAt).getTime() : 0;
              const rightTime = right.lastMessageAt ? new Date(right.lastMessageAt).getTime() : 0;
              return rightTime - leftTime;
            });
            setChatContacts(mapped);
          } else {
            setChatContacts([]);
          }
        })
        .catch(() => {
          setChatContacts([]);
        })
        .finally(() => setLoadingChatContacts(false));
    }
  }, [showMsgMenu, isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) { setMessageUnreadCount(0); return; }
    const refreshUnreadMessages = async () => {
      const conversations = await chatService.getConversations();
      setMessageUnreadCount(Array.isArray(conversations)
        ? conversations.reduce((total, conversation: any) => total + Number(conversation.unreadCount || 0), 0)
        : 0);
    };
    const handleConversationRead = (event: Event) => {
      const conversationId = (event as CustomEvent<{ conversationId?: string }>).detail?.conversationId;
      if (conversationId) {
        setChatContacts((contacts) => contacts.map((contact: any) =>
          String(contact.conversationId) === String(conversationId)
            ? { ...contact, unreadCount: 0 }
            : contact
        ));
      }
      refreshUnreadMessages();
    };
    refreshUnreadMessages();
    const timer = window.setInterval(refreshUnreadMessages, 8000);
    window.addEventListener('chat_unread_changed', refreshUnreadMessages);
    window.addEventListener('chat_conversation_read', handleConversationRead);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener('chat_unread_changed', refreshUnreadMessages);
      window.removeEventListener('chat_conversation_read', handleConversationRead);
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
