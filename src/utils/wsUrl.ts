/**
 * Dynamically resolves WebSocket URL:
 * 1. Uses explicit environment variable if defined.
 * 2. Or derives the origin from VITE_API_BASE_URL (e.g., https://kltn-mxh.me/api/v1 -> https://kltn-mxh.me).
 * 3. Falls back to http://localhost:8080 if running in local development without environment variables.
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
  return `http://localhost:8080${cleanPath}`;
};

