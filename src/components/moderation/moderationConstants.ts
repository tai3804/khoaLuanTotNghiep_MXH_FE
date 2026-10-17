import {
  EyeOff,
  Trash2,
  AlertOctagon,
  Ban,
  Check,
  Undo2,
  CheckCircle2,
  Gavel,
} from 'lucide-react';
import { ModerationAction } from '../../services/moderationService';

export const reasonConfig: Record<
  string,
  { label: string; color: string; bgLight: string; bgDark: string; border: string }
> = {
  SPAM: {
    label: 'Spam & Rác',
    color: 'text-amber-700 dark:text-amber-300',
    bgLight: 'bg-amber-50/80',
    bgDark: 'dark:bg-amber-950/30',
    border: 'border-amber-200/60 dark:border-amber-900/40',
  },
  HATE_SPEECH: {
    label: 'Ngôn từ thù ghét',
    color: 'text-rose-700 dark:text-rose-300',
    bgLight: 'bg-rose-50/80',
    bgDark: 'dark:bg-rose-950/30',
    border: 'border-rose-200/60 dark:border-rose-900/40',
  },
  HARASSMENT: {
    label: 'Quấy rối & Đe dọa',
    color: 'text-orange-700 dark:text-orange-300',
    bgLight: 'bg-orange-50/80',
    bgDark: 'dark:bg-orange-950/30',
    border: 'border-orange-200/60 dark:border-orange-900/40',
  },
  VIOLENCE: {
    label: 'Bạo lực',
    color: 'text-red-700 dark:text-red-300',
    bgLight: 'bg-red-50/80',
    bgDark: 'dark:bg-red-950/30',
    border: 'border-red-200/60 dark:border-red-900/40',
  },
  INAPPROPRIATE_CONTENT: {
    label: 'Nội dung nhạy cảm',
    color: 'text-purple-700 dark:text-purple-300',
    bgLight: 'bg-purple-50/80',
    bgDark: 'dark:bg-purple-950/30',
    border: 'border-purple-200/60 dark:border-purple-900/40',
  },
  FALSE_INFORMATION: {
    label: 'Thông tin sai lệch',
    color: 'text-blue-700 dark:text-blue-300',
    bgLight: 'bg-blue-50/80',
    bgDark: 'dark:bg-blue-950/30',
    border: 'border-blue-200/60 dark:border-blue-900/40',
  },
  COPYRIGHT: {
    label: 'Bản quyền',
    color: 'text-indigo-700 dark:text-indigo-300',
    bgLight: 'bg-indigo-50/80',
    bgDark: 'dark:bg-indigo-950/30',
    border: 'border-indigo-200/60 dark:border-indigo-900/40',
  },
  OTHER: {
    label: 'Khác',
    color: 'text-gray-700 dark:text-gray-300',
    bgLight: 'bg-gray-100',
    bgDark: 'dark:bg-[#28292c]',
    border: 'border-gray-200 dark:border-[#383a3e]',
  },
};

export const actionDetails: Record<
  ModerationAction,
  { label: string; tone: 'danger' | 'warning' | 'neutral' | 'success'; icon: any }
> = {
  HIDE_POST: { label: 'Ẩn bài viết', tone: 'warning', icon: EyeOff },
  DELETE_POST: { label: 'Gỡ bài viết', tone: 'danger', icon: Trash2 },
  DELETE_COMMENT: { label: 'Gỡ bình luận', tone: 'danger', icon: Trash2 },
  WARN_USER: { label: 'Cảnh cáo tác giả', tone: 'warning', icon: AlertOctagon },
  BAN_USER: { label: 'Đề xuất cấm tài khoản', tone: 'danger', icon: Ban },
  DISMISS: { label: 'Bỏ qua (Hợp lệ)', tone: 'neutral', icon: Check },
  RESTORE_POST: { label: 'Khôi phục bài viết', tone: 'success', icon: Undo2 },
  APPEAL_ACCEPTED: { label: 'Chấp nhận kháng nghị', tone: 'success', icon: CheckCircle2 },
  APPEAL_REJECTED: { label: 'Bác bỏ kháng nghị', tone: 'neutral', icon: Gavel },
};

export const aiCategoryLabels: Record<string, string> = {
  PROFANITY: 'Ngôn từ tục tĩu',
  HATE_SPEECH: 'Ngôn từ thù ghét',
  HARASSMENT: 'Quấy rối / Xúc phạm',
  SEXUAL: 'Nội dung 18+',
  VIOLENCE: 'Bạo lực / Đe dọa',
  SPAM_SCAM: 'Spam / Lừa đảo / Cờ bạc',
  NONE: 'Không xác định',
};

export const aiSeverityStyles: Record<string, { label: string; className: string }> = {
  LOW: { label: 'Thấp', className: 'bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300' },
  MEDIUM: { label: 'Trung bình', className: 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300' },
  HIGH: { label: 'Cao', className: 'bg-orange-100 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300' },
  CRITICAL: { label: 'Nghiêm trọng', className: 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300' },
};
