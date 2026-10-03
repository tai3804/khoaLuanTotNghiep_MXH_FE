import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Bot, Send, X, Minimize2, Maximize2, Copy, Check, Lightbulb, PenTool, Hash, GraduationCap, Trash2 } from 'lucide-react';
import { aiService } from '../../services/aiService';
import { useAuth } from '../../context/AuthContext';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

const QUICK_PROMPTS = [
  { icon: <PenTool className="w-3.5 h-3.5" />, label: 'Viết caption hay', prompt: 'Gợi ý cho tôi 3 caption bài viết mạng xã hội về một ngày học tập nhiều năng lượng.' },
  { icon: <Hash className="w-3.5 h-3.5" />, label: 'Hashtag thịnh hành', prompt: 'Gợi ý các hashtag phổ biến về công nghệ thông tin và đời sống sinh viên.' },
  { icon: <Lightbulb className="w-3.5 h-3.5" />, label: 'Ý tưởng đăng bài', prompt: 'Gợi ý 3 chủ đề thảo luận thú vị để đăng lên nhóm sinh viên hôm nay.' },
  { icon: <GraduationCap className="w-3.5 h-3.5" />, label: 'Hỏi đáp học tập', prompt: 'Tóm tắt ngắn gọn các bước bảo vệ đồ án tốt nghiệp thành công.' },
];

export const AiSocialChatWidget: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: `Xin chào ${user?.fullName || 'bạn'}! 👋 Tôi là **Trợ lý AI KLTN Social**.\nTôi có thể giúp bạn sáng tạo nội dung bài viết, gợi ý hashtag, viết caption hoặc giải đáp mọi thắc mắc học tập & công nghệ!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen && !isMinimized) {
      scrollToBottom();
      inputRef.current?.focus();
    }
  }, [messages, isOpen, isMinimized]);

  if (!isAuthenticated) return null;

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || loading) return;

    const userMsg: Message = {
      id: 'msg-' + Date.now(),
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setLoading(true);

    try {
      const reply = await aiService.chatWithAi(text);
      const aiMsg: Message = {
        id: 'ai-' + Date.now(),
        sender: 'ai',
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      const errorMsg: Message = {
        id: 'ai-err-' + Date.now(),
        sender: 'ai',
        text: 'Xin lỗi, tôi gặp sự cố kết nối. Vui lòng thử lại sau ít phút.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: 'welcome-new',
        sender: 'ai',
        text: 'Đã làm mới cuộc trò chuyện. Bạn cần tôi hỗ trợ nội dung gì nào?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  return (
    <>
      {/* Compact Floating Toggle Button on Bottom-Left */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => {
            setIsOpen(true);
            setIsMinimized(false);
          }}
          className="fixed bottom-20 md:bottom-6 left-6 z-40 flex items-center justify-center w-12 h-12 bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 text-white rounded-full shadow-2xl hover:scale-110 hover:shadow-indigo-500/50 active:scale-95 transition-all duration-200 cursor-pointer group"
          title="Trợ lý AI KLTN"
        >
          <div className="relative flex items-center justify-center">
            <Bot className="w-6 h-6 transition-transform group-hover:rotate-12" />
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400"></span>
            </span>
          </div>
          <Sparkles className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 text-amber-300 animate-pulse" />
        </button>
      )}

      {/* Floating Chat Modal on Bottom-Left */}
      {isOpen && (
        <div
          className={`fixed left-4 md:left-6 z-50 transition-all duration-200 flex flex-col bg-white dark:bg-[#1e1f20] border border-gray-200 dark:border-[#383a3d] shadow-2xl rounded-2xl overflow-hidden ${
            isMinimized
              ? 'bottom-20 md:bottom-6 w-72 h-14'
              : 'bottom-20 md:bottom-6 w-[350px] sm:w-[390px] h-[520px] max-h-[82vh]'
          }`}
        >
          {/* Header */}
          <div className="px-4 py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white flex items-center justify-between shadow-sm shrink-0">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div>
                <h4 className="font-bold text-xs flex items-center gap-1.5 leading-tight">
                  <span>Trợ lý AI KLTN</span>
                  <span className="px-1.5 py-0.2 bg-emerald-500/80 text-[10px] rounded-full font-semibold uppercase tracking-wider">
                    Online
                  </span>
                </h4>
                <p className="text-[10px] text-blue-100 opacity-90">Sáng tạo & Hỗ trợ thông minh</p>
              </div>
            </div>

            <div className="flex items-center space-x-1 text-white/80">
              {!isMinimized && (
                <button
                  type="button"
                  onClick={handleClearChat}
                  title="Xóa lịch sử chat"
                  className="p-1.5 hover:bg-white/20 hover:text-white rounded-lg transition cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsMinimized(!isMinimized)}
                title={isMinimized ? 'Phóng to' : 'Thu nhỏ'}
                className="p-1.5 hover:bg-white/20 hover:text-white rounded-lg transition cursor-pointer"
              >
                {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                title="Đóng"
                className="p-1.5 hover:bg-white/20 hover:text-white rounded-lg transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Body */}
          {!isMinimized && (
            <>
              {/* Message History */}
              <div className="flex-1 p-3.5 overflow-y-auto space-y-3 text-xs bg-gray-50/50 dark:bg-[#18191a]/40">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div className="flex items-end gap-1.5 max-w-[85%]">
                      {msg.sender === 'ai' && (
                        <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 mb-1">
                          <Sparkles className="w-3 h-3" />
                        </div>
                      )}
                      <div
                        className={`p-3 rounded-2xl leading-relaxed whitespace-pre-wrap ${
                          msg.sender === 'user'
                            ? 'bg-[#1877f2] text-white rounded-br-xs'
                            : 'bg-white dark:bg-[#28292a] text-gray-800 dark:text-[#e4e6eb] border border-gray-200/80 dark:border-[#383a3d] shadow-xs rounded-bl-xs'
                        }`}
                      >
                        {msg.text.split('\n').map((line, lineIdx, arr) => {
                          const parts = line.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`)/g);
                          return (
                            <React.Fragment key={lineIdx}>
                              {parts.map((part, pIdx) => {
                                if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
                                  return <strong key={pIdx} className="font-semibold text-indigo-900 dark:text-indigo-300">{part.slice(2, -2)}</strong>;
                                }
                                if (part.startsWith('*') && part.endsWith('*') && part.length >= 2) {
                                  return <em key={pIdx} className="italic text-gray-700 dark:text-gray-300">{part.slice(1, -1)}</em>;
                                }
                                if (part.startsWith('`') && part.endsWith('`') && part.length >= 2) {
                                  return <code key={pIdx} className="px-1.5 py-0.5 bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 rounded font-mono text-[11px] border border-blue-200 dark:border-blue-800">{part.slice(1, -1)}</code>;
                                }
                                return part;
                              })}
                              {lineIdx < arr.length - 1 && <br />}
                            </React.Fragment>
                          );
                        })}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-1 px-1 text-[10px] text-gray-400">
                      <span>{msg.timestamp}</span>
                      {msg.sender === 'ai' && (
                        <button
                          type="button"
                          onClick={() => handleCopy(msg.id, msg.text)}
                          className="hover:text-blue-500 flex items-center gap-1 transition cursor-pointer"
                        >
                          {copiedId === msg.id ? (
                            <>
                              <Check className="w-2.5 h-2.5 text-emerald-500" />
                              <span className="text-emerald-500">Đã chép</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-2.5 h-2.5" />
                              <span>Sao chép</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                {loading && (
                  <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400 text-xs py-2">
                    <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center shrink-0">
                      <Sparkles className="w-3 h-3 text-indigo-500 animate-spin" />
                    </div>
                    <span className="italic">AI đang suy nghĩ và soạn câu trả lời...</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Prompts */}
              <div className="px-3 py-2 bg-white dark:bg-[#1e1f20] border-t border-gray-100 dark:border-[#2d2e30] flex gap-1.5 overflow-x-auto no-scrollbar">
                {QUICK_PROMPTS.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSend(item.prompt)}
                    disabled={loading}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 dark:bg-[#2a2b2c] hover:bg-blue-50 dark:hover:bg-blue-900/30 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 rounded-full text-[11px] font-medium whitespace-nowrap border border-gray-200/60 dark:border-gray-700 transition cursor-pointer shrink-0 disabled:opacity-50"
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>

              {/* Input Box */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="p-3 bg-white dark:bg-[#1e1f20] border-t border-gray-200 dark:border-[#383a3d] flex items-center space-x-2 shrink-0"
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Hỏi AI hoặc yêu cầu viết nội dung..."
                  disabled={loading}
                  className="flex-1 bg-gray-100 dark:bg-[#2a2b2c] text-gray-900 dark:text-[#e4e6eb] placeholder-gray-400 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  disabled={!inputMessage.trim() || loading}
                  className="p-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:opacity-95 disabled:opacity-40 transition shadow-sm cursor-pointer shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          )}
        </div>
      )}
    </>
  );
};

export default AiSocialChatWidget;
