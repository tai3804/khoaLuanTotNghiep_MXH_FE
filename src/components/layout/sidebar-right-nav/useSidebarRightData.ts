import { useState, useEffect } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { ChatUser } from '../../chat/ChatBox';
import { userService } from '../../../services/api';

export const useSidebarRightData = () => {
  const { t } = useLanguage();
  const [contacts, setContacts] = useState<ChatUser[]>([]);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [contactSearch, setContactSearch] = useState('');
  const [showSearchInput, setShowSearchInput] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const fetchData = async (silent = false) => {
      if (!silent) setLoading(true);
      try {
        const [friends, requests] = await Promise.all([
          userService.getFriends().catch(() => []),
          userService.getPendingRequests().catch(() => []),
        ]);
        setContacts(Array.isArray(friends) ? friends : []);
        setPendingRequests(Array.isArray(requests) ? requests : []);
      } catch {
        if (!silent) setContacts([]);
      } finally {
        if (!silent) setLoading(false);
      }
    };

    fetchData(false);

    const interval = setInterval(() => {
      fetchData(true);
    }, 4000);

    const handleFriendUpdate = () => fetchData(true);
    window.addEventListener('friend_status_updated', handleFriendUpdate);

    return () => {
      clearInterval(interval);
      window.removeEventListener('friend_status_updated', handleFriendUpdate);
    };
  }, []);

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
    contacts,
    pendingRequests,
    loading,
    contactSearch,
    setContactSearch,
    showSearchInput,
    setShowSearchInput,
    filteredContacts,
    handleAccept,
    handleReject,
  };
};
