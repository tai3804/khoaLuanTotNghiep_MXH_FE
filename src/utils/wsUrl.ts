/**
 * Dynamically resolves WebSocket URL:
 * 1. Uses explicit environment variable if defined.
 * 2. Or derives the origin from VITE_API_BASE_URL (e.g., https://kltn-mxh.me/api/v1 -> https://kltn-mxh.me).
 * 3. Falls back to window.location.origin on HTTPS production, or http://localhost:8080 in local dev.
 */
export const getWebSocketUrl = (path: string, envVar?: string): string => {
  if (envVar && envVar.trim()) {
    return envVar.trim();
  }

  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  if (baseUrl) {
    try {
      const url = new URL(baseUrl);
      const cleanPath = path.startsWith('/') ? path : `/${path}`;
      return `${url.origin}${cleanPath}`;
    } catch {
      // invalid URL format, ignore and fall back
    }
  }

  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  if (typeof window !== 'undefined') {
    // If running in browser over HTTPS, never use http:// to prevent mixed-content blocking
    if (window.location.protocol === 'https:') {
      return `${window.location.origin}${cleanPath}`;
    }
  }

  return `http://localhost:8080${cleanPath}`;
};
