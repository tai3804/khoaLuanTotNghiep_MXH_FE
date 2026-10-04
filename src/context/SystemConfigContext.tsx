import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { systemConfigService, SystemConfigs } from '../services/systemConfigService';

interface SystemConfigContextType {
  configs: SystemConfigs;
  isMaintenance: boolean;
  allowRegistration: boolean;
  maxUploadSizeMb: number;
  systemAnnouncement: string;
  isAnnouncementDismissed: boolean;
  dismissAnnouncement: () => void;
  refreshConfigs: () => Promise<void>;
}

const SystemConfigContext = createContext<SystemConfigContextType | undefined>(undefined);

export const SystemConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [configs, setConfigs] = useState<SystemConfigs>({
    maintenance_mode: false,
    allow_registration: true,
    ai_moderation_enabled: true,
    max_upload_size_mb: 25,
    system_announcement: '',
    max_reports_auto_hide: 5,
  });

  const [dismissedAnnouncements, setDismissedAnnouncements] = useState<string[]>(() => {
    try {
      const stored = sessionStorage.getItem('dismissed_announcements');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const refreshConfigs = useCallback(async () => {
    try {
      const data = await systemConfigService.getPublicConfigs();
      setConfigs(data);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    refreshConfigs();
  }, [refreshConfigs]);

  const isAnnouncementDismissed = configs.system_announcement
    ? dismissedAnnouncements.includes(configs.system_announcement)
    : true;

  const dismissAnnouncement = useCallback(() => {
    if (configs.system_announcement) {
      setDismissedAnnouncements((prev) => {
        const next = [...prev, configs.system_announcement];
        try {
          sessionStorage.setItem('dismissed_announcements', JSON.stringify(next));
        } catch {}
        return next;
      });
    }
  }, [configs.system_announcement]);

  return (
    <SystemConfigContext.Provider
      value={{
        configs,
        isMaintenance: configs.maintenance_mode,
        allowRegistration: configs.allow_registration,
        maxUploadSizeMb: configs.max_upload_size_mb,
        systemAnnouncement: configs.system_announcement,
        isAnnouncementDismissed,
        dismissAnnouncement,
        refreshConfigs,
      }}
    >
      {children}
    </SystemConfigContext.Provider>
  );
};

export const useSystemConfig = (): SystemConfigContextType => {
  const context = useContext(SystemConfigContext);
  if (!context) {
    throw new Error('useSystemConfig must be used within a SystemConfigProvider');
  }
  return context;
};
