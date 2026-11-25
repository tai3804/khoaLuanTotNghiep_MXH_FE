import { Capacitor } from '@capacitor/core';

/** true khi đang chạy trong app Android (Capacitor), false khi chạy trên trình duyệt. */
export const isNativeApp = (): boolean => Capacitor.isNativePlatform();

/** Giá trị gửi ở header X-Client-Type: 'WEB' trên trình duyệt, 'ANDROID' trong app. */
export const getClientType = (): string => (isNativeApp() ? Capacitor.getPlatform().toUpperCase() : 'WEB');
