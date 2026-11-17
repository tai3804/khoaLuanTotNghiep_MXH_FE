import React from 'react';
import { Link } from 'react-router-dom';
import { FileText } from 'lucide-react';
import type { ChatSource } from '../../services/aiService';

interface AiChatSourcesProps {
  sources?: ChatSource[];
}

/**
 * Danh sách bài viết được trợ lý AI dùng làm tư liệu (RAG), đánh số [1], [2], ... đúng với số nguồn trong câu trả lời.
 * Bấm vào một nguồn để mở bài viết tương ứng.
 */
export const AiChatSources: React.FC<AiChatSourcesProps> = ({ sources }) => {
  if (!sources || sources.length === 0) return null;

  return (
    <div className="mt-1.5 max-w-[85%] pl-7">
      <div className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-gray-400">
        <FileText className="w-2.5 h-2.5" />
        <span>Nguồn tham khảo</span>
      </div>
      <ul className="mt-1 space-y-1">
        {sources.map((source, index) => (
          <li key={source.postId}>
            <Link
              to={`/posts/${source.postId}`}
              className="flex gap-1.5 rounded-lg border border-gray-200 dark:border-[#393a3b] bg-white/70 dark:bg-[#242526] px-2 py-1.5 text-[11px] leading-snug text-gray-600 dark:text-gray-300 hover:border-blue-400 hover:text-blue-600 transition"
            >
              <span className="font-semibold text-blue-600 dark:text-blue-400 shrink-0">[{index + 1}]</span>
              <span className="line-clamp-2">{source.snippet}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};
