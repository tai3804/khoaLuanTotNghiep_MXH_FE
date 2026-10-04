import { api } from './axiosClient';

export interface SystemConfigs {
  maintenance_mode: boolean;
  allow_registration: boolean;
  ai_moderation_enabled: boolean;
  max_upload_size_mb: number;
  system_announcement: string;
  max_reports_auto_hide: number;
}

const DEFAULT_CONFIGS: SystemConfigs = {
  maintenance_mode: false,
  allow_registration: true,
  ai_moderation_enabled: true,
  max_upload_size_mb: 25,
  system_announcement: '',
  max_reports_auto_hide: 5,
};

export const systemConfigService = {
  getPublicConfigs: async (): Promise<SystemConfigs> => {
    try {
      const res = await api.get('/admin/settings/public');
      const data: Record<string, string> = res.data?.data || res.data || {};
      return {
        maintenance_mode: data.maintenance_mode === 'true',
        allow_registration: data.allow_registration !== 'false',
        ai_moderation_enabled: data.ai_moderation_enabled !== 'false',
        max_upload_size_mb: Number(data.max_upload_size_mb) || 25,
        system_announcement: (data.system_announcement || '').trim(),
        max_reports_auto_hide: Number(data.max_reports_auto_hide) || 5,
      };
    } catch {
      return DEFAULT_CONFIGS;
    }
  },
};
