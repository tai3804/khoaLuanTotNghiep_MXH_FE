/**
 * Sanitizes and cleans up obsolete, redundant, or temporary keys in localStorage.
 * Ensures storage is tidy, minimal, and doesn't contain duplicated data.
 */
export const sanitizeLocalStorage = (): void => {
  if (typeof window === 'undefined' || !window.localStorage) return;

  try {
    const keysToRemove: string[] = [];
    const obsoleteExactKeys = [
      'token',               // Pure in-memory (Redux) security model
      'refreshToken',        // Stored in HttpOnly cookie
      'currentUserId',       // Redundant: user.id is already stored in 'user'
      'my_friend_ids',       // In-memory cache in userService
      'kltn_ended_streams',  // Moved to sessionStorage
    ];

    obsoleteExactKeys.forEach((k) => {
      if (localStorage.getItem(k) !== null) {
        keysToRemove.push(k);
      }
    });

    // Scan for dynamic temporary keys
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;

      if (
        key.startsWith('kltn_live_signal_') || // Legacy WebRTC signal bus
        key.startsWith('user_reactions_')      // Post reactions now kept in memory
      ) {
        keysToRemove.push(key);
      }
    }

    // Execute batch removal
    keysToRemove.forEach((k) => {
      try {
        localStorage.removeItem(k);
      } catch {}
    });

    if (keysToRemove.length > 0) {
      console.log(`[StorageSanitizer] Cleaned up ${keysToRemove.length} obsolete localStorage keys:`, keysToRemove);
    }
  } catch (err) {
    console.warn('[StorageSanitizer] Storage cleanup warning:', err);
  }
};
