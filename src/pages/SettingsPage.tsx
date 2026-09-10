import React from 'react';
import { Header } from '../components/layout/Header';
import { SettingsView } from '../components/settings/SettingsView';
import { ChatBox, ChatUser } from '../components/chat/ChatBox';

interface SettingsPageProps {
  activeNavTab: string;
  setActiveNavTab: (tab: string) => void;
  onNavigateSettings: () => void;
  onNavigateProfile: (userId?: string) => void;
  onNavigateAuth: () => void;
  activeChatUser: ChatUser | null;
  setActiveChatUser: (user: ChatUser | null) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  activeNavTab,
  setActiveNavTab,
  onNavigateSettings,
  onNavigateProfile,
  onNavigateAuth,
  activeChatUser,
  setActiveChatUser,
}) => {
  return (
    <div className="min-h-screen bg-[#f0f2f5] dark:bg-[#18191a] text-gray-900 dark:text-[#e4e6eb]">
      <Header
        activeTab={activeNavTab}
        onTabChange={setActiveNavTab}
        onSelectChatUser={(u) => setActiveChatUser(u)}
        onNavigateSettings={onNavigateSettings}
        onNavigateProfile={onNavigateProfile}
        onNavigateAuth={onNavigateAuth}
      />
      <div className="pt-14">
        <SettingsView />
      </div>
      {activeChatUser && (
        <ChatBox friend={activeChatUser} onClose={() => setActiveChatUser(null)} />
      )}
    </div>
  );
};
