import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';

interface QRCodeProps {
  value: string;
  size?: number;
  className?: string;
}

/**
 * Standard, scannable QR Code Generator using industry-standard qrcode engine.
 * Fully compatible with Google Authenticator, Authy, Apple Passwords, etc.
 */
export const QRCodeSvg: React.FC<QRCodeProps> = ({ value, size = 160, className = '' }) => {
  const [dataUrl, setDataUrl] = useState<string>('');
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    if (!value) {
      setDataUrl('');
      return;
    }

    QRCode.toDataURL(value, {
      width: size * 2, // 2x for retina sharpness
      margin: 1.5,
      errorCorrectionLevel: 'M',
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
    })
      .then((url) => {
        if (isMounted) {
          setDataUrl(url);
          setError(false);
        }
      })
      .catch((err) => {
        console.error('[QRCodeSvg] Failed to generate QR code:', err);
        if (isMounted) setError(true);
      });

    return () => {
      isMounted = false;
    };
  }, [value, size]);

  if (error || !value) {
    return (
      <div
        style={{ width: size, height: size }}
        className={`flex items-center justify-center bg-gray-100 dark:bg-[#3a3b3c] text-xs text-gray-500 rounded-2xl ${className}`}
      >
        QR Không khả dụng
      </div>
    );
  }

  if (!dataUrl) {
    return (
      <div
        style={{ width: size, height: size }}
        className={`flex items-center justify-center bg-white dark:bg-[#242526] rounded-2xl border border-gray-200 dark:border-[#393a3b] animate-pulse ${className}`}
      >
        <span className="text-[11px] text-gray-400">Đang tạo mã QR...</span>
      </div>
    );
  }

  return (
    <img
      src={dataUrl}
      alt="2FA QR Code"
      width={size}
      height={size}
      className={`rounded-2xl bg-white p-2 border border-gray-200/90 dark:border-[#393a3b] shadow-xs select-none ${className}`}
    />
  );
};
