import React from 'react';
import {
  FileText,
  FileSpreadsheet,
  FileArchive,
  FileCode,
  File,
  Download,
} from 'lucide-react';

interface ChatFileAttachmentProps {
  fileUrl: string;
  fileName?: string;
  fileSize?: number;
  isMe?: boolean;
}

const formatBytes = (bytes?: number): string => {
  if (!bytes || bytes <= 0) return '';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

const getFileNameFromUrl = (url: string, fallback?: string): string => {
  if (fallback && !fallback.startsWith('http://') && !fallback.startsWith('https://')) {
    return fallback;
  }
  try {
    const pathname = new URL(url).pathname;
    const parts = pathname.split('/');
    const last = parts[parts.length - 1];
    return decodeURIComponent(last) || 'Tập tin đính kèm';
  } catch {
    return fallback || 'Tập tin đính kèm';
  }
};

export const ChatFileAttachment: React.FC<ChatFileAttachmentProps> = ({
  fileUrl,
  fileName,
  fileSize,
  isMe = false,
}) => {
  const displayName = getFileNameFromUrl(fileUrl, fileName);
  const ext = displayName.split('.').pop()?.toLowerCase() || '';

  const renderIcon = () => {
    switch (ext) {
      case 'pdf':
        return <FileText className="w-6 h-6 text-red-500" />;
      case 'doc':
      case 'docx':
        return <FileText className="w-6 h-6 text-blue-500" />;
      case 'xls':
      case 'xlsx':
      case 'csv':
        return <FileSpreadsheet className="w-6 h-6 text-emerald-500" />;
      case 'zip':
      case 'rar':
      case '7z':
      case 'tar':
      case 'gz':
        return <FileArchive className="w-6 h-6 text-amber-500" />;
      case 'js':
      case 'ts':
      case 'tsx':
      case 'java':
      case 'py':
      case 'html':
      case 'css':
      case 'json':
        return <FileCode className="w-6 h-6 text-purple-500" />;
      default:
        return <File className="w-6 h-6 text-gray-500 dark:text-gray-400" />;
    }
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(fileUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      onClick={handleDownload}
      role="button"
      tabIndex={0}
      title={`Bấm để tải về: ${displayName}`}
      className={`group flex items-center gap-3 p-3 max-w-[280px] sm:max-w-[320px] rounded-2xl border transition-all cursor-pointer select-none shadow-xs ${
        isMe
          ? 'bg-[#1877f2]/10 dark:bg-[#1877f2]/20 border-[#1877f2]/30 hover:border-[#1877f2] hover:bg-[#1877f2]/15'
          : 'bg-white dark:bg-[#2b2d2f] border-gray-200 dark:border-[#3e4042] hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-[#343638]'
      }`}
    >
      <div className="w-10 h-10 rounded-xl bg-white dark:bg-[#3a3b3c] flex items-center justify-center shrink-0 shadow-xs border border-gray-100 dark:border-gray-700">
        {renderIcon()}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-gray-900 dark:text-[#e4e6eb] truncate leading-tight group-hover:text-[#1877f2] transition">
          {displayName}
        </p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="text-[10px] uppercase font-bold text-gray-400 dark:text-[#b0b3b8]">
            {ext || 'FILE'}
          </span>
          {fileSize && fileSize > 0 && (
            <>
              <span className="text-[10px] text-gray-400">·</span>
              <span className="text-[10px] text-gray-400 dark:text-[#b0b3b8]">
                {formatBytes(fileSize)}
              </span>
            </>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={handleDownload}
        className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-[#1877f2] dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#3e4042] transition shrink-0"
        title="Tải tập tin về"
      >
        <Download className="w-4 h-4" />
      </button>
    </div>
  );
};
