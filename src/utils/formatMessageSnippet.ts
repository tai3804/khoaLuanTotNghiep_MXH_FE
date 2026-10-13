/**
 * Utility to format message previews/snippets in chat dropdowns, sidebar, and lists.
 * Replaces ugly raw URLs, image hashes/keys, and post links with human-readable text.
 */

const POST_URL_REGEX = /(?:https?:\/\/[^\s/]+)?\/posts?\/([a-zA-Z0-9_-]+)/i;
const IMAGE_EXT_REGEX = /\.(jpe?g|png|gif|webp|bmp|svg)(\?.*)?$/i;
const VIDEO_EXT_REGEX = /\.(mp4|webm|mov|mkv|avi|m4v)(\?.*)?$/i;
const AUDIO_EXT_REGEX = /\.(mp3|wav|m4a|aac|ogg|opus)(\?.*)?$/i;
const FILE_EXT_REGEX = /\.(pdf|docx?|xlsx?|pptx?|zip|rar|7z|tar|gz)(\?.*)?$/i;

export const formatMessageSnippet = (content?: string | null, fallback = ''): string => {
  if (!content || typeof content !== 'string') {
    return fallback;
  }

  const trimmed = content.trim();
  if (!trimmed) return fallback;

  // 1. Check if the message is or contains a shared post link
  const postMatch = trimmed.match(POST_URL_REGEX);
  if (postMatch) {
    const isSolelyPostUrl =
      trimmed === postMatch[0] ||
      trimmed.replace(/https?:\/\/[^\s/]+/, '').trim() === `/posts/${postMatch[1]}` ||
      trimmed.replace(/https?:\/\/[^\s/]+/, '').trim() === `/post/${postMatch[1]}`;

    if (isSolelyPostUrl) {
      return '📰 [Đã chia sẻ một bài viết]';
    }

    // Has custom text/note along with post url
    const cleanNote = trimmed.replace(POST_URL_REGEX, '').trim();
    if (cleanNote) {
      return `${cleanNote} [Bài viết]`;
    }
    return '📰 [Đã chia sẻ một bài viết]';
  }

  // 2. Video check
  if (VIDEO_EXT_REGEX.test(trimmed)) {
    return '🎥 [Video]';
  }

  // 3. Audio check
  if (AUDIO_EXT_REGEX.test(trimmed)) {
    return '🎤 [Đoạn ghi âm]';
  }

  // 4. Document / file check
  if (FILE_EXT_REGEX.test(trimmed)) {
    return '📁 [Tập tin]';
  }

  // 5. Image check:
  // - Explicit image extensions (.jpg, .png, etc.)
  // - Starts with data:image/
  // - Contains Google Photos/Drive image format e.g. '=w' or '=s' parameter or googleusercontent
  // - Cloud storage keys without spaces like chats/xxx, images/xxx, uploads/xxx
  // - Long hash/token without spaces containing image/photo patterns
  const isGoogleImageKey =
    !trimmed.includes(' ') &&
    (trimmed.includes('=w') || trimmed.includes('=s') || trimmed.includes('googleusercontent') || trimmed.includes('drive.google')) &&
    trimmed.length > 20;

  const isCloudStorageImageKey =
    !trimmed.includes(' ') &&
    (trimmed.startsWith('chats/') || trimmed.startsWith('images/') || trimmed.startsWith('media/') || trimmed.startsWith('uploads/')) &&
    (IMAGE_EXT_REGEX.test(trimmed) || trimmed.length > 20);

  const isRawImageString =
    !trimmed.includes(' ') &&
    trimmed.length > 30 &&
    (/^[a-zA-Z0-9_=-]+$/.test(trimmed) || trimmed.includes('media') || trimmed.includes('image'));

  if (
    IMAGE_EXT_REGEX.test(trimmed) ||
    trimmed.startsWith('data:image/') ||
    isGoogleImageKey ||
    isCloudStorageImageKey ||
    isRawImageString
  ) {
    return '📷 [Hình ảnh]';
  }

  // 6. Generic external web link
  if (/^https?:\/\/[^\s]+$/.test(trimmed)) {
    return '🔗 [Liên kết]';
  }

  // 7. Clean up markdown mentions like @[Nguyen Anh Ngoc] or @[Name](id)
  let cleanText = trimmed
    .replace(/@\[([^\]]+)\](?:\([a-zA-Z0-9_-]+\))?/g, '@$1')
    .replace(/\s+/g, ' ');

  return cleanText;
};
