import React, { useState, useEffect } from 'react';
import {
  X,
  Phone,
  Video,
  PhoneIncoming,
  PhoneOutgoing,
  PhoneMissed,
  Clock,
  Loader2,
} from 'lucide-react';
import { useCall } from '../../context/CallContext';
import { callService, CallHistoryItem } from '../../services/callService';
import { userService } from '../../services/userService';
import { UserAvatar } from '../common/UserAvatar';
import { useAuth } from '../../context/AuthContext';

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

  if (!isCallHistoryOpen) return null;

  const filteredHistory = history.filter((item) => {
    if (activeTab === 'missed') {
      return item.status === 'MISSED' || item.myStatus === 'DECLINED';
    }
    return true;
  });

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
      name: prof?.displayName || (prof?.firstName ? `${prof.firstName} ${prof.lastName || ''}`.trim() : prof?.username) || 'Người dùng',
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
      <div className="relative w-full max-w-lg bg-white dark:bg-[#242526] rounded-3xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-blue-500" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Lịch sử cuộc gọi</h3>
          </div>
          <button
            onClick={() => setIsCallHistoryOpen(false)}
            className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex px-6 pt-3 border-b border-gray-100 dark:border-gray-700 space-x-4">
          <button
            onClick={() => setActiveTab('all')}
            className={`pb-2 text-sm font-semibold border-b-2 transition cursor-pointer ${
              activeTab === 'all'
                ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Tất cả
          </button>
          <button
            onClick={() => setActiveTab('missed')}
            className={`pb-2 text-sm font-semibold border-b-2 transition cursor-pointer ${
              activeTab === 'missed'
                ? 'border-red-500 text-red-500'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Cuộc gọi nhỡ & Từ chối
          </button>
        </div>

        {/* Content List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 divide-y divide-gray-100 dark:divide-gray-800">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <Loader2 className="w-7 h-7 animate-spin mb-2" />
              <p className="text-xs">Đang tải nhật ký cuộc gọi...</p>
            </div>
          ) : filteredHistory.length === 0 ? (
            <div className="text-center py-16 text-gray-400 dark:text-gray-500">
              <Phone className="w-12 h-12 mx-auto mb-2 opacity-30" />
              <p className="text-sm font-medium">Chưa có cuộc gọi nào trong nhật ký</p>
            </div>
          ) : (
            filteredHistory.map((item) => {
              const partner = getPartnerUser(item);
              const isOutgoing = item.hostUserId === user?.id;
              const isMissed = item.status === 'MISSED' || item.myStatus === 'DECLINED';
              const isVideo = item.mediaType === 'VIDEO';

              return (
                <div
                  key={item.callSessionId}
                  className="pt-2 flex items-center justify-between p-3 rounded-2xl hover:bg-gray-50 dark:hover:bg-[#3a3b3c]/50 transition duration-150"
                >
                  <div className="flex items-center space-x-3.5">
                    <UserAvatar src={partner.avatar} alt={partner.name} size="md" />
                    <div>
                      <h4
                        className={`text-sm font-bold truncate max-w-[180px] md:max-w-[220px] ${
                          isMissed ? 'text-red-500' : 'text-gray-900 dark:text-white'
                        }`}
                      >
                        {partner.name}
                      </h4>
                      <div className="flex items-center space-x-1.5 text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {isMissed ? (
                          <PhoneMissed className="w-3.5 h-3.5 text-red-500" />
                        ) : isOutgoing ? (
                          <PhoneOutgoing className="w-3.5 h-3.5 text-blue-500" />
                        ) : (
                          <PhoneIncoming className="w-3.5 h-3.5 text-green-500" />
                        )}
                        <span>{formatCallTime(item.startedAt)}</span>
                        {item.durationInSeconds > 0 && (
                          <>
                            <span>•</span>
                            <span className="font-mono">{formatDuration(item.durationInSeconds)}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Callback Action Button */}
                  <button
                    onClick={() => handleCallback(item)}
                    className="p-2.5 rounded-full bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-400 transition cursor-pointer"
                    title={isVideo ? 'Gọi lại video' : 'Gọi lại thoại'}
                  >
                    {isVideo ? <Video className="w-4 h-4" /> : <Phone className="w-4 h-4" />}
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
