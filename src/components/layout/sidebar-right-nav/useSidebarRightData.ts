import { useState, useEffect } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { useAuth } from '../../../context/AuthContext';
import { ChatUser } from '../../../components/chat/chat-box';
import { userService } from '../../../services/api';
import { chatService } from '../../../services/chatService';
import { websocketService } from '../../../services/websocket';
import { PendingFriendRequestItem } from './types';

export const useSidebarRightData = () => {
  const { t, language } = useLanguage();
  const isEn = language === 'en';
  const { isAuthenticated, tokens } = useAuth();

  const [contacts, setContacts] = useState<ChatUser[]>([]);
  const [groupChats, setGroupChats] = useState<ChatUser[]>([]);
  const [pendingRequests, setPendingRequests] = useState<PendingFriendRequestItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [contactSearch, setContactSearch] = useState('');
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);

  useEffect(() => {
    if (isAuthenticated && tokens?.accessToken) {
      websocketService.connect();
    }
  }, [isAuthenticated, tokens?.accessToken]);

  useEffect(() => {
    if (!isAuthenticated) {
      setContacts([]);
      setPendingRequests([]);
      setGroupChats([]);
      return;
    }

    const fetchData = async (silent = false) => {
      if (!silent) setLoading(true);
      try {
        const [friends, requests] = await Promise.all([
          userService.getFriends().catch(() => []),
          userService.getPendingRequests().catch(() => []),
        ]);

        const friendsList = Array.isArray(friends) ? friends : [];
        const friendIds = friendsList.map((f: any) => f.userId || f.id).filter(Boolean);

        let presenceMap: Record<string, any> = {};
        if (friendIds.length > 0) {
          try {
            presenceMap = await chatService.getBatchPresence(friendIds);
          } catch {}
        }

        const mappedContacts: ChatUser[] = friendsList.map((f: any) => {
          const fId = f.userId || f.id;
          const presence = fId ? presenceMap[fId] : null;
          return {
            ...f,
            id: fId,
            userId: fId,
            online: presence ? Boolean(presence.online) : false,
            lastActiveAt: presence?.lastActiveAt || null,
          };
        });

        setContacts(mappedContacts);
        setPendingRequests(Array.isArray(requests) ? requests : []);
      } catch {
        if (!silent) setContacts([]);
      } finally {
        if (!silent) setLoading(false);
      }
    };

    const fetchGroupChats = async () => {
      try {
        const convs = await chatService.getConversations();
        if (Array.isArray(convs)) {
          const groups: ChatUser[] = convs
            .filter((c: any) => c.type === 'GROUP')
            .map((c: any) => ({
              id: c.conversationId,
              conversationId: c.conversationId,
              isGroup: true,
              name: c.name || 'Nhóm chat',
              avatar: c.avatarUrl || '/default-avatar.png',
              online: false,
              lastMessageContent: c.lastMessageContent,
              unreadCount: Number(c.unreadCount || 0),
            }));
          setGroupChats(groups);
        }
      } catch (err) {
        console.error('[SidebarRight] Error loading group chats', err);
      }
    };

    fetchData(false);
    fetchGroupChats();

    const handleFriendUpdate = () => fetchData(true);
    const handleGroupUpdate = () => fetchGroupChats();
    window.addEventListener('friend_status_updated', handleFriendUpdate);
    window.addEventListener('group_chat_created', handleGroupUpdate);
    window.addEventListener('group_chat_updated', handleGroupUpdate);

    const handlePresence = (e: any) => {
      const detail = e.detail;
      if (!detail || !detail.userId) return;
      setContacts((prev) =>
        prev.map((c) => {
          const cId = c.userId || c.id;
          if (cId && String(cId).toLowerCase() === String(detail.userId).toLowerCase()) {
            return {
              ...c,
              online: Boolean(detail.online),
              lastActiveAt: detail.lastActiveAt || c.lastActiveAt,
            };
          }
          return c;
        })
      );
    };
    window.addEventListener('user_presence_updated', handlePresence);

    return () => {
      window.removeEventListener('friend_status_updated', handleFriendUpdate);
      window.removeEventListener('group_chat_created', handleGroupUpdate);
      window.removeEventListener('group_chat_updated', handleGroupUpdate);
      window.removeEventListener('user_presence_updated', handlePresence);
    };
  }, [isAuthenticated, tokens?.accessToken]);

  const handleAccept = async (requestId: string) => {
    try {
      await userService.acceptFriendRequest(requestId);
      setPendingRequests((prev) => prev.filter((r) => r.id !== requestId));
      window.dispatchEvent(new Event('friend_status_updated'));
    } catch {}
  };

  const handleReject = async (requestId: string) => {
    try {
      await userService.rejectFriendRequest(requestId);
      setPendingRequests((prev) => prev.filter((r) => r.id !== requestId));
      window.dispatchEvent(new Event('friend_status_updated'));
    } catch {}
  };

  const filteredContacts = contactSearch.trim()
    ? contacts.filter((c) => c.name?.toLowerCase().includes(contactSearch.toLowerCase()))
    : contacts;

  return {
    t,
    isEn,
    contacts,
    groupChats,
    pendingRequests,
    loading,
    contactSearch,
    setContactSearch,
    showSearchInput,
    setShowSearchInput,
    showCreateGroupModal,
    setShowCreateGroupModal,
    filteredContacts,
    handleAccept,
    handleReject,
  };
};
