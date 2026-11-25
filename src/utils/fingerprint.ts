import { isNativeApp } from './platform';

// Thư viện này khá nặng (~126 KB) và chỉ cần ở lần đăng nhập đầu tiên trên thiết bị, nên được nạp động khi cần
let fpPromise: Promise<any> | null = null;

/**
 * Generates or retrieves a persistent, unique browser device fingerprint
 * using FingerprintJS with fallback to local persistent UUID.
 */
export const getDeviceFingerprint = async (): Promise<string> => {
  try {
    const cached = localStorage.getItem('deviceFingerprint');
    if (cached && cached.trim()) {
      return cached;
    }

    // Trong app Android dùng ID thiết bị của hệ điều hành: ổn định hơn dấu vân tay trình duyệt của WebView
    if (isNativeApp()) {
      const { Device } = await import('@capacitor/device');
      const { identifier } = await Device.getId();
      if (identifier) {
        const nativeId = 'android-' + identifier;
        localStorage.setItem('deviceFingerprint', nativeId);
        return nativeId;
      }
    }

    if (!fpPromise) {
      fpPromise = import('@fingerprintjs/fingerprintjs').then((m) => m.default.load());
    }
    const fp = await fpPromise;
    const result = await fp.get();
    const visitorId = result?.visitorId;

    if (visitorId) {
      localStorage.setItem('deviceFingerprint', visitorId);
      return visitorId;
    }
  } catch (error) {
    console.warn('FingerprintJS load failed, using fallback generator:', error);
  }

  // Fallback: persistent UUID-like string
  let fallbackId = localStorage.getItem('deviceFingerprint');
  if (!fallbackId) {
    fallbackId =
      'web-' +
      Math.random().toString(36).substring(2, 12) +
      '-' +
      Date.now().toString(36);
    localStorage.setItem('deviceFingerprint', fallbackId);
  }
  return fallbackId;
};

/**
 * Returns a human-friendly device name (e.g. "Chrome on Windows")
 */
export const getDeviceName = (): string => {
  const ua = navigator.userAgent;

  // App Android: User-Agent của WebView có dạng "(Linux; Android 14; SM-S918B ...)", hiển thị là "App Android (SM-S918B)"
  if (isNativeApp()) {
    const model = /Android [\d.]+; ([^;)]+)/.exec(ua)?.[1]?.trim();
    return model ? `App Android (${model})` : 'App Android';
  }

  let browser = 'Browser';
  let os = 'Unknown OS';

  if (ua.includes('Edg/')) browser = 'Edge';
  else if (ua.includes('Chrome') && !ua.includes('Edg/')) browser = 'Chrome';
  else if (ua.includes('Firefox')) browser = 'Firefox';
  else if (ua.includes('Safari') && !ua.includes('Chrome')) browser = 'Safari';

  // Android và iPhone phải xét trước Windows/Mac/Linux: User-Agent của chúng chứa "Linux" và "Mac OS X"
  if (ua.includes('Android')) os = 'Android';
  else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';
  else if (ua.includes('Win')) os = 'Windows';
  else if (ua.includes('Mac')) os = 'macOS';
  else if (ua.includes('Linux')) os = 'Linux';

  return `${browser} on ${os}`;
};
