import React, { useState, useEffect } from 'react';
import { ChatBox, ChatUser } from './chat-box';

interface ChatPopupContainerProps {
  activeChatUsers: ChatUser[];
  onCloseChat: (id: string) => void;
  onNavigateProfile?: (userId?: string) => void;
}

export const ChatPopupContainer: React.FC<ChatPopupContainerProps> = ({
  activeChatUsers,
  onCloseChat,
  onNavigateProfile,
}) => {
  const [maxChats, setMaxChats] = useState<number>(() => {
    if (typeof window === 'undefined') return 2;
    if (window.innerWidth >= 1440) return 3;
    if (window.innerWidth >= 960) return 2;
    return 1;
  });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width >= 1440) setMaxChats(3);
      else if (width >= 960) setMaxChats(2);
      else setMaxChats(1);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!activeChatUsers || activeChatUsers.length === 0) return null;

  // Show up to maxChats most recent chats
  const visibleChats = activeChatUsers.slice(0, maxChats);

  return (
    <div className="pointer-events-none fixed inset-0 z-50">
      {visibleChats.map((friend, index) => {
        const id = String(friend.userId || friend.id || friend.conversationId);
        const isMobile = window.innerWidth < 768;
        const baseOffset = isMobile ? 8 : 16;
        const boxWidth = isMobile ? 320 : 340;
        const gap = 14;
        const offsetRight = baseOffset + index * (boxWidth + gap);

        return (
          <div key={id} className="pointer-events-auto">
            <ChatBox
              friend={friend}
              offsetRight={offsetRight}
              onClose={() => onCloseChat(id)}
              onNavigateProfile={onNavigateProfile}
            />
          </div>
        );
      })}
    </div>
  );
};

export default ChatPopupContainer;
