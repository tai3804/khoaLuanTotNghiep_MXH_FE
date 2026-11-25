// Nút Back vật lý của Android. Người dùng kỳ vọng Back đóng thứ đang mở trên cùng (cửa sổ chat, hộp thoại,
// trình xem ảnh...) trước khi quay lại trang trước, và chỉ thoát app khi đang ở trang gốc.
//
// Các hộp thoại của app là state cục bộ, không có mục trong lịch sử trình duyệt nên không thể dựa vào history.back().
// Thứ tự xử lý:
//   1. Phần tử tự đăng ký bằng thuộc tính data-back-target (cửa sổ chat toàn màn hình, ô tìm kiếm mobile): bấm nó.
//   2. Lớp phủ toàn màn hình (.fixed.inset-0) trên cùng: thử Escape, nút đóng có nhãn, nút X icon, cuối cùng bấm nền.
//   3. Không có gì để đóng: quay lại trang trước nếu có, nếu không thì thoát app.

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

const isVisible = (el: HTMLElement): boolean => {
  const style = getComputedStyle(el);
  if (style.display === 'none' || style.visibility === 'hidden') return false;
  const rect = el.getBoundingClientRect();
  return rect.width > 0 && rect.height > 0;
};

const zIndexOf = (el: HTMLElement): number => parseInt(getComputedStyle(el).zIndex, 10) || 0;

/** Lớp phủ toàn màn hình đang mở trên cùng, hoặc null. */
const findTopOverlay = (): HTMLElement | null => {
  const overlays = Array.from(document.querySelectorAll<HTMLElement>('.fixed.inset-0')).filter(isVisible);
  // sort ổn định: cùng z-index thì giữ thứ tự DOM, phần tử đứng sau nằm trên
  overlays.sort((a, b) => zIndexOf(a) - zIndexOf(b));
  return overlays.length > 0 ? overlays[overlays.length - 1] : null;
};

const CLOSE_LABEL = /^(đóng|đóng lại|close|hủy|huỷ|cancel|quay lại|back)$/i;

const labelOf = (el: HTMLElement): string =>
  (el.getAttribute('aria-label') || el.getAttribute('title') || el.textContent || '').trim();

const buttonsIn = (overlay: HTMLElement): HTMLElement[] =>
  Array.from(overlay.querySelectorAll<HTMLElement>('button, [role="button"]')).filter(isVisible);

const findLabeledClose = (overlay: HTMLElement): HTMLElement | null =>
  buttonsIn(overlay).find((b) => CLOSE_LABEL.test(labelOf(b))) ?? null;

/** Nút chỉ có icon X ở vị trí cao nhất trong lớp phủ (nút đóng ở tiêu đề, không phải nút xóa ảnh đính kèm bên dưới). */
const findIconClose = (overlay: HTMLElement): HTMLElement | null => {
  const candidates = buttonsIn(overlay).filter(
    (b) => !b.textContent?.trim() && b.querySelector('svg.lucide-x, svg.lucide-circle-x'),
  );
  candidates.sort((a, b) => {
    const ra = a.getBoundingClientRect();
    const rb = b.getBoundingClientRect();
    return ra.top - rb.top || rb.left - ra.left;
  });
  return candidates[0] ?? null;
};

const dispatchEscape = (target: EventTarget): void => {
  for (const type of ['keydown', 'keyup'] as const) {
    target.dispatchEvent(new KeyboardEvent(type, { key: 'Escape', code: 'Escape', bubbles: true, cancelable: true }));
  }
};

/** Đóng lớp phủ; trả về true nếu có gì đó thay đổi (đóng hẳn, hoặc mở tiếp hộp xác nhận phía trên). */
const closeOverlay = async (overlay: HTMLElement): Promise<boolean> => {
  const attempts: Array<() => void> = [
    () => dispatchEscape(document.activeElement ?? document),
    () => findLabeledClose(overlay)?.click(),
    () => findIconClose(overlay)?.click(),
    () => overlay.click(),
  ];
  for (const attempt of attempts) {
    attempt();
    await sleep(80);
    if (!overlay.isConnected || !isVisible(overlay) || findTopOverlay() !== overlay) return true;
  }
  return false;
};

export const handleHardwareBack = async (canGoBack: boolean): Promise<void> => {
  const explicit = Array.from(document.querySelectorAll<HTMLElement>('[data-back-target]')).filter(isVisible).pop();
  if (explicit) {
    explicit.click();
    return;
  }

  const overlay = findTopOverlay();
  if (overlay && (await closeOverlay(overlay))) return;

  if (canGoBack) {
    window.history.back();
    return;
  }
  const { App } = await import('@capacitor/app');
  await App.exitApp();
};
