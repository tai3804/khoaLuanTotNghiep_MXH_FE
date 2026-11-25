// Khi bàn phím ảo mở, WebView co lại và các thanh cố định ở đáy (thanh điều hướng, nút nổi) bị đẩy lên nằm ngay
// trên bàn phím, chiếm chỗ của ô nhập. Đánh dấu <html class="kb-open"> để CSS ẩn chúng (xem [data-hide-on-kb] trong index.css).

const NON_TEXT_INPUT = 'checkbox, radio, button, submit, reset, file, range, color, image';

const isTextEntry = (el: Element | null): boolean => {
  if (!el) return false;
  if (el instanceof HTMLTextAreaElement) return true;
  if (el instanceof HTMLInputElement) return !NON_TEXT_INPUT.split(', ').includes(el.type);
  return el instanceof HTMLElement && el.isContentEditable;
};

export const initKeyboardState = (): void => {
  // Chỉ thiết bị cảm ứng mới có bàn phím ảo; máy tính để bàn không cần ẩn gì
  if (!window.matchMedia('(pointer: coarse)').matches) return;

  const root = document.documentElement;
  const sync = () => root.classList.toggle('kb-open', isTextEntry(document.activeElement));

  document.addEventListener('focusin', sync);
  // Chuyển ô nhập: focusout rồi focusin ngay sau đó, đợi một nhịp để không nháy
  document.addEventListener('focusout', () => setTimeout(sync, 50));
};
