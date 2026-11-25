import type { CapacitorConfig } from '@capacitor/cli';

// CAP_ALLOW_HTTP=1: cho bản debug gọi API qua http (adb reverse / IP LAN). Bản phát hành phải để trống và dùng API https.
const allowHttp = process.env.CAP_ALLOW_HTTP === '1';

const config: CapacitorConfig = {
  appId: 'vn.edu.iuh.kltn.social',
  appName: 'Social',
  // Bản build riêng cho app (npm run build:android); bản web vẫn ở dist/
  webDir: 'dist-android',
  // Màu nền WebView trước khi trang tải xong (giao diện app mặc định là tối): tránh nháy trắng lúc mở app
  backgroundColor: '#18191a',
  server: {
    androidScheme: 'https',
    cleartext: allowHttp,
  },
  android: {
    allowMixedContent: allowHttp,
  },
};

export default config;
