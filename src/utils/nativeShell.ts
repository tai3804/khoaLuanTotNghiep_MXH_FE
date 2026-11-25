import { SystemBars, SystemBarsStyle } from '@capacitor/core';
import { isNativeApp } from './platform';

/** Thiết lập riêng cho app Android; trên trình duyệt không làm gì. */
export const initNativeShell = (): void => {
  if (!isNativeApp()) return;

  // Móc cho CSS riêng của app (tắt chọn chữ trên nút, tắt hiệu ứng kéo quá đầu trang...)
  document.documentElement.classList.add('native-app');

  // Vùng thanh trạng thái/thanh cử chỉ do Android vẽ màu tối cố định (xem res/values/colors.xml): dùng biểu tượng sáng
  void SystemBars.setStyle({ style: SystemBarsStyle.Dark }).catch(() => {});

  void (async () => {
    const [{ App }, { handleHardwareBack }] = await Promise.all([import('@capacitor/app'), import('./hardwareBack')]);
    await App.addListener('backButton', ({ canGoBack }) => {
      void handleHardwareBack(canGoBack);
    });
  })();
};
