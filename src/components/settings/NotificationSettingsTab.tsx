import React from 'react';
import { useToast } from '../../context/ToastContext';
import { useNotification } from '../../context/NotificationContext';
import {
  NotificationSettingsHeader,
  SocialInteractionsSection,
  FriendInteractionsSection,
  MessagesCallsSection,
  SoundSystemSection,
} from './notification';

export const NotificationSettingsTab: React.FC = () => {
  const toast = useToast();
  const { settings, updateSettings, playNotificationSound } = useNotification();

  return (
    <div className="space-y-6">
      <NotificationSettingsHeader />

      {/* Category 1: Social Interactions */}
      <SocialInteractionsSection
        settings={settings}
        updateSettings={updateSettings}
        toast={toast}
      />

      {/* Category 2: Connections & Friends */}
      <FriendInteractionsSection
        settings={settings}
        updateSettings={updateSettings}
        toast={toast}
      />

      {/* Category 3: Messages & Calls */}
      <MessagesCallsSection
        settings={settings}
        updateSettings={updateSettings}
        toast={toast}
      />

      {/* Category 4: Sound & System */}
      <SoundSystemSection
        settings={settings}
        updateSettings={updateSettings}
        playNotificationSound={playNotificationSound}
        toast={toast}
      />
    </div>
  );
};
