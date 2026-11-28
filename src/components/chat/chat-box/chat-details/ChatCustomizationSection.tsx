import React from 'react';
import { Check } from 'lucide-react';
import { CHAT_THEMES, themeColor } from '../chatPrefs';

interface ChatCustomizationSectionProps {
  themeId: string;
  onSelectTheme: (id: string) => void;
  quickEmoji: string;
  onSelectQuickEmoji: (emoji: string) => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

const QUICK_EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🔥', '🎉', '👏', '💯', '🙏', '😍', '😎', '🥰', '🙌', '✨', '⭐', '💪', '🤝'];

const Section: React.FC<{ title: string; desc: string; children: React.ReactNode }> = ({ title, desc, children }) => (
  <section className="py-4 first:pt-0 last:pb-0">
    <h4 className="text-sm font-semibold text-gray-900 dark:text-[#e4e6eb]">{title}</h4>
    <p className="text-xs text-gray-500 dark:text-[#b0b3b8] mt-0.5 mb-3">{desc}</p>
    {children}
  </section>
);

/** Tùy chỉnh riêng cuộc trò chuyện này: màu chủ đề, emoji gửi nhanh, tắt chuông. Áp dụng ngay vào khung chat. */
export const ChatCustomizationSection: React.FC<ChatCustomizationSectionProps> = ({
  themeId,
  onSelectTheme,
  quickEmoji,
  onSelectQuickEmoji,
  isMuted,
  onToggleMute,
}) => {
  const accent = themeColor(themeId);

  return (
    <div className="p-5 grid gap-6 md:grid-cols-[1fr_200px]">
      <div className="divide-y divide-gray-200 dark:divide-[#393a3b]">
        <Section title="Chủ đề" desc="Màu tin nhắn của bạn và nút gửi trong cuộc trò chuyện này.">
          <div className="flex flex-wrap gap-2.5">
            {CHAT_THEMES.map((t) => {
              const active = t.id === themeId;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => onSelectTheme(t.id)}
                  title={t.name}
                  aria-label={`Chủ đề ${t.name}`}
                  aria-pressed={active}
                  style={{ background: t.color }}
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-white transition cursor-pointer ${
                    active ? 'ring-2 ring-offset-2 ring-gray-900 dark:ring-white ring-offset-white dark:ring-offset-[#242526]' : 'hover:scale-110'
                  }`}
                >
                  {active && <Check className="w-4 h-4" />}
                </button>
              );
            })}
          </div>
        </Section>

        <Section title="Biểu tượng cảm xúc nhanh" desc="Nút ở cuối ô nhập tin, bấm một lần để gửi.">
          <div className="grid grid-cols-9 gap-1.5 max-w-[360px]">
            {QUICK_EMOJIS.map((emoji) => {
              const active = emoji === quickEmoji;
              return (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => onSelectQuickEmoji(emoji)}
                  aria-label={`Chọn ${emoji}`}
                  aria-pressed={active}
                  className={`h-9 rounded-lg text-xl flex items-center justify-center transition cursor-pointer ${
                    active ? 'bg-gray-200 dark:bg-[#4e4f50] ring-2 ring-[var(--accent)]' : 'hover:bg-gray-100 dark:hover:bg-[#3a3b3c]'
                  }`}
                  style={{ '--accent': accent } as React.CSSProperties}
                >
                  {emoji}
                </button>
              );
            })}
          </div>
        </Section>

        <Section title="Thông báo" desc="Tắt chuông thì tin nhắn mới vẫn đến, chỉ không phát âm thanh và không bật thông báo nổi.">
          <label className="flex items-center justify-between gap-3 cursor-pointer max-w-[360px]">
            <span className="text-sm text-gray-800 dark:text-[#e4e6eb]">Tắt chuông cuộc trò chuyện</span>
            <button
              type="button"
              role="switch"
              aria-checked={isMuted}
              onClick={onToggleMute}
              className={`relative w-11 h-6 rounded-full transition cursor-pointer ${isMuted ? 'bg-[#1877f2]' : 'bg-gray-300 dark:bg-[#4e4f50]'}`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${isMuted ? 'translate-x-5' : ''}`}
              />
            </button>
          </label>
        </Section>
      </div>

      {/* Xem trước khung chat với chủ đề và emoji đang chọn */}
      <div className="hidden md:block">
        <p className="text-xs font-semibold text-gray-500 dark:text-[#b0b3b8] mb-2">Xem trước</p>
        <div className="rounded-xl border border-gray-200 dark:border-[#393a3b] bg-gray-50 dark:bg-[#18191a] p-3 space-y-2 text-xs">
          <div className="max-w-[80%] rounded-2xl rounded-bl-none px-3 py-1.5 bg-white dark:bg-[#3a3b3c] text-gray-900 dark:text-[#e4e6eb] border border-gray-200 dark:border-[#4e4f50] w-fit">
            Tối nay đi cà phê không?
          </div>
          <div className="ml-auto max-w-[80%] rounded-2xl rounded-br-none px-3 py-1.5 text-white w-fit" style={{ background: accent }}>
            Đi luôn nhé!
          </div>
          <div className="text-right text-2xl leading-none">{quickEmoji}</div>
          <div className="flex items-center gap-2 pt-1">
            <div className="flex-1 h-7 rounded-full bg-white dark:bg-[#3a3b3c] border border-gray-200 dark:border-[#4e4f50]" />
            <span className="text-lg leading-none">{quickEmoji}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
