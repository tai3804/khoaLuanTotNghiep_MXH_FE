import { useEffect, useRef, useState } from 'react';
import { InterestMap, interestMapService } from '../../services/interestMapService';

/**
 * Tải bản đồ sở thích đúng một lần khi vào trang (không tự tải lại); muốn xem dữ liệu mới thì tải lại trang.
 * Cờ `started` chặn lần gọi thứ hai do React StrictMode chạy effect hai lần ở môi trường dev.
 */
export const useInterestMap = () => {
  const [data, setData] = useState<InterestMap | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    interestMapService
      .getMyInterestMap()
      .then(setData)
      .catch((err: any) => setError(err?.response?.data?.message || err?.message || 'Không tải được bản đồ sở thích'))
      .finally(() => setLoading(false));
  }, []);

  return { data, loading, error };
};
