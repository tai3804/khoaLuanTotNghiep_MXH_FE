import { useState, useEffect, useCallback } from 'react';
import { CreatorAnalytics } from '../types';
import { postService } from '../../../../services/postService';

interface UseProfessionalDashboardDataProps {
  isOpen: boolean;
}

export const useProfessionalDashboardData = ({ isOpen }: UseProfessionalDashboardDataProps) => {
  const [period, setPeriod] = useState<'7d' | '28d' | '60d'>('28d');
  const [analytics, setAnalytics] = useState<CreatorAnalytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async (p: '7d' | '28d' | '60d') => {
    try {
      setLoading(true);
      setError(null);
      const res = await postService.getCreatorAnalytics(p);
      setAnalytics(res);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Không thể tải số liệu phân tích');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchAnalytics(period);
    }
  }, [isOpen, period, fetchAnalytics]);

  return {
    period,
    setPeriod,
    analytics,
    loading,
    error,
    refresh: () => fetchAnalytics(period),
  };
};
