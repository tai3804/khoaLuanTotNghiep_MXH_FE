// Trên web, refresh token nằm trong cookie HttpOnly nên JS không đụng tới.
// Trong app Android (origin https://localhost gọi API khác domain) WebView chặn cookie bên thứ ba,
// nên refresh token được lưu ở kho bảo mật native (Android Keystore) và gửi trong body của /auth/refresh.
// Plugin nạp động để bản web không phải tải nó.

const KEY = 'refreshToken';

type SecureStore = {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
};

// Plugin Capacitor là Proxy: truy cập thuộc tính nào cũng bị coi là gọi một hàm native. Nếu trả thẳng plugin ra khỏi
// Promise/async (return hoặc await), JS sẽ đọc `.then` trên nó và Capacitor báo lỗi `"SecureStorage.then()" is not
// implemented on android`, khiến mọi thao tác lưu/đọc token hỏng. Vì vậy luôn bọc plugin trong một object thường.
type StoreHolder = { store: SecureStore };

let holderPromise: Promise<StoreHolder> | null = null;

const loadStore = (): Promise<StoreHolder> => {
  if (!holderPromise) {
    holderPromise = import('@aparajita/capacitor-secure-storage').then(async ({ SecureStorage }) => {
      // Tiền tố riêng của app: tránh đụng key của plugin khác trong cùng kho.
      await SecureStorage.setKeyPrefix('kltn_social_');
      return { store: SecureStorage };
    });
  }
  return holderPromise;
};

export const getNativeRefreshToken = async (): Promise<string | null> => {
  try {
    const { store } = await loadStore();
    const value = await store.getItem(KEY);
    return value && value.trim() ? value : null;
  } catch (e) {
    console.warn('[nativeSession] Cannot read refresh token', e);
    return null;
  }
};

export const setNativeRefreshToken = async (token: string): Promise<void> => {
  try {
    const { store } = await loadStore();
    await store.setItem(KEY, token);
  } catch (e) {
    console.warn('[nativeSession] Cannot store refresh token', e);
  }
};

export const clearNativeRefreshToken = async (): Promise<void> => {
  try {
    const { store } = await loadStore();
    await store.removeItem(KEY);
  } catch {
    // Không có gì để xóa hoặc kho không khả dụng: bỏ qua.
  }
};
