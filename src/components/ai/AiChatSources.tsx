import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, FileText } from 'lucide-react';
import type { ChatSource } from '../../services/aiService';

interface AiChatSourcesProps {
  sources?: ChatSource[];
}

const ROW_CLASS =
  'flex gap-1.5 rounded-lg border border-gray-200 dark:border-[#393a3b] bg-white/70 dark:bg-[#242526] px-2 py-1.5 text-[11px] leading-snug text-gray-600 dark:text-gray-300';

/**
 * Danh sách tư liệu được trợ lý AI dùng (RAG), đánh số [1], [2], ... đúng với số nguồn trong câu trả lời.
 * Bài viết là liên kết mở đúng bài; mục tài liệu hướng dẫn hiển thị tên "Tài liệu > Mục" và không có liên kết.
 */
export const AiChatSources: React.FC<AiChatSourcesProps> = ({ sources }) => {
  if (!sources || sources.length === 0) return null;

  return (
    <div className="mt-1.5 max-w-[85%] pl-7">
      <div className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-gray-400">
        <FileText className="w-2.5 h-2.5" aria-hidden="true" />
        <span>Nguồn tham khảo</span>
      </div>
      <ul className="mt-1 space-y-1">
        {sources.map((source, index) => {
          const isDoc = source.type === 'DOC' || (!source.postId && Boolean(source.title));
          const number = <span className="font-semibold text-blue-600 dark:text-blue-400 shrink-0">[{index + 1}]</span>;

          if (isDoc) {
            return (
              <li key={`doc-${index}-${source.title}`}>
                <div className={ROW_CLASS}>
                  {number}
                  <span className="min-w-0">
                    <span className="flex items-center gap-1 font-semibold text-gray-700 dark:text-gray-200">
                      <BookOpen className="w-3 h-3 shrink-0" aria-hidden="true" />
                      <span className="truncate">{source.title}</span>
                    </span>
                    <span className="line-clamp-2">{source.snippet}</span>
                  </span>
                </div>
              </li>
            );
          }

          return (
            <li key={`post-${source.postId}`}>
              <Link
                to={`/posts/${source.postId}`}
                className={`${ROW_CLASS} hover:border-blue-400 hover:text-blue-600 transition`}
              >
                {number}
                <span className="line-clamp-2">{source.snippet}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
