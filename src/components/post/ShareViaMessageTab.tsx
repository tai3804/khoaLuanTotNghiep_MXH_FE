import React, { useState, useEffect } from 'react';
import { Search, Send, Check, Loader2, MessageCircle, X, Users } from 'lucide-react';
import { chatService } from '../../services/api';
import { UserAvatar } from '../common/UserAvatar';
import { GroupAvatar } from '../common/GroupAvatar';
import { Post } from '../../types';
import { useToast } from '../../context/ToastContext';

interface ShareViaMessageTabProps {
  post: Post;
  caption?: string;
  onSent?: () => void;
}

export const ShareViaMessageTab: React.FC<ShareViaMessageTabProps> = ({
  post,
  caption = '',
}) => {
  const toast = useToast();
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [messageNote, setMessageNote] = useState(caption);
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
      const finalNote = messageNote.trim();
      const messageContent = finalNote ? `${finalNote}\n${postUrl}` : postUrl;

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
    <div className="space-y-3.5">
      {/* Optional Note Attached to Message */}
      <div className="relative">
        <input
          type="text"
          value={messageNote}
          onChange={(e) => setMessageNote(e.target.value)}
          placeholder="Viết lời nhắn gửi kèm bài viết (tùy chọn)..."
          className="w-full px-3.5 py-2 bg-gray-50 dark:bg-[#18191a] text-gray-900 dark:text-[#e4e6eb] rounded-xl text-xs outline-none border border-gray-200 dark:border-[#393a3b] focus:border-[#1877f2] dark:focus:border-[#1877f2] transition placeholder-gray-400"
        />
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Tìm bạn bè hoặc nhóm trò chuyện..."
          className="w-full pl-9 pr-8 py-2 bg-gray-100 dark:bg-[#3a3b3c] text-gray-900 dark:text-[#e4e6eb] rounded-xl text-xs outline-none border border-transparent focus:border-[#1877f2] transition"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Conversations List */}
      <div className="max-h-64 overflow-y-auto space-y-1 pr-1 scrollbar-thin">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-10 text-xs text-gray-400 space-y-2">
            <Loader2 className="w-5 h-5 animate-spin text-[#1877f2]" />
            <span>Đang tải danh sách cuộc trò chuyện...</span>
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="text-center py-8 text-xs text-gray-400 dark:text-[#b0b3b8]">
            {searchQuery
              ? 'Không tìm thấy cuộc trò chuyện nào phù hợp.'
              : 'Chưa có cuộc trò chuyện nào để chia sẻ.'}
          </div>
        ) : (
          filteredConversations.map((conv) => {
            const convId = conv.conversationId || conv.id;
            const convName = conv.name || conv.partnerName || 'Cuộc trò chuyện';
            const isGroup = Boolean(conv.isGroup);
            const isSending = Boolean(sendingMap[convId]);
            const isSent = Boolean(sentMap[convId]);

            return (
              <div
                key={convId}
                className="flex items-center justify-between p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-[#3a3b3c] transition group"
              >
                <div className="flex items-center space-x-3 min-w-0 flex-1 mr-2">
                  {isGroup ? (
                    <GroupAvatar name={convName} size="sm" shape="circle" />
                  ) : (
                    <UserAvatar
                      src={conv.avatarUrl || conv.avatar}
                      alt={convName}
                      size="sm"
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-gray-900 dark:text-[#e4e6eb] truncate leading-tight">
                      {convName}
                    </p>
                    <span className="text-[10px] text-gray-500 dark:text-[#b0b3b8]">
                      {isGroup ? 'Nhóm trò chuyện' : 'Bạn bè'}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleSendToConversation(convId, convName)}
                  disabled={isSending || isSent}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition cursor-pointer shadow-xs ${
                    isSent
                      ? 'bg-green-100 dark:bg-green-950/40 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-800 cursor-default'
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

export default ShareViaMessageTab;
