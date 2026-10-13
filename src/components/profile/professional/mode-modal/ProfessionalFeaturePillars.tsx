import React from 'react';
import {
  Coins,
  BarChart3,
  Users,
  CalendarCheck,
  Eye,
  ShieldCheck,
  LucideIcon,
} from 'lucide-react';
import { useLanguage } from '../../../../context/LanguageContext';

interface BenefitItem {
  icon: LucideIcon;
  title: string;
  desc: string;
  tag: string;
}

export const ProfessionalFeaturePillars: React.FC = () => {
  const { language } = useLanguage();
  const isEn = language === 'en';

  const benefits: BenefitItem[] = isEn
    ? [
        {
          icon: Coins,
          title: 'Monetize your content',
          desc: 'See if you qualify to unlock monetization tools and earn money from your supporters and views.',
          tag: 'Monetization',
        },
        {
          icon: BarChart3,
          title: 'See content insights',
          desc: 'Learn more about your audience and see how your content is performing with 28-day reach and interaction data.',
          tag: 'Analytics',
        },
        {
          icon: Users,
          title: 'Let more people follow you',
          desc: "Your profile's follow settings will be set to Public so anyone can follow you and view your public content in their feed.",
          tag: 'Public Reach',
        },
        {
          icon: CalendarCheck,
          title: 'Auto post scheduler',
          desc: 'Draft and schedule your posts to publish during peak audience hours to maximize engagement.',
          tag: 'Scheduling',
        },
        {
          icon: Eye,
          title: 'Profile visitor analytics',
          desc: 'Keep track of recent visitors and view demographic insights such as age range, gender, and top locations.',
          tag: 'Audience',
        },
        {
          icon: ShieldCheck,
          title: 'Keep your privacy protected',
          desc: "Professional mode doesn't change the audience for posts you've previously shared. You still control Friends or Only me for any post.",
          tag: 'Privacy',
        },
      ]
    : [
        {
          icon: Coins,
          title: 'Kiếm tiền từ nội dung của bạn',
          desc: 'Xem bạn có đủ điều kiện mở khóa các công cụ kiếm tiền để nhận thưởng từ những người ủng hộ và lượt xem hay không.',
          tag: 'Kiếm tiền',
        },
        {
          icon: BarChart3,
          title: 'Xem thông tin chi tiết về nội dung',
          desc: 'Tìm hiểu thêm về đối tượng của bạn và theo dõi hiệu quả bài viết, số lượt tiếp cận, tương tác trong 28 ngày qua.',
          tag: 'Thống kê',
        },
        {
          icon: Users,
          title: 'Để nhiều người theo dõi bạn hơn',
          desc: 'Cài đặt người theo dõi trên trang cá nhân của bạn sẽ được đặt thành Công khai để bất kỳ ai cũng có thể theo dõi và xem bài viết công khai.',
          tag: 'Tiếp cận',
        },
        {
          icon: CalendarCheck,
          title: 'Lập lịch xuất bản bài viết tự động',
          desc: 'Soạn thảo và lên lịch đăng bài viết vào khung giờ vàng có nhiều người theo dõi hoạt động nhất để tối đa hóa tương tác.',
          tag: 'Lên lịch',
        },
        {
          icon: Eye,
          title: 'Ghi nhận và phân tích khách thăm hồ sơ',
          desc: 'Xem danh sách người dùng đã ghé thăm trang cá nhân gần đây cùng thông tin nhân khẩu học (độ tuổi, giới tính, thành phố).',
          tag: 'Khách thăm',
        },
        {
          icon: ShieldCheck,
          title: 'Toàn quyền kiểm soát quyền riêng tư',
          desc: 'Chế độ chuyên nghiệp không làm thay đổi bài viết cá nhân của bạn. Bạn vẫn toàn quyền chọn Bạn bè hoặc Riêng tư cho từng bài đăng.',
          tag: 'Quyền riêng tư',
        },
      ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between pb-1 border-b border-gray-100 dark:border-[#393a3b]">
        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-[#b0b3b8]">
          {isEn ? 'Professional Mode Benefits' : 'Các đặc quyền Chế độ chuyên nghiệp'}
        </h4>
        <span className="text-[11px] font-medium text-gray-400 dark:text-[#b0b3b8]">
          {isEn ? '6 Key Features' : '6 Quyền lợi chính'}
        </span>
      </div>

      {/* Grid of structured, clear boxed cards with monochrome icons and uniform height */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {benefits.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className="p-4 rounded-xl border border-gray-200 dark:border-[#393a3b] bg-gray-50/50 dark:bg-[#3a3b3c]/20 hover:bg-gray-100/50 dark:hover:bg-[#3a3b3c]/40 hover:border-gray-300 dark:hover:border-gray-500 transition-all flex items-start gap-3.5 text-left"
            >
              {/* Monochrome Neutral Icon */}
              <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-[#3a3b3c] flex items-center justify-center text-gray-700 dark:text-[#e4e6eb] shrink-0 mt-0.5">
                <Icon className="w-4 h-4" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-1.5 mb-1">
                  <h5 className="text-sm font-bold text-gray-900 dark:text-[#e4e6eb] leading-snug">
                    {item.title}
                  </h5>
                  <span className="text-[10px] font-semibold text-gray-500 dark:text-[#b0b3b8] bg-gray-200/70 dark:bg-[#3a3b3c] px-1.5 py-0.2 rounded shrink-0">
                    {item.tag}
                  </span>
                </div>
                <p className="text-xs text-gray-600 dark:text-[#b0b3b8] leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
