/**
 * Sanitizes and cleans up obsolete, redundant, or temporary keys in localStorage.
 * Ensures storage is tidy, minimal, production-ready, and free of legacy/test data.
 */
export const sanitizeLocalStorage = (): void => {
  if (typeof window === 'undefined' || !window.localStorage) return;

  try {
    const keysToRemove: string[] = [];

    // 1. Obsolete exact keys to eliminate
    const obsoleteExactKeys = [
      'token',                  // Pure in-memory (Redux) security model
      'refreshToken',           // Handled strictly via HttpOnly cookie
      'admin_refresh_token',    // Obsolete admin token key
      'currentUserId',          // Redundant: user.id is already stored in 'user'
      'my_friend_ids',          // In-memory cache in userService
      'lastRevokedAt',          // Ephemeral cross-tab signal, no need to persist
      'privacy_friend_list',    // Redundant setting, fetched from API
      'privacy_friend_request', // Redundant setting, fetched from API
      'privacy_search',         // Redundant setting, fetched from API
      'kltn_media_ratio_v1',    // Migrated to sessionStorage
      'kltn_saved_post_ids',    // Saved posts are managed server-side
      'kltn_search_history',    // Legacy search history with test terms
      'kltn_pinned_posts',      // Legacy post pins
      'kltn_muted_posts',       // Legacy muted posts
      'kltn_friend_action_status',
      'kltn_hidden_post_ids',
      'kltn_live_host_session',
      'kltn_prof_mode_enabled',
      'kltn_ended_streams',     // Moved to sessionStorage
    ];

    obsoleteExactKeys.forEach((k) => {
      if (localStorage.getItem(k) !== null) {
        keysToRemove.push(k);
      }
    });

    // 2. Migrate legacy sidebar state to clean keys before removing
    const legacyCollapsed = localStorage.getItem('kltn_sidebar_left_collapsed');
    if (legacyCollapsed !== null) {
      if (localStorage.getItem('sidebar_left_collapsed') === null) {
        localStorage.setItem('sidebar_left_collapsed', legacyCollapsed);
      }
      keysToRemove.push('kltn_sidebar_left_collapsed');
    }

    const legacyShowMore = localStorage.getItem('kltn_sidebar_left_show_more');
    if (legacyShowMore !== null) {
      if (localStorage.getItem('sidebar_left_show_more') === null) {
        localStorage.setItem('sidebar_left_show_more', legacyShowMore);
      }
      keysToRemove.push('kltn_sidebar_left_show_more');
    }

    const legacyProfMode = localStorage.getItem('kltn_prof_mode_enabled');
    if (legacyProfMode !== null) {
      if (localStorage.getItem('prof_mode_enabled') === null) {
        localStorage.setItem('prof_mode_enabled', legacyProfMode);
      }
      keysToRemove.push('kltn_prof_mode_enabled');
    }

    // 3. Scan for dynamic temporary/spam keys
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;

      if (
        key.startsWith('kltn_') ||                      // Any legacy kltn_ prefixed keys
        key.startsWith('mfa_enabled_') ||               // Dynamic user MFA flags (moved to session/state)
        key.startsWith('chat_emoji_') ||                // Dynamic per-conversation emoji keys (moved to session)
        key.startsWith('post_translation_disabled_') || // Dynamic per-post translation flags (moved to session)
        key.startsWith('user_reactions_') ||            // Legacy reactions cache
        key.startsWith('kltn_live_signal_')             // Legacy WebRTC signal bus
      ) {
        keysToRemove.push(key);
      }
    }

    // 4. Execute batch removal
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
