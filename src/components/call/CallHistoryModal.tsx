import React, { useState, useEffect, useMemo } from 'react';
import { useCall } from '../../context/CallContext';
import { callService, CallHistoryItem } from '../../services/callService';
import { userService } from '../../services/userService';
import { useAuth } from '../../context/AuthContext';
import {
  CallHistoryHeader,
  CallHistoryTabs,
  CallHistoryItemRow,
  CallHistoryEmptyState,
  CallHistoryLoadingState,
} from './call-history';

const formatDuration = (seconds: number): string => {
  if (!seconds || seconds <= 0) return '0s';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins > 0) {
    return `${mins} phút ${secs > 0 ? `${secs}s` : ''}`;
  }
  return `${secs}s`;
};

const formatCallTime = (dateStr?: string): string => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '';
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();

  const timePart = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  if (isToday) {
    return `Hôm nay lúc ${timePart}`;
  }
  return `${date.toLocaleDateString([], { day: '2-digit', month: '2-digit' })} lúc ${timePart}`;
};

export const CallHistoryModal: React.FC = () => {
  const { isCallHistoryOpen, setIsCallHistoryOpen, startCall } = useCall();
  const { user } = useAuth();

  const [history, setHistory] = useState<CallHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'missed'>('all');
  const [userProfiles, setUserProfiles] = useState<Record<string, any>>({});

  useEffect(() => {
    if (!isCallHistoryOpen) return;

    const fetchHistory = async () => {
      setLoading(true);
      try {
        const res = await callService.getCallHistory(1, 30);
        const items = res.content || [];
        setHistory(items);

        // Fetch user profiles for participants
        const otherUserIds = new Set<string>();
        items.forEach((item) => {
          if (item.hostUserId && item.hostUserId !== user?.id) {
            otherUserIds.add(item.hostUserId);
          }
          if (item.participantUserIds) {
            item.participantUserIds.forEach((pId) => {
              if (pId !== user?.id) otherUserIds.add(pId);
            });
          }
        });

        const profilePromises = Array.from(otherUserIds).map(async (uid) => {
          try {
            const prof = await userService.getUserProfile(uid);
            return { uid, prof };
          } catch {
            return { uid, prof: null };
          }
        });

        const profiles = await Promise.all(profilePromises);
        const map: Record<string, any> = {};
        profiles.forEach(({ uid, prof }) => {
          if (prof) map[uid] = prof;
        });
        setUserProfiles(map);
      } catch (err) {
        console.error('[CallHistoryModal] Error fetching history:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [isCallHistoryOpen, user?.id]);

  const missedCount = useMemo(() => {
    return history.filter(
      (item) => item.status === 'MISSED' || item.myStatus === 'DECLINED'
    ).length;
  }, [history]);

  const filteredHistory = useMemo(() => {
    return history.filter((item) => {
      if (activeTab === 'missed') {
        return item.status === 'MISSED' || item.myStatus === 'DECLINED';
      }
      return true;
    });
  }, [history, activeTab]);

  if (!isCallHistoryOpen) return null;

  const getPartnerUser = (item: CallHistoryItem) => {
    let partnerId = '';
    if (item.hostUserId && item.hostUserId !== user?.id) {
      partnerId = item.hostUserId;
    } else if (item.participantUserIds && item.participantUserIds.length > 0) {
      const other = item.participantUserIds.find((id) => id !== user?.id);
      if (other) partnerId = other;
    }

    const prof = partnerId ? userProfiles[partnerId] : null;
    return {
      id: partnerId,
      name:
        prof?.displayName ||
        (prof?.firstName ? `${prof.firstName} ${prof.lastName || ''}`.trim() : prof?.username) ||
        'Người dùng',
      avatar: prof?.avatarUrl || prof?.avatar || '',
    };
  };

  const handleCallback = (item: CallHistoryItem) => {
    const partner = getPartnerUser(item);
    if (partner.id) {
      setIsCallHistoryOpen(false);
      startCall(partner, item.mediaType || 'VIDEO', item.conversationId || undefined);
    }
  };

  return (
    <div
      onClick={() => setIsCallHistoryOpen(false)}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg bg-white dark:bg-[#242526] rounded-3xl shadow-2xl overflow-hidden border border-gray-200 dark:border-[#393a3b] flex flex-col h-[560px] max-h-[85vh] transition-all"
      >
        {/* Header */}
        <CallHistoryHeader onClose={() => setIsCallHistoryOpen(false)} />

        {/* Tabs */}
        <CallHistoryTabs
          activeTab={activeTab}
          onChangeTab={setActiveTab}
          missedCount={missedCount}
        />

        {/* Content Area with Fixed Responsive Height */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 divide-y divide-gray-100 dark:divide-[#393a3b]/60">
          {loading ? (
            <CallHistoryLoadingState />
          ) : filteredHistory.length === 0 ? (
            <CallHistoryEmptyState isMissedTab={activeTab === 'missed'} />
          ) : (
            filteredHistory.map((item) => {
              const partner = getPartnerUser(item);
              const isOutgoing = item.hostUserId === user?.id;
              const isMissed = item.status === 'MISSED' || item.myStatus === 'DECLINED';
              const isVideo = item.mediaType === 'VIDEO';

              return (
                <CallHistoryItemRow
                  key={item.callSessionId}
                  item={item}
                  partner={partner}
                  isOutgoing={isOutgoing}
                  isMissed={isMissed}
                  isVideo={isVideo}
                  formattedTime={formatCallTime(item.startedAt)}
                  formattedDuration={formatDuration(item.durationInSeconds)}
                  onCallback={handleCallback}
                />
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default CallHistoryModal;
