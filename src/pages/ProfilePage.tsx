import React from 'react';
import { useParams } from 'react-router-dom';
import { Header } from '../components/layout/header-bar';
import { ProfileView } from '../components/profile/ProfileView';
import { ChatUser } from '../components/chat/chat-box';

interface ProfilePageProps {
  userId?: string | null;
  activeNavTab?: string;
  setActiveNavTab?: (tab: string) => void;
  activeSidebarFilter?: string;
  setActiveSidebarFilter?: (filter: string) => void;
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
    <div className="min-h-screen bg-[#f0f2f5] dark:bg-[#18191a] text-gray-900 dark:text-[#e4e6eb] transition-colors duration-200">
      <Header
        activeTab={activeNavTab}
        onTabChange={setActiveNavTab}
        onSelectChatUser={(u) => setActiveChatUser?.(u)}
        onNavigateSettings={onNavigateSettings}
        onNavigateProfile={onNavigateProfile}
        onNavigateAuth={onNavigateAuth}
      />

      {/* Main Centered Profile Container (Facebook Standard Width) */}
      <div className="pt-14 min-h-screen">
        <main className="w-full max-w-[1120px] xl:max-w-[1180px] 2xl:max-w-[1240px] mx-auto px-2 sm:px-4 lg:px-6 py-4">
          <ProfileView
            userId={effectiveUserId}
            onSelectChatUser={(u) => setActiveChatUser?.(u)}
            onViewProfile={onNavigateProfile}
            onNavigateSettings={onNavigateSettings}
          />
        </main>
      </div>

    </div>
  );
};
