import React, { useState, useEffect } from 'react';
import { Search, Send, Check, Loader2, MessageCircle } from 'lucide-react';
import { chatService } from '../../services/api';
import { UserAvatar } from '../common/UserAvatar';
import { Post } from '../../types';
import { useToast } from '../../context/ToastContext';

interface ShareViaMessageTabProps {
  post: Post;
  caption?: string;
  onSent?: () => void;
}

export const ShareViaMessageTab: React.FC<ShareViaMessageTabProps> = ({
  post,
  caption,
}) => {
  const toast = useToast();
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sendingMap, setSendingMap] = useState<Record<string, boolean>>({});
  const [sentMap, setSentMap] = useState<Record<string, boolean>>({});

  useEffect(() => {
    let isMounted = true;
    const loadConversations = async () => {
      setLoading(true);
      try {
        const list = await chatService.getConversations();
        if (isMounted) {
          setConversations(Array.isArray(list) ? list : []);
        }
      } catch (err) {
        console.warn('Failed to load conversations for sharing:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    loadConversations();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSendToConversation = async (conversationId: string, recipientName: string) => {
    if (sendingMap[conversationId] || sentMap[conversationId]) return;

    setSendingMap((prev) => ({ ...prev, [conversationId]: true }));
    try {
      const postUrl = `${window.location.origin}/posts/${post.id}`;
      const messageContent = caption?.trim()
        ? `${caption.trim()}\n${postUrl}`
        : postUrl;

      await chatService.sendMessage(conversationId, messageContent);
      setSentMap((prev) => ({ ...prev, [conversationId]: true }));
      toast.showSuccess(`Đã gửi bài viết đến ${recipientName}!`);
    } catch (err: any) {
      toast.showError('Không thể gửi tin nhắn: ' + (err.response?.data?.message || err.message));
    } finally {
      setSendingMap((prev) => ({ ...prev, [conversationId]: false }));
    }
  };

  const filteredConversations = conversations.filter((conv) => {
    const name = conv.name || conv.partnerName || 'Cuộc trò chuyện';
    return name.toLowerCase().includes(searchQuery.trim().toLowerCase());
  });

  return (
    <div className="space-y-3">
      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Tìm kiếm bạn bè hoặc nhóm..."
          className="w-full pl-9 pr-3 py-1.5 bg-gray-100 dark:bg-[#3a3b3c] text-gray-900 dark:text-[#e4e6eb] rounded-xl text-xs outline-none border border-transparent focus:border-[#1877f2] transition"
        />
      </div>

      {/* Conversations List */}
      <div className="max-h-60 overflow-y-auto space-y-1 pr-1">
        {loading ? (
          <div className="flex items-center justify-center py-8 text-xs text-gray-400">
            <Loader2 className="w-4 h-4 animate-spin text-[#1877f2] mr-2" />
            <span>Đang tải danh sách cuộc trò chuyện...</span>
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="text-center py-6 text-xs text-gray-400">
            {searchQuery ? 'Không tìm thấy cuộc trò chuyện nào phù hợp.' : 'Chưa có cuộc trò chuyện nào.'}
          </div>
        ) : (
          filteredConversations.map((conv) => {
            const convId = conv.conversationId || conv.id;
            const convName = conv.name || conv.partnerName || 'Cuộc trò chuyện';
            const convAvatar = conv.avatarUrl || conv.avatar || '/default-avatar.png';
            const isSending = Boolean(sendingMap[convId]);
            const isSent = Boolean(sentMap[convId]);

            return (
              <div
                key={convId}
                className="flex items-center justify-between p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-[#3a3b3c] transition"
              >
                <div className="flex items-center space-x-2.5 min-w-0 flex-1 mr-2">
                  <UserAvatar src={convAvatar} alt={convName} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-gray-900 dark:text-[#e4e6eb] truncate">
                      {convName}
                    </p>
                    {conv.isGroup && (
                      <span className="text-[10px] text-gray-400">Nhóm trò chuyện</span>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleSendToConversation(convId, convName)}
                  disabled={isSending || isSent}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1 transition cursor-pointer ${
                    isSent
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 cursor-default'
                      : 'bg-[#1877f2] hover:bg-[#166fe5] text-white disabled:opacity-50'
                  }`}
                >
                  {isSending ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : isSent ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Đã gửi</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3 h-3" />
                      <span>Gửi</span>
                    </>
                  )}
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
