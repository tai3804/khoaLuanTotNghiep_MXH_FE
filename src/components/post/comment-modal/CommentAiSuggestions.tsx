import React, { useState } from 'react';
import { Sparkles, RefreshCw, X } from 'lucide-react';
import { aiService } from '../../../services/aiService';

interface CommentAiSuggestionsProps {
  postContent?: string;
  replyingToName?: string;
  onSelectReply: (reply: string) => void;
}

export const CommentAiSuggestions: React.FC<CommentAiSuggestionsProps> = ({
  postContent = '',
  replyingToName,
  onSelectReply,
}) => {
  const [show, setShow] = useState(false);
  const [replies, setReplies] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    if (show) {
      setShow(false);
      return;
    }
    setShow(true);
    if (replies.length === 0) {
      setLoading(true);
      try {
        const context = replyingToName ? `Phản hồi cho ${replyingToName}` : postContent;
        const res = await aiService.suggestReplies(context);
        setReplies(res);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleRefresh = async () => {
    setLoading(true);
    try {
      const context = replyingToName ? `Phản hồi cho ${replyingToName}` : postContent;
      const res = await aiService.suggestReplies(context);
      setReplies(res);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={handleToggle}
          className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[11px] font-bold transition cursor-pointer ${
            show
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-[#1877f2] dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50'
          }`}
        >
          <Sparkles className="w-3 h-3" />
          <span>{show ? 'Ẩn gợi ý AI' : '✨ Gợi ý bình luận nhanh'}</span>
        </button>

        {show && (
          <div className="flex items-center space-x-1.5">
            <button
              type="button"
              disabled={loading}
              onClick={handleRefresh}
              className="p-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition cursor-pointer"
              title="Đổi gợi ý khác"
            >
              <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              type="button"
              onClick={() => setShow(false)}
              className="p-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition cursor-pointer"
              title="Đóng"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>

      {show && (
        <div className="flex flex-wrap gap-1.5 pt-1 animate-fadeIn">
          {loading ? (
            <div className="text-[11px] text-gray-400 dark:text-gray-500 italic flex items-center space-x-1 py-0.5">
              <RefreshCw className="w-3 h-3 animate-spin" />
              <span>AI đang gợi ý câu trả lời phù hợp...</span>
            </div>
          ) : (
            replies.map((reply, i) => (
              <button
                key={i}
                type="button"
                onClick={() => onSelectReply(reply)}
                className="text-[11px] px-2.5 py-1 rounded-full bg-gray-100 hover:bg-blue-50 dark:bg-[#3a3b3c] dark:hover:bg-blue-900/30 text-gray-800 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 border border-gray-200 dark:border-[#4e4f50] transition cursor-pointer text-left leading-normal"
              >
                {reply}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};
