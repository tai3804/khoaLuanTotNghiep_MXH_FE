import React from 'react';
import { FileText, FileArchive, FileSpreadsheet, FileCode, File, Download, Loader2, RefreshCw } from 'lucide-react';
import { SharedFileItem } from './types';

interface SharedFilesSectionProps {
  fileList: SharedFileItem[];
  onLoadMoreHistory?: () => void;
  isLoadingMore?: boolean;
  hasLoadedFull?: boolean;
}

const formatFileSize = (bytes?: number): string => {
  if (!bytes || bytes <= 0) return 'Tệp đính kèm';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const getFileIcon = (extension: string) => {
  const ext = extension.toUpperCase();
  if (ext === 'PDF') {
    return <FileText className="w-6 h-6 text-red-500" />;
  }
  if (['DOC', 'DOCX'].includes(ext)) {
    return <FileText className="w-6 h-6 text-blue-500" />;
  }
  if (['XLS', 'XLSX', 'CSV'].includes(ext)) {
    return <FileSpreadsheet className="w-6 h-6 text-emerald-500" />;
  }
  if (['ZIP', 'RAR', '7Z', 'TAR', 'GZ'].includes(ext)) {
    return <FileArchive className="w-6 h-6 text-amber-500" />;
  }
  if (['JSON', 'JS', 'TS', 'HTML', 'CSS', 'PY', 'JAVA'].includes(ext)) {
    return <FileCode className="w-6 h-6 text-indigo-500" />;
  }
  return <File className="w-6 h-6 text-gray-500 dark:text-gray-400" />;
};

export const SharedFilesSection: React.FC<SharedFilesSectionProps> = ({
  fileList,
  onLoadMoreHistory,
  isLoadingMore,
  hasLoadedFull,
}) => {
  if (fileList.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-[#3a3b3c] flex items-center justify-center text-gray-400 mb-3">
          <File className="w-8 h-8 stroke-1.5" />
        </div>
        <p className="text-sm font-semibold text-gray-800 dark:text-[#e4e6eb] mb-1">
          Chưa có file tài liệu nào
        </p>
        <p className="text-xs text-gray-500 dark:text-[#b0b3b8] max-w-xs">
          Các tài liệu như PDF, Word, Excel, ZIP... được chia sẻ trong đoạn chat sẽ hiển thị ở đây.
        </p>

        {onLoadMoreHistory && !hasLoadedFull && (
          <button
            onClick={onLoadMoreHistory}
            disabled={isLoadingMore}
            className="mt-4 px-4 py-2 rounded-full bg-[#1877f2]/10 hover:bg-[#1877f2]/20 text-[#1877f2] dark:text-[#4599ff] text-xs font-semibold inline-flex items-center space-x-2 transition cursor-pointer disabled:opacity-50"
          >
            {isLoadingMore ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <RefreshCw className="w-3.5 h-3.5" />
            )}
            <span>Tìm trong lịch sử cũ hơn</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-5 space-y-3">
      <div className="flex items-center justify-between pb-1">
        <span className="text-xs font-bold text-gray-700 dark:text-[#e4e6eb] uppercase tracking-wider">
          File tài liệu ({fileList.length})
        </span>
        {onLoadMoreHistory && !hasLoadedFull && (
          <button
            onClick={onLoadMoreHistory}
            disabled={isLoadingMore}
            className="text-xs text-[#1877f2] dark:text-[#4599ff] hover:underline inline-flex items-center space-x-1.5 font-medium cursor-pointer disabled:opacity-50"
          >
            {isLoadingMore && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>Tải thêm file cũ</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {fileList.map((item) => (
          <div
            key={item.id}
            className="group flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-[#2d2e30] hover:bg-gray-100 dark:hover:bg-[#3a3b3c] border border-gray-100 dark:border-white/5 shadow-2xs hover:shadow-xs transition"
          >
            <div className="flex items-center space-x-3 min-w-0 pr-3">
              <div className="shrink-0 p-2.5 rounded-lg bg-white dark:bg-[#1e1f20] shadow-xs">
                {getFileIcon(item.extension)}
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-[#e4e6eb] truncate" title={item.fileName}>
                  {item.fileName}
                </p>
                <div className="flex items-center space-x-2 text-[11px] text-gray-500 dark:text-[#b0b3b8] mt-0.5">
                  <span className="font-medium text-gray-600 dark:text-gray-300">{formatFileSize(item.fileSize)}</span>
                  <span>•</span>
                  <span>{item.time}</span>
                  {item.senderName && (
                    <>
                      <span>•</span>
                      <span className="truncate max-w-[80px]">{item.senderName}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <a
              href={item.url}
              download={item.fileName}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 p-2 rounded-full text-gray-500 dark:text-gray-400 hover:text-white hover:bg-[#1877f2] dark:hover:bg-[#4599ff] bg-white dark:bg-[#1e1f20] transition shadow-xs cursor-pointer"
              title="Tải xuống tệp tin"
            >
              <Download className="w-4 h-4" />
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};
