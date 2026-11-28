import React from 'react';

/** Khung thẻ dùng chung cho các phần của trang sơ đồ (cùng nền, viền, bo góc với các trang khác) */
export const Card: React.FC<{ className?: string; children: React.ReactNode }> = ({ className = '', children }) => (
  <section className={`bg-white dark:bg-[#242526] rounded-2xl border border-gray-200 dark:border-[#393a3b] shadow-xs p-4 sm:p-5 ${className}`}>
    {children}
  </section>
);

export const CardTitle: React.FC<{ title: string; description?: React.ReactNode }> = ({ title, description }) => (
  <div>
    <h2 className="text-sm font-bold text-gray-900 dark:text-[#e4e6eb]">{title}</h2>
    {description && <p className="text-[11px] text-gray-500 dark:text-[#b0b3b8] mt-0.5">{description}</p>}
  </div>
);

export const EmptyNote: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="text-xs text-gray-500 dark:text-[#b0b3b8]">{children}</p>
);

/** Chấm tròn màu trong chú thích và danh sách, cùng cỡ với chấm trên sơ đồ */
export const Dot: React.FC<{ className: string }> = ({ className }) => (
  <span className={`inline-block w-2.5 h-2.5 rounded-full shrink-0 ${className}`} />
);
