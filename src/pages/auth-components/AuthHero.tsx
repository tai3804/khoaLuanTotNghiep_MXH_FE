import React from 'react';
import { Sparkles } from 'lucide-react';

interface AuthHeroProps {
  t: (key: string) => string;
}

export const AuthHero: React.FC<AuthHeroProps> = ({ t }) => {
  return (
    <div className="lg:col-span-6 space-y-4 sm:space-y-6 text-center lg:text-left">
      <div className="inline-flex items-center space-x-2 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full bg-blue-900/70 border border-blue-400/40 text-blue-200 text-[11px] sm:text-xs font-bold shadow-lg backdrop-blur-md">
        <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400 animate-pulse" />
        <span>Mạng Xã Hội Khóa Luận Tốt Nghiệp 2026</span>
      </div>
      <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white leading-tight tracking-tight drop-shadow-md">
        {t('authTitle') || 'Kết Nối Với Bạn Bè Và Thế Giới Xung Quanh'}
      </h1>
      <p className="text-xs sm:text-base text-slate-200 max-w-lg leading-relaxed drop-shadow mx-auto lg:mx-0">
        {t('authSubTitle') || 'Nền tảng chia sẻ trạng thái, nhắn tin thời gian thực và tương tác với hiệu năng cao.'}
      </p>
    </div>
  );
};
