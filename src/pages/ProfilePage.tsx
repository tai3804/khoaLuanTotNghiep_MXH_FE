import React from 'react';
import { useParams } from 'react-router-dom';
import { Header } from '../components/layout/Header';
import { ProfileView } from '../components/profile/ProfileView';
import { ChatBox, ChatUser } from '../components/chat/ChatBox';

interface ProfilePageProps {
  userId?: string | null;
  activeNavTab?: string;
  setActiveNavTab?: (tab: string) => void;
  onNavigateSettings?: () => void;
  onNavigateProfile?: (userId?: string) => void;
  onNavigateAuth?: () => void;
  activeChatUser?: ChatUser | null;
  setActiveChatUser?: (user: ChatUser | null) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({
  userId,
  activeNavTab = 'profile',
  setActiveNavTab,
  onNavigateSettings,
  onNavigateProfile,
  onNavigateAuth,
  activeChatUser,
  setActiveChatUser,
}) => {
  const params = useParams<{ userId?: string }>();
  const effectiveUserId = userId || params.userId || null;

  return (
    <div className="min-h-screen bg-[#f0f2f5] dark:bg-[#18191a] text-gray-900 dark:text-[#e4e6eb]">
      <Header
        activeTab={activeNavTab}
        onTabChange={setActiveNavTab}
        onSelectChatUser={(u) => setActiveChatUser?.(u)}
        onNavigateSettings={onNavigateSettings}
        onNavigateProfile={onNavigateProfile}
        onNavigateAuth={onNavigateAuth}
      />
      <div className="pt-14">
        <ProfileView
          userId={effectiveUserId}
          onSelectChatUser={(u) => setActiveChatUser?.(u)}
          onViewProfile={onNavigateProfile}
        />
      </div>
      {activeChatUser && (
        <ChatBox friend={activeChatUser} onClose={() => setActiveChatUser?.(null)} />
      )}
    </div>
  );
};
