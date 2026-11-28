import React from 'react';
import {
  FileText,
  FileSpreadsheet,
  FileArchive,
  FileCode,
  FileImage,
  FileVideo,
  FileAudio,
  Presentation,
  PenTool,
  Package,
  File,
  Download,
} from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';
import { fileCategory, fileExt, formatBytes, FileCategory } from './chatAttachment';

interface ChatFileAttachmentProps {
  fileUrl: string;
  fileName: string;
  fileSize?: number;
  isMe?: boolean;
  /** 0-100 khi đang tải lên; undefined khi đã gửi xong */
  progress?: number;
}

const ICONS: Record<FileCategory['icon'], React.ElementType> = {
  pdf: FileText,
  doc: FileText,
  sheet: FileSpreadsheet,
  slide: Presentation,
  archive: FileArchive,
  code: FileCode,
  text: FileText,
  image: FileImage,
  video: FileVideo,
  audio: FileAudio,
  design: PenTool,
  app: Package,
  file: File,
};

/** Ô biểu tượng theo loại tệp (dùng chung cho khung chat và tab File). */
export const FileTypeIcon: React.FC<{ ext: string; className?: string }> = ({ ext, className = 'w-10 h-10' }) => {
  const category = fileCategory(ext.toLowerCase());
  const Icon = ICONS[category.icon];
  return (
    <div className={`${className} rounded-xl flex items-center justify-center shrink-0 ${category.tone}`} title={category.label}>
      <Icon className="w-5 h-5" />
    </div>
  );
};

/** Thẻ tập tin kiểu Messenger: biểu tượng theo loại, tên, loại + dung lượng, nút tải về. */
export const ChatFileAttachment: React.FC<ChatFileAttachmentProps> = ({ fileUrl, fileName, fileSize, isMe = false, progress }) => {
  const { language } = useLanguage();
  const isEn = language === 'en';
  const ext = fileExt(fileName) || fileExt(fileUrl);
  const category = fileCategory(ext);
  const displayName = fileName || (isEn ? 'Attached file' : 'Tập tin đính kèm');
  const processing = progress !== undefined;

  const open = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation();
    if (!processing && fileUrl) window.open(fileUrl, '_blank', 'noopener,noreferrer');
  };

  const typeLabel = isEn || category.label.toUpperCase() === ext.toUpperCase() ? null : category.label;
  const meta = [ext ? ext.toUpperCase() : null, typeLabel, formatBytes(fileSize) || null].filter(Boolean).join(' · ');

  return (
    <div
      onClick={open}
      onKeyDown={(e) => e.key === 'Enter' && open(e)}
      role="button"
      tabIndex={0}
      title={processing ? displayName : isEn ? `Download ${displayName}` : `Tải về ${displayName}`}
      className={`group flex items-center gap-2.5 p-2.5 w-[230px] max-w-full rounded-2xl border transition select-none shadow-xs ${
        processing ? 'cursor-default' : 'cursor-pointer'
      } ${
        isMe
          ? 'bg-white dark:bg-[#2b2d2f] border-gray-200 dark:border-[#3e4042] hover:border-[var(--chat-accent,#1877f2)]'
          : 'bg-white dark:bg-[#2b2d2f] border-gray-200 dark:border-[#3e4042] hover:border-gray-300 dark:hover:border-gray-600'
      }`}
    >
      <FileTypeIcon ext={ext} />

      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-gray-900 dark:text-[#e4e6eb] truncate leading-tight" title={displayName}>
          {displayName}
        </p>
        {processing ? (
          <div className="mt-1">
            <div className="h-1 rounded-full bg-gray-200 dark:bg-[#3e4042] overflow-hidden">
              <div
                className="h-full bg-[var(--chat-accent,#1877f2)] transition-[width] duration-200"
                style={{ width: `${Math.max(4, progress!)}%` }}
              />
            </div>
            <p className="text-[10px] text-gray-500 dark:text-[#b0b3b8] mt-0.5">
              {isEn ? 'Processing…' : 'Đang xử lý…'} {progress! < 100 ? `${progress}%` : ''}
            </p>
          </div>
        ) : (
          <p className="text-[10px] text-gray-500 dark:text-[#b0b3b8] mt-0.5 truncate">{meta || (isEn ? 'File' : 'Tập tin')}</p>
        )}
      </div>

      {!processing && (
        <span
          className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 group-hover:text-[var(--chat-accent,#1877f2)] group-hover:bg-gray-100 dark:group-hover:bg-[#3e4042] transition shrink-0"
          aria-hidden
        >
          <Download className="w-4 h-4" />
        </span>
      )}
    </div>
  );
};
