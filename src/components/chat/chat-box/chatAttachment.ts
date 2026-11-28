/**
 * Phân loại tin nhắn đính kèm (ảnh / video / âm thanh / tập tin) theo loại server trả về và phần mở rộng của tên tệp.
 * Ảnh gửi bằng nút đính kèm vẫn hiển thị như ảnh; tệp lạ (.vpp, .exe...) hiển thị thẻ tập tin, không đoán là ảnh.
 */
export type AttachmentKind = 'image' | 'video' | 'audio' | 'file';

const IMAGE_EXT = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'avif', 'svg', 'jfif', 'ico'];
const VIDEO_EXT = ['mp4', 'webm', 'mov', 'm4v', 'ogv', 'mkv'];
const AUDIO_EXT = ['mp3', 'wav', 'm4a', 'aac', 'oga', 'ogg', 'opus', 'flac'];

const isHttp = (s?: string | null) => !!s && /^https?:\/\//i.test(s);

/** Phần mở rộng (chữ thường) của tên tệp hoặc đường dẫn, bỏ query/hash. */
export const fileExt = (nameOrUrl?: string | null): string => {
  if (!nameOrUrl) return '';
  const path = nameOrUrl.split(/[?#]/)[0];
  const last = path.split('/').pop() || '';
  const dot = last.lastIndexOf('.');
  return dot > 0 ? last.slice(dot + 1).toLowerCase() : '';
};

export const kindFromExt = (ext: string): AttachmentKind | null => {
  if (IMAGE_EXT.includes(ext)) return 'image';
  if (VIDEO_EXT.includes(ext)) return 'video';
  if (AUDIO_EXT.includes(ext)) return 'audio';
  return null;
};

/** Loại tin nhắn khi gửi tệp: ưu tiên MIME, thiếu MIME thì theo phần mở rộng. */
export const messageTypeForFile = (file: File): 'IMAGE' | 'VIDEO' | 'FILE' => {
  const kind = file.type.startsWith('image/')
    ? 'image'
    : file.type.startsWith('video/')
      ? 'video'
      : kindFromExt(fileExt(file.name));
  return kind === 'image' ? 'IMAGE' : kind === 'video' ? 'VIDEO' : 'FILE';
};

interface AttachmentLike {
  type?: string;
  text?: string;
  mediaUrl?: string | null;
  fileName?: string;
}

/** Tên tệp hiển thị: tên gốc lưu trong nội dung tin, không có thì lấy từ đường dẫn. */
export const attachmentName = (m: AttachmentLike): string => {
  if (m.fileName) return m.fileName;
  if (m.text && !isHttp(m.text)) return m.text;
  const url = m.mediaUrl || m.text || '';
  try {
    return decodeURIComponent(url.split(/[?#]/)[0].split('/').pop() || '');
  } catch {
    return url.split('/').pop() || '';
  }
};

/** null = tin nhắn chữ thường. */
export const classifyAttachment = (m: AttachmentLike): AttachmentKind | null => {
  const type = (m.type || '').toUpperCase();
  if (type === 'AUDIO') return 'audio';
  if (type === 'IMAGE') return 'image';
  if (type === 'VIDEO') return 'video';

  const url = m.mediaUrl || (isHttp(m.text) && !/\s/.test(m.text!.trim()) ? m.text!.trim() : '');
  if (!url) return null;
  const byExt = kindFromExt(fileExt(attachmentName(m))) || kindFromExt(fileExt(url));
  if (byExt) return byExt;
  // Link thường trong tin nhắn chữ (không phải tệp đã tải lên) giữ nguyên là chữ
  if (!m.mediaUrl && type !== 'FILE') return null;
  return 'file';
};

export interface FileCategory {
  label: string;
  /** màu nền + chữ của ô biểu tượng */
  tone: string;
  icon: 'pdf' | 'doc' | 'sheet' | 'slide' | 'archive' | 'code' | 'text' | 'image' | 'video' | 'audio' | 'design' | 'app' | 'file';
}

const CATEGORIES: [string[], FileCategory][] = [
  [['pdf'], { label: 'PDF', tone: 'bg-red-100 text-red-600 dark:bg-red-500/15 dark:text-red-400', icon: 'pdf' }],
  [['doc', 'docx', 'odt', 'rtf'], { label: 'Word', tone: 'bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400', icon: 'doc' }],
  [['xls', 'xlsx', 'ods', 'csv'], { label: 'Bảng tính', tone: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400', icon: 'sheet' }],
  [['ppt', 'pptx', 'odp', 'key'], { label: 'Trình chiếu', tone: 'bg-orange-100 text-orange-600 dark:bg-orange-500/15 dark:text-orange-400', icon: 'slide' }],
  [['zip', 'rar', '7z', 'tar', 'gz', 'bz2', 'xz'], { label: 'Tệp nén', tone: 'bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400', icon: 'archive' }],
  [
    ['js', 'ts', 'tsx', 'jsx', 'java', 'py', 'c', 'cpp', 'cs', 'go', 'rb', 'php', 'html', 'css', 'json', 'xml', 'yml', 'yaml', 'sql', 'sh'],
    { label: 'Mã nguồn', tone: 'bg-violet-100 text-violet-600 dark:bg-violet-500/15 dark:text-violet-400', icon: 'code' },
  ],
  [['txt', 'md', 'log'], { label: 'Văn bản', tone: 'bg-slate-100 text-slate-600 dark:bg-slate-500/20 dark:text-slate-300', icon: 'text' }],
  [IMAGE_EXT.concat(['heic', 'tif', 'tiff', 'psd']), { label: 'Hình ảnh', tone: 'bg-pink-100 text-pink-600 dark:bg-pink-500/15 dark:text-pink-400', icon: 'image' }],
  [VIDEO_EXT.concat(['avi', 'wmv', 'flv']), { label: 'Video', tone: 'bg-fuchsia-100 text-fuchsia-600 dark:bg-fuchsia-500/15 dark:text-fuchsia-400', icon: 'video' }],
  [AUDIO_EXT, { label: 'Âm thanh', tone: 'bg-teal-100 text-teal-600 dark:bg-teal-500/15 dark:text-teal-400', icon: 'audio' }],
  [['vpp', 'vsdx', 'drawio', 'fig', 'sketch', 'xd', 'ai', 'mdj', 'asta'], { label: 'Sơ đồ', tone: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400', icon: 'design' }],
  [['exe', 'msi', 'apk', 'dmg', 'jar', 'deb'], { label: 'Ứng dụng', tone: 'bg-gray-200 text-gray-700 dark:bg-gray-500/20 dark:text-gray-300', icon: 'app' }],
];

const GENERIC: FileCategory = { label: 'Tập tin', tone: 'bg-gray-100 text-gray-600 dark:bg-[#3a3b3c] dark:text-[#b0b3b8]', icon: 'file' };

export const fileCategory = (ext: string): FileCategory => CATEGORIES.find(([exts]) => exts.includes(ext))?.[1] || GENERIC;

export const formatBytes = (bytes?: number): string => {
  if (!bytes || bytes <= 0) return '';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.min(units.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)));
  return `${parseFloat((bytes / Math.pow(1024, i)).toFixed(1))} ${units[i]}`;
};
