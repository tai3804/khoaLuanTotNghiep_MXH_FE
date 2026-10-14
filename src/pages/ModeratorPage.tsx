import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  FileWarning,
  Gavel,
  History,
  Loader2,
  ShieldAlert,
  ShieldCheck,
  Search,
  RefreshCw,
  Trash2,
  EyeOff,
  Sparkles,
  X,
  Check,
  Ban,
  AlertOctagon,
  ArrowRight,
  Shield,
  ChevronDown,
  ThumbsUp,
  MessageSquare,
  Undo2,
  ExternalLink,
} from 'lucide-react';
import { Header } from '../components/layout/header-bar';
import { ModeratorSidebarNav } from '../components/moderation/ModeratorSidebarNav';
import { SidebarRight } from '../components/layout/SidebarRight';
import { ChatUser } from '../components/chat/chat-box';
import { moderationService, ModerationAction, ModerationLog, ModerationReport } from '../services/moderationService';
import { postService } from '../services/postService';
import { userService } from '../services/userService';
import { useToast } from '../context/ToastContext';
import { useAuth, rolesFromToken } from '../context/AuthContext';
import { Post } from '../types';

interface ModeratorPageProps {
  activeSidebarFilter?: string;
  setActiveSidebarFilter?: (filter: string) => void;
  activeNavTab: string;
  setActiveNavTab: (tab: string) => void;
  onNavigateSettings: () => void;
  onNavigateProfile: (uid?: string) => void;
  onNavigateAuth: () => void;
  activeChatUser: ChatUser | null;
  setActiveChatUser: (user: ChatUser | null) => void;
}

const reasonConfig: Record<string, { label: string; color: string; bgLight: string; bgDark: string; border: string }> = {
  SPAM: {
    label: 'Spam & Quảng cáo',
    color: 'text-amber-500',
    bgLight: 'bg-amber-50',
    bgDark: 'dark:bg-amber-950/40',
    border: 'border-amber-200 dark:border-amber-800/50',
  },
  HATE_SPEECH: {
    label: 'Ngôn từ thù ghét',
    color: 'text-rose-500',
    bgLight: 'bg-rose-50',
    bgDark: 'dark:bg-rose-950/40',
    border: 'border-rose-200 dark:border-rose-800/50',
  },
  HARASSMENT: {
    label: 'Quấy rối & Đe dọa',
    color: 'text-orange-500',
    bgLight: 'bg-orange-50',
    bgDark: 'dark:bg-orange-950/40',
    border: 'border-orange-200 dark:border-orange-800/50',
  },
  VIOLENCE: {
    label: 'Bạo lực nguy hiểm',
    color: 'text-red-500',
    bgLight: 'bg-red-50',
    bgDark: 'dark:bg-red-950/40',
    border: 'border-red-200 dark:border-red-800/50',
  },
  INAPPROPRIATE_CONTENT: {
    label: 'Nội dung nhạy cảm',
    color: 'text-purple-500',
    bgLight: 'bg-purple-50',
    bgDark: 'dark:bg-purple-950/40',
    border: 'border-purple-200 dark:border-purple-800/50',
  },
  FALSE_INFORMATION: {
    label: 'Thông tin sai lệch',
    color: 'text-blue-500',
    bgLight: 'bg-blue-50',
    bgDark: 'dark:bg-blue-950/40',
    border: 'border-blue-200 dark:border-blue-800/50',
  },
  COPYRIGHT: {
    label: 'Vi phạm bản quyền',
    color: 'text-indigo-500',
    bgLight: 'bg-indigo-50',
    bgDark: 'dark:bg-indigo-950/40',
    border: 'border-indigo-200 dark:border-indigo-800/50',
  },
  OTHER: {
    label: 'Vi phạm khác',
    color: 'text-gray-500',
    bgLight: 'bg-gray-50',
    bgDark: 'dark:bg-gray-800/40',
    border: 'border-gray-200 dark:border-gray-700',
  },
};

const actionDetails: Record<
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

// Nhóm vi phạm do AI (Gemini) phân loại
const aiCategoryLabels: Record<string, string> = {
  PROFANITY: 'Ngôn từ tục tĩu',
  HATE_SPEECH: 'Ngôn từ thù ghét',
  HARASSMENT: 'Quấy rối / Xúc phạm',
  SEXUAL: 'Nội dung 18+',
  VIOLENCE: 'Bạo lực / Đe dọa',
  SPAM_SCAM: 'Spam / Lừa đảo / Cờ bạc',
  NONE: 'Không xác định',
};

const aiSeverityStyles: Record<string, { label: string; className: string }> = {
  LOW: { label: 'Thấp', className: 'bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300' },
  MEDIUM: { label: 'Trung bình', className: 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300' },
  HIGH: { label: 'Cao', className: 'bg-orange-100 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300' },
  CRITICAL: { label: 'Nghiêm trọng', className: 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300' },
};

// ---- Bộ lọc của trang kiểm duyệt ----
type ModeratorTab = 'queue' | 'ai' | 'history' | 'appeals';
type RangeFilter = 'ALL' | 'TODAY' | '7D' | '30D';
type SortOrder = 'newest' | 'oldest';
type SourceFilter = 'ALL' | 'AI' | 'USER';
type ActorFilter = 'ALL' | 'AUTO' | 'HUMAN';

// moderatorId dùng cho các quyết định tự động của hệ thống (vd: tự ẩn khi vượt ngưỡng báo cáo)
const SYSTEM_MODERATOR_ID = '00000000-0000-0000-0000-000000000000';

const reasonOptions = [
  { value: 'ALL', label: 'Mọi loại vi phạm' },
  { value: 'SPAM', label: 'Spam / Rác' },
  { value: 'HATE_SPEECH', label: 'Ngôn từ thù ghét' },
  { value: 'HARASSMENT', label: 'Quấy rối / Đe dọa' },
  { value: 'VIOLENCE', label: 'Bạo lực' },
  { value: 'INAPPROPRIATE_CONTENT', label: 'Nội dung nhạy cảm' },
  { value: 'FALSE_INFORMATION', label: 'Thông tin sai lệch' },
  { value: 'COPYRIGHT', label: 'Vi phạm bản quyền' },
  { value: 'OTHER', label: 'Khác' },
];

const sortOptions = [
  { value: 'newest', label: 'Mới nhất trước' },
  { value: 'oldest', label: 'Cũ nhất trước' },
];

const rangeOptions: { value: RangeFilter; label: string }[] = [
  { value: 'ALL', label: 'Tất cả' },
  { value: 'TODAY', label: 'Hôm nay' },
  { value: '7D', label: '7 ngày qua' },
  { value: '30D', label: '30 ngày qua' },
];

const withinRange = (iso: string | undefined, range: RangeFilter) => {
  if (range === 'ALL') return true;
  const t = iso ? new Date(iso).getTime() : NaN;
  if (Number.isNaN(t)) return false;
  const now = new Date();
  if (range === 'TODAY') {
    return t >= new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  }
  const days = range === '7D' ? 7 : 30;
  return t >= now.getTime() - days * 86_400_000;
};

// Quyết định do hệ thống / AI tự động đưa ra (không phải kiểm duyệt viên thao tác tay)
const isAutomatedLog = (log: ModerationLog) =>
  log.moderatorId === SYSTEM_MODERATOR_ID || /^\s*(AI|Tự động)/i.test(log.note || '');

const byDate =
  <T,>(getDate: (item: T) => string | undefined, order: SortOrder) =>
  (a: T, b: T) => {
    const ta = new Date(getDate(a) || 0).getTime();
    const tb = new Date(getDate(b) || 0).getTime();
    return order === 'newest' ? tb - ta : ta - tb;
  };

export const ModeratorPage: React.FC<ModeratorPageProps> = (props) => {
  const { user, isAuthenticated, openLoginModal } = useAuth();
  const [tab, setTab] = useState<'queue' | 'ai' | 'history' | 'appeals'>('queue');

  // Appeals state
  const [appeals, setAppeals] = useState<any[]>([]);
  const [appealAuthors, setAppealAuthors] = useState<Record<string, { name: string; avatarUrl?: string }>>({});
  const [appealsLoading, setAppealsLoading] = useState(false);
  const [appealBusy, setAppealBusy] = useState<string | null>(null);
  const [reports, setReports] = useState<ModerationReport[]>([]);
  const [logs, setLogs] = useState<ModerationLog[]>([]);
  const [loading, setLoading] = useState(true);

  // Mapped post content cache
  const [postsMap, setPostsMap] = useState<Record<string, Post | null>>({});
  const [loadingPostsMap, setLoadingPostsMap] = useState<Record<string, boolean>>({});

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [reasonFilter, setReasonFilter] = useState<string>('ALL');
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>('ALL');
  const [actionFilter, setActionFilter] = useState<string>('ALL');
  const [rangeFilter, setRangeFilter] = useState<RangeFilter>('ALL');
  const [actorFilter, setActorFilter] = useState<ActorFilter>('ALL');

  // Modal & Detailed Processing
  const [selected, setSelected] = useState<ModerationReport | null>(null);
  const [note, setNote] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);

  const toast = useToast();

  const canModerate = useMemo(() => {
    const allRoles = (user?.roles || []).map((r) => String(r).toUpperCase());
    return allRoles.some(
      (role) =>
        role === 'ROLE_MODERATOR' ||
        role === 'MODERATOR' ||
        role === 'ROLE_ADMIN' ||
        role === 'ADMIN'
    );
  }, [user]);

  const load = async () => {
    try {
      setLoading(true);
      const [nextReports, nextLogs] = await Promise.all([
        moderationService.getReports(),
        moderationService.getLogs(),
      ]);
      setReports(nextReports);
      setLogs(nextLogs);
    } catch {
      toast.showError('Không tải được dữ liệu kiểm duyệt.');
    } finally {
      setLoading(false);
    }
  };

  const loadAppeals = async () => {
    try {
      setAppealsLoading(true);
      const list = await postService.getModerationAppeals();
      const safeList = Array.isArray(list) ? list : [];
      setAppeals(safeList);
      const ids = [...new Set(safeList.map((a: any) => a.authorId).filter(Boolean))] as string[];
      const profiles = await Promise.all(
        ids.map(async (id) => {
          try {
            const p = await userService.getUserProfile(id);
            const parts = [p?.lastName, p?.middleName, p?.firstName].filter(Boolean);
            const name = p?.fullName || parts.join(' ').trim() || p?.username || `Người dùng ${id.slice(0, 8)}`;
            return [id, { name, avatarUrl: p?.avatarUrl }] as const;
          } catch {
            return [id, { name: `Người dùng ${id.slice(0, 8)}` }] as const;
          }
        })
      );
      setAppealAuthors(Object.fromEntries(profiles));
    } catch {
      toast.showError('Không tải được hàng chờ kháng nghị.');
    } finally {
      setAppealsLoading(false);
    }
  };

  const reviewAppeal = async (postId: string, approved: boolean) => {
    try {
      setAppealBusy(postId);
      await postService.reviewModerationAppeal(postId, approved);
      toast.showSuccess(approved ? 'Đã chấp nhận và khôi phục bài viết.' : 'Đã bác bỏ kháng nghị.');
      await loadAppeals();
    } catch {
      toast.showError('Không thể xử lý kháng nghị.');
    } finally {
      setAppealBusy(null);
    }
  };

  useEffect(() => {
    if (canModerate) load();
  }, [canModerate]);

  useEffect(() => {
    if (canModerate && tab === 'appeals') void loadAppeals();
  }, [canModerate, tab]);

  // Fetch actual post content & author info for all reported posts and logged items
  useEffect(() => {
    const postIds = Array.from(
      new Set([
        ...reports
          .filter((r) => r.targetType === 'POST' || !r.targetType)
          .map((r) => r.targetId)
          .filter(Boolean),
        ...logs
          .filter((l) => l.targetType === 'POST' || !l.targetType)
          .map((l) => l.targetId)
          .filter(Boolean),
      ])
    );

    const missing = postIds.filter((id) => postsMap[id] === undefined && !loadingPostsMap[id]);
    if (missing.length === 0) return;

    setLoadingPostsMap((prev) => {
      const next = { ...prev };
      missing.forEach((id) => {
        next[id] = true;
      });
      return next;
    });

    Promise.all(
      missing.map(async (id) => {
        try {
          const post = await postService.getPostById(id);
          if (post) {
            // Guarantee author display name & avatar if generic
            if (!post.authorName || post.authorName === 'Thành viên KLTN' || post.authorName === 'Người dùng') {
              try {
                const profile = await userService.getUserProfile(post.userId);
                if (profile) {
                  const parts = [profile.lastName, profile.middleName, profile.firstName].filter(Boolean);
                  const name = profile.fullName || parts.join(' ').trim() || profile.username;
                  if (name) post.authorName = name;
                  if (profile.avatarUrl) post.authorAvatar = profile.avatarUrl;
                }
              } catch {}
            }
          }
          return { id, post };
        } catch {
          return { id, post: null };
        }
      })
    ).then((results) => {
      setPostsMap((prev) => {
        const next = { ...prev };
        results.forEach(({ id, post }) => {
          next[id] = post;
        });
        return next;
      });
      setLoadingPostsMap((prev) => {
        const next = { ...prev };
        results.forEach(({ id }) => {
          next[id] = false;
        });
        return next;
      });
    });
  }, [reports, logs, postsMap, loadingPostsMap]);

  // Only focus on POST reports as requested
  const postReports = useMemo(() => {
    return reports.filter((r) => r.targetType === 'POST' || !r.targetType);
  }, [reports]);

  const pending = useMemo(
    () => postReports.filter((r) => r.status === 'PENDING' || r.status === 'REVIEWING'),
    [postReports]
  );
  // Bài do AI tự động gắn cờ (báo cáo nguồn "AI") đang chờ kiểm duyệt viên quyết định
  const aiFlagged = useMemo(
    () => pending.filter((r) => r.source === 'AI' || r.status === 'REVIEWING'),
    [pending]
  );

  const resetFilters = () => {
    setSearchQuery('');
    setReasonFilter('ALL');
    setSourceFilter('ALL');
    setActionFilter('ALL');
    setRangeFilter('ALL');
    setActorFilter('ALL');
    setSortOrder('newest');
  };

  // Mỗi tab có bộ lọc riêng nên đổi tab thì xoá bộ lọc cũ
  useEffect(() => {
    resetFilters();
  }, [tab]);

  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    (tab !== 'appeals' && reasonFilter !== 'ALL') ||
    (tab === 'queue' && sourceFilter !== 'ALL') ||
    (tab === 'history' && (actionFilter !== 'ALL' || rangeFilter !== 'ALL' || actorFilter !== 'ALL'));

  // Filtered reports
  const displayedReports = useMemo(() => {
    const base = tab === 'queue' ? pending : aiFlagged;
    return base
      .filter((r) => {
        if (reasonFilter !== 'ALL' && r.reason !== reasonFilter) return false;
        if (tab === 'queue' && sourceFilter !== 'ALL') {
          const isAi = r.source === 'AI';
          if (sourceFilter === 'AI' ? !isAi : isAi) return false;
        }
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const post = postsMap[r.targetId];
          const matchDesc = r.description?.toLowerCase().includes(q);
          const matchReason = r.reason?.toLowerCase().includes(q);
          const matchId = r.targetId?.toLowerCase().includes(q);
          const matchPostContent = post?.content?.toLowerCase().includes(q);
          const matchAuthor = post?.authorName?.toLowerCase().includes(q);
          const matchAi = r.aiReason?.toLowerCase().includes(q) || r.aiCategory?.toLowerCase().includes(q);
          return matchDesc || matchReason || matchId || matchPostContent || matchAuthor || matchAi;
        }
        return true;
      })
      .sort(byDate((r) => r.createdAt, sortOrder));
  }, [tab, pending, aiFlagged, reasonFilter, sourceFilter, searchQuery, sortOrder, postsMap]);

  // Số lượt xử lý theo từng hành động (hiển thị trên các chip lọc của tab Nhật ký)
  const logActionCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    logs.forEach((l) => {
      counts[l.action] = (counts[l.action] || 0) + 1;
    });
    return counts;
  }, [logs]);

  const displayedLogs = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return logs
      .filter((l) => {
        if (reasonFilter !== 'ALL' && l.reason !== reasonFilter) return false;
        if (actionFilter !== 'ALL' && l.action !== actionFilter) return false;
        if (!withinRange(l.createdAt, rangeFilter)) return false;
        if (actorFilter !== 'ALL' && (actorFilter === 'AUTO') !== isAutomatedLog(l)) return false;
        if (q) {
          const post = postsMap[l.targetId];
          const haystack = [
            l.note,
            l.reason,
            l.targetId,
            l.reportId,
            actionDetails[l.action]?.label,
            post?.content,
            post?.authorName,
          ]
            .filter(Boolean)
            .join('\n')
            .toLowerCase();
          if (!haystack.includes(q)) return false;
        }
        return true;
      })
      .sort(byDate((l) => l.createdAt, sortOrder));
  }, [logs, reasonFilter, actionFilter, rangeFilter, actorFilter, searchQuery, sortOrder, postsMap]);

  const displayedAppeals = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return appeals
      .filter((a) => {
        if (!q) return true;
        const haystack = [a.content, a.appealMessage, a.reason, a.postId, appealAuthors[a.authorId]?.name]
          .filter(Boolean)
          .join('\n')
          .toLowerCase();
        return haystack.includes(q);
      })
      .sort(byDate((a: any) => a.updatedAt || a.createdAt, sortOrder));
  }, [appeals, appealAuthors, searchQuery, sortOrder]);

  const handleProcessAction = async (
    reportId: string,
    action: ModerationAction,
    customNote?: string,
    targetPostId?: string
  ) => {
    try {
      setProcessingId(reportId);
      const noteToSave = customNote !== undefined ? customNote : note.trim();
      await moderationService.processReport(reportId, action, noteToSave);

      if (action === 'RESTORE_POST') {
        toast.showSuccess('Đã hoàn tác thành công! Bài viết đã được đưa trở lại Hàng chờ xử lý.');
        setTab('queue');
      } else {
        toast.showSuccess(`Đã xử lý: ${actionDetails[action]?.label || action}.`);
      }

      if (selected?.reportId === reportId) {
        setSelected(null);
        setNote('');
      }

      // Evict post cache entry to force re-fetch on next render
      if (targetPostId) {
        delete (postService as any).postDetailCache?.[targetPostId];
        setPostsMap((prev) => {
          const next = { ...prev };
          delete next[targetPostId];
          return next;
        });
      }

      await load();
    } catch {
      toast.showError('Không thể thực hiện thao tác. Vui lòng thử lại sau.');
    } finally {
      setProcessingId(null);
    }
  };

  const quickPresets = [
    'Nội dung vi phạm tiêu chuẩn cộng đồng về spam & quảng cáo rác',
    'Nội dung chứa ngôn từ kích động, xúc phạm thù ghét',
    'Nội dung sai lệch sự thật, chưa được kiểm chứng',
    'Đã xem xét: Nội dung hoàn toàn hợp lệ, không vi phạm',
  ];

  if (!canModerate) {
    return (
      <div className="min-h-screen bg-[#f0f2f5] dark:bg-[#18191a] text-gray-900 dark:text-[#e4e6eb]">
        <Header
          activeTab={props.activeNavTab}
          onTabChange={props.setActiveNavTab}
          onNavigateSettings={props.onNavigateSettings}
          onNavigateProfile={props.onNavigateProfile}
          onNavigateAuth={props.onNavigateAuth}
          onSelectChatUser={props.setActiveChatUser}
        />
        <main className="mx-auto flex min-h-[75vh] max-w-lg items-center justify-center px-4 pt-16">
          <div className="w-full rounded-3xl border border-gray-200/80 bg-white/80 p-8 text-center shadow-xl backdrop-blur-xl dark:border-[#393a3b] dark:bg-[#242526]/90">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50 text-rose-500 shadow-inner dark:bg-rose-950/50">
              <ShieldAlert className="h-9 w-9" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white">
              Khu vực Kiểm duyệt viên
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-gray-500 dark:text-gray-400">
              Tài khoản hiện tại chưa được cấp quyền <span className="font-semibold text-rose-500">Moderator</span>{' '}
              hoặc <span className="font-semibold text-blue-500">Admin</span>. Vui lòng đăng nhập với tài khoản hợp lệ.
            </p>
            {!isAuthenticated && (
              <button
                onClick={openLoginModal}
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/25 transition-all hover:opacity-95 hover:shadow-blue-500/35 active:scale-[0.98]"
              >
                <span>Đăng nhập tài khoản Moderator</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] dark:bg-[#121314] text-gray-900 dark:text-[#e4e6eb] antialiased">
      <Header
        activeTab={props.activeNavTab}
        onTabChange={props.setActiveNavTab}
        onNavigateSettings={props.onNavigateSettings}
        onNavigateProfile={props.onNavigateProfile}
        onNavigateAuth={props.onNavigateAuth}
        onSelectChatUser={props.setActiveChatUser}
      />

      <div className="flex justify-between pt-14 max-w-[1920px] mx-auto">
        <ModeratorSidebarNav
          currentTab={tab}
          onSelectTab={(newTab) => setTab(newTab)}
          pendingCount={pending.length}
          aiFlaggedCount={aiFlagged.length}
          logsCount={logs.length}
          appealsCount={appeals.length}
          sourceFilter={sourceFilter}
          onSourceFilterChange={setSourceFilter}
          userReportCount={pending.filter((r) => r.source !== 'AI').length}
          aiReportCount={pending.filter((r) => r.source === 'AI').length}
          isAdmin={(user?.roles || []).some((r: any) => String(r).toUpperCase().includes('ADMIN'))}
        />

        <main className="flex-1 min-w-0 max-w-[960px] xl:max-w-[1040px] 2xl:max-w-[1140px] mx-auto px-2 sm:px-4 py-4 min-h-[calc(100vh-3.5rem)]">
          {/* Top Search Bar & Reload Button, with Section Title */}
          <div className="mb-3 space-y-2.5">
            {/* Row 1: Section Header on Left/Top, Search Bar + Reload on Right */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div>
                <h1 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  {tab === 'queue' && (
                    <>
                      <Clock3 className="w-5 h-5 text-rose-500 shrink-0" />
                      <span>Hàng chờ báo cáo</span>
                      <span className="text-xs font-extrabold px-2 py-0.5 rounded-full bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400">
                        {pending.length}
                      </span>
                    </>
                  )}
                  {tab === 'ai' && (
                    <>
                      <Sparkles className="w-5 h-5 text-purple-500 shrink-0" />
                      <span>AI phát hiện vi phạm</span>
                      <span className="text-xs font-extrabold px-2 py-0.5 rounded-full bg-purple-100 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400">
                        {aiFlagged.length}
                      </span>
                    </>
                  )}
                  {tab === 'history' && (
                    <>
                      <History className="w-5 h-5 text-blue-500 shrink-0" />
                      <span>Nhật ký & Hoàn tác</span>
                      <span className="text-xs font-extrabold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 dark:bg-[#3a3b3c] dark:text-[#b0b3b8]">
                        {logs.length}
                      </span>
                    </>
                  )}
                  {tab === 'appeals' && (
                    <>
                      <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                      <span>Kháng nghị chờ xem xét</span>
                      <span className="text-xs font-extrabold px-2 py-0.5 rounded-full bg-amber-100 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
                        {appeals.length}
                      </span>
                    </>
                  )}
                </h1>
              </div>

              <div className="flex items-center gap-2 justify-end">
                <div className="relative flex-1 sm:w-64 max-w-xs">
                  <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-gray-400 dark:text-[#b0b3b8]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={
                      tab === 'history'
                        ? 'Tìm nhật ký...'
                        : tab === 'appeals'
                          ? 'Tìm kháng nghị...'
                          : 'Tìm bài vi phạm...'
                    }
                    className="w-full pl-8 pr-7 py-1.5 sm:py-2 text-xs sm:text-sm bg-gray-100 dark:bg-[#3a3b3c] text-gray-900 dark:text-[#e4e6eb] placeholder-gray-500 dark:placeholder-[#b0b3b8] rounded-full focus:outline-none focus:ring-1 focus:ring-[#1877f2] transition"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-2 text-gray-400 hover:text-gray-600 dark:hover:text-[#e4e6eb] cursor-pointer"
                      title="Xóa tìm kiếm"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <button
                  onClick={load}
                  disabled={loading}
                  title="Làm mới dữ liệu kiểm duyệt"
                  className="p-2 rounded-full bg-gray-100 dark:bg-[#3a3b3c] hover:bg-gray-200 dark:hover:bg-[#4e4f50] text-gray-600 dark:text-[#b0b3b8] transition cursor-pointer shrink-0"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            {/* Mobile-only Tab Switcher (Options are located in the left sidebar on desktop) */}
            <div className="lg:hidden flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              <button
                type="button"
                onClick={() => setTab('queue')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition whitespace-nowrap cursor-pointer shrink-0 ${
                  tab === 'queue'
                    ? 'bg-[#1877f2] text-white shadow-xs font-bold'
                    : 'bg-white dark:bg-[#242526] text-gray-700 dark:text-[#b0b3b8] hover:bg-gray-100 dark:hover:bg-[#3a3b3c] border border-gray-200/80 dark:border-[#393a3b]'
                }`}
              >
                <Clock3 className="w-3.5 h-3.5" />
                <span>Hàng chờ</span>
                <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-full ${
                  tab === 'queue' ? 'bg-white/20 text-white' : 'bg-gray-100 dark:bg-[#3a3b3c]'
                }`}>
                  {pending.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setTab('ai')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition whitespace-nowrap cursor-pointer shrink-0 ${
                  tab === 'ai'
                    ? 'bg-[#1877f2] text-white shadow-xs font-bold'
                    : 'bg-white dark:bg-[#242526] text-gray-700 dark:text-[#b0b3b8] hover:bg-gray-100 dark:hover:bg-[#3a3b3c] border border-gray-200/80 dark:border-[#393a3b]'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI gắn cờ</span>
                <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-full ${
                  tab === 'ai' ? 'bg-white/20 text-white' : 'bg-gray-100 dark:bg-[#3a3b3c]'
                }`}>
                  {aiFlagged.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setTab('history')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition whitespace-nowrap cursor-pointer shrink-0 ${
                  tab === 'history'
                    ? 'bg-[#1877f2] text-white shadow-xs font-bold'
                    : 'bg-white dark:bg-[#242526] text-gray-700 dark:text-[#b0b3b8] hover:bg-gray-100 dark:hover:bg-[#3a3b3c] border border-gray-200/80 dark:border-[#393a3b]'
                }`}
              >
                <History className="w-3.5 h-3.5" />
                <span>Nhật ký</span>
                <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-full ${
                  tab === 'history' ? 'bg-white/20 text-white' : 'bg-gray-100 dark:bg-[#3a3b3c]'
                }`}>
                  {logs.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setTab('appeals')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition whitespace-nowrap cursor-pointer shrink-0 ${
                  tab === 'appeals'
                    ? 'bg-[#1877f2] text-white shadow-xs font-bold'
                    : 'bg-white dark:bg-[#242526] text-gray-700 dark:text-[#b0b3b8] hover:bg-gray-100 dark:hover:bg-[#3a3b3c] border border-gray-200/80 dark:border-[#393a3b]'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Kháng nghị</span>
                <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-full ${
                  tab === 'appeals' ? 'bg-white/20 text-white' : 'bg-gray-100 dark:bg-[#3a3b3c]'
                }`}>
                  {appeals.length}
                </span>
              </button>
            </div>
          </div>

        {/* Secondary Filters Bar */}
        <div className="mb-4 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-1.5">
              {tab !== 'appeals' && (
                <ToolbarSelect
                  value={reasonFilter}
                  onChange={setReasonFilter}
                  options={reasonOptions}
                  ariaLabel="Lọc theo loại vi phạm"
                />
              )}
              <ToolbarSelect
                value={sortOrder}
                onChange={(v) => setSortOrder(v as SortOrder)}
                options={sortOptions}
                ariaLabel="Sắp xếp"
              />
            </div>
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 cursor-pointer"
              >
                Đặt lại bộ lọc
              </button>
            )}
          </div>

          {tab === 'queue' && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              <FilterChip active={sourceFilter === 'ALL'} onClick={() => setSourceFilter('ALL')} label="Tất cả nguồn" count={pending.length} />
              <FilterChip
                active={sourceFilter === 'USER'}
                onClick={() => setSourceFilter('USER')}
                label="Người dùng báo cáo"
                count={pending.filter((r) => r.source !== 'AI').length}
              />
              <FilterChip
                active={sourceFilter === 'AI'}
                onClick={() => setSourceFilter('AI')}
                label="AI gắn cờ"
                icon={<Sparkles className="h-3 w-3" />}
                count={pending.filter((r) => r.source === 'AI').length}
              />
            </div>
          )}

          {tab === 'history' && (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                <FilterChip active={actionFilter === 'ALL'} onClick={() => setActionFilter('ALL')} label="Tất cả hành động" count={logs.length} />
                {Object.keys(actionDetails)
                  .filter((a) => logActionCounts[a])
                  .map((a) => (
                    <FilterChip
                      key={a}
                      active={actionFilter === a}
                      onClick={() => setActionFilter(a)}
                      label={actionDetails[a as ModerationAction].label}
                      count={logActionCounts[a]}
                    />
                  ))}
              </div>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {rangeOptions.map((o) => (
                  <FilterChip key={o.value} active={rangeFilter === o.value} onClick={() => setRangeFilter(o.value)} label={o.label} />
                ))}
                <FilterChip active={actorFilter === 'ALL'} onClick={() => setActorFilter('ALL')} label="Tất cả người xử lý" />
                <FilterChip
                  active={actorFilter === 'AUTO'}
                  onClick={() => setActorFilter('AUTO')}
                  label="AI / Hệ thống"
                  icon={<Sparkles className="h-3 w-3" />}
                />
                <FilterChip
                  active={actorFilter === 'HUMAN'}
                  onClick={() => setActorFilter('HUMAN')}
                  label="Kiểm duyệt viên"
                  icon={<Gavel className="h-3 w-3" />}
                />
              </div>
            </div>
          )}
        </div>

        {/* Content Body */}
        {tab === 'appeals' ? (
          <>
            {!appealsLoading && (
              <ResultSummary
                shown={displayedAppeals.length}
                total={appeals.length}
                noun="kháng nghị"
                hasFilters={hasActiveFilters}
                onReset={resetFilters}
              />
            )}
            {!appealsLoading && hasActiveFilters && appeals.length > 0 && displayedAppeals.length === 0 ? (
              <NoMatchState onReset={resetFilters} />
            ) : (
              <AppealsPanel
                appeals={displayedAppeals}
                authors={appealAuthors}
                loading={appealsLoading}
                busy={appealBusy}
                onReview={reviewAppeal}
              />
            )}
          </>
        ) : loading ? (
          <div className="flex flex-col items-center justify-center py-28 text-center">
            <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
            <p className="mt-4 text-sm font-semibold text-gray-500 dark:text-gray-400">
              Đang tải danh sách bài viết bị báo cáo...
            </p>
          </div>
        ) : tab === 'history' ? (
          <>
            <ResultSummary
              shown={displayedLogs.length}
              total={logs.length}
              noun="lượt xử lý"
              hasFilters={hasActiveFilters}
              onReset={resetFilters}
            />
            {hasActiveFilters && logs.length > 0 && displayedLogs.length === 0 ? (
              <NoMatchState onReset={resetFilters} />
            ) : (
              <AuditLogList
                logs={displayedLogs}
                reports={reports}
                postsMap={postsMap}
                loadingPostsMap={loadingPostsMap}
                processingId={processingId}
                onUndo={(reportId, targetId) => handleProcessAction(reportId, 'RESTORE_POST', 'Hoàn tác quyết định', targetId)}
              />
            )}
          </>
        ) : (
          <>
            <ResultSummary
              shown={displayedReports.length}
              total={tab === 'queue' ? pending.length : aiFlagged.length}
              noun="bài viết"
              hasFilters={hasActiveFilters}
              onReset={resetFilters}
            />
            <PostReportList
              reports={displayedReports}
              postsMap={postsMap}
              loadingPostsMap={loadingPostsMap}
              processingId={processingId}
              onSelect={(report) => {
                setSelected(report);
                setNote('');
              }}
              onProcess={(report, action, customNote) => handleProcessAction(report.reportId, action, customNote, report.targetId)}
              empty={
                hasActiveFilters
                  ? 'Không tìm thấy bài viết nào khớp với bộ lọc tìm kiếm.'
                  : tab === 'ai'
                    ? 'Tuyệt vời! Hiện tại không có bài viết nào bị AI cảnh báo.'
                    : 'Sạch bóng! Toàn bộ bài viết bị báo cáo đã được kiểm duyệt xong.'
              }
            />
          </>
        )}
        </main>

        <SidebarRight onSelectChatUser={(u) => props.setActiveChatUser(u)} />
      </div>

      {/* Detailed Modal for In-depth Notes & Action */}
      {selected && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-md animate-in fade-in duration-200">
          <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-[#383a3d] dark:bg-[#1e1f21] sm:p-7">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-gray-100 pb-4 dark:border-[#2f3032]">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md shadow-blue-500/20">
                  <Gavel className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-gray-900 dark:text-white">Quyết định xử lý bài viết</h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Mã báo cáo: <code className="font-mono text-blue-600 dark:text-blue-400">{selected.reportId}</code>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelected(null)}
                disabled={processingId !== null}
                className="rounded-xl p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-[#2d2f32] dark:hover:text-gray-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-5 space-y-4">
              {/* Report Info */}
              <div className="rounded-2xl border border-gray-200/80 bg-gray-50/80 p-4 dark:border-[#343639] dark:bg-[#252628]">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span
                    className={`rounded-lg px-2.5 py-1 text-xs font-extrabold ${
                      reasonConfig[selected.reason]?.bgLight || 'bg-rose-50'
                    } ${reasonConfig[selected.reason]?.color || 'text-rose-600'} ${
                      reasonConfig[selected.reason]?.bgDark || 'dark:bg-rose-950/40'
                    }`}
                  >
                    {reasonConfig[selected.reason]?.label || selected.reason}
                  </span>
                  <span className="text-xs text-gray-400">
                    {selected.source === 'AI' ? 'AI gắn cờ' : 'Báo cáo'}: {new Date(selected.createdAt).toLocaleString('vi-VN')}
                  </span>
                </div>

                {selected.source === 'AI' ? (
                  <AiFlagInfo report={selected} />
                ) : (
                  <div className="mt-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Mô tả vi phạm từ người báo cáo:</p>
                    <p className="mt-1 rounded-xl bg-white p-3 text-sm font-medium text-gray-800 italic shadow-2xs dark:bg-[#1a1b1d] dark:text-gray-200">
                      "{selected.description || 'Không có mô tả chi tiết từ người báo cáo.'}"
                    </p>
                  </div>
                )}
              </div>

              {/* Embedded Target Post Preview */}
              <div className="rounded-2xl border border-gray-200/80 bg-white p-4 dark:border-[#343639] dark:bg-[#252628]">
                <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-[#343639]">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                    Nội dung bài viết thực tế
                  </span>
                  <span className="font-mono text-xs text-gray-400">ID: {selected.targetId}</span>
                </div>

                {loadingPostsMap[selected.targetId] ? (
                  <div className="flex items-center justify-center py-6 text-xs text-gray-400">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin text-blue-500" />
                    Đang lấy dữ liệu bài viết...
                  </div>
                ) : postsMap[selected.targetId] ? (
                  <div className="mt-3 space-y-3 rounded-xl bg-gray-50 p-4 dark:bg-[#1a1b1d]">
                    <div className="flex items-center gap-3">
                      {postsMap[selected.targetId]?.authorAvatar ? (
                        <img
                          src={postsMap[selected.targetId]!.authorAvatar}
                          alt=""
                          className="h-9 w-9 rounded-full object-cover ring-2 ring-blue-500/20"
                        />
                      ) : (
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white shadow-sm">
                          {postsMap[selected.targetId]?.authorName?.[0] || 'U'}
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">
                          {postsMap[selected.targetId]?.authorName || 'Người dùng'}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(postsMap[selected.targetId]!.createdAtRaw || postsMap[selected.targetId]!.createdAt).toLocaleString('vi-VN')}
                        </p>
                      </div>
                    </div>

                    <p className="text-sm leading-relaxed text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                      {postsMap[selected.targetId]?.content || (
                        <span className="italic text-gray-400">Bài viết không có nội dung văn bản.</span>
                      )}
                    </p>

                    {postsMap[selected.targetId]?.mediaUrls &&
                      postsMap[selected.targetId]!.mediaUrls!.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {postsMap[selected.targetId]!.mediaUrls!.map((url, idx) => (
                            <img
                              key={idx}
                              src={url}
                              alt="media"
                              className="max-h-48 rounded-xl object-cover shadow-sm ring-1 ring-black/5"
                            />
                          ))}
                        </div>
                      )}
                  </div>
                ) : (
                  <p className="py-4 text-xs italic text-gray-400 text-center">
                    Bài viết này không tồn tại hoặc đã bị xóa trước đó.
                  </p>
                )}
              </div>

              {/* Note / Audit Entry */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300">
                  Ghi chú kết luận kiểm duyệt (Lưu vào nhật ký)
                </label>
                <div className="mt-1.5 flex flex-wrap gap-1.5 pb-2">
                  {quickPresets.map((preset, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setNote(preset)}
                      className="rounded-lg border border-gray-200 bg-gray-100/70 px-2.5 py-1 text-[11px] font-medium text-gray-700 transition hover:bg-gray-200 dark:border-[#383a3d] dark:bg-[#2b2d30] dark:text-gray-300 dark:hover:bg-[#34363a]"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Nhập ghi chú hoặc lý do chi tiết..."
                  rows={2}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm text-gray-900 transition focus:border-blue-500 focus:bg-white focus:outline-none dark:border-[#383a3d] dark:bg-[#1a1b1d] dark:text-gray-100 dark:focus:border-blue-500"
                />
              </div>

              {/* Decisions */}
              <div className="space-y-2.5 pt-2">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Hành động thực hiện:</p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  <button
                    onClick={() => handleProcessAction(selected.reportId, 'DELETE_POST', note, selected.targetId)}
                    disabled={processingId !== null}
                    className="flex items-center justify-center gap-2 rounded-xl bg-red-600 px-3 py-2.5 text-xs font-bold text-white shadow-md shadow-red-600/20 transition hover:bg-red-700 active:scale-95 disabled:opacity-50"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Gỡ bài viết</span>
                  </button>

                  <button
                    onClick={() => handleProcessAction(selected.reportId, 'HIDE_POST', note, selected.targetId)}
                    disabled={processingId !== null}
                    className="flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-3 py-2.5 text-xs font-bold text-white shadow-md shadow-amber-500/20 transition hover:bg-amber-600 active:scale-95 disabled:opacity-50"
                  >
                    <EyeOff className="h-4 w-4" />
                    <span>Ẩn bài viết</span>
                  </button>

                  <button
                    onClick={() => handleProcessAction(selected.reportId, 'WARN_USER', note, selected.targetId)}
                    disabled={processingId !== null}
                    className="flex items-center justify-center gap-2 rounded-xl border border-amber-300 bg-amber-50 px-3 py-2.5 text-xs font-bold text-amber-700 transition hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-400 active:scale-95 disabled:opacity-50"
                  >
                    <AlertOctagon className="h-4 w-4" />
                    <span>Cảnh cáo</span>
                  </button>

                  <button
                    onClick={() => handleProcessAction(selected.reportId, 'DISMISS', note, selected.targetId)}
                    disabled={processingId !== null}
                    className="flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-gray-100 px-3 py-2.5 text-xs font-bold text-gray-700 transition hover:bg-gray-200 dark:border-[#3a3b3d] dark:bg-[#2b2d30] dark:text-gray-200 active:scale-95 disabled:opacity-50"
                  >
                    <Check className="h-4 w-4" />
                    <span>Bác bỏ (Hợp lệ)</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end border-t border-gray-100 pt-4 dark:border-[#2f3032]">
              <button
                onClick={() => setSelected(null)}
                disabled={processingId !== null}
                className="rounded-xl px-5 py-2.5 text-xs font-bold text-gray-600 transition hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-[#2d2f32]"
              >
                Hủy & Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* --- SUB COMPONENTS --- */

// Khối hiển thị kết quả phân tích của AI cho báo cáo do AI tự động gắn cờ
const AiFlagInfo: React.FC<{ report: ModerationReport }> = ({ report }) => {
  const percent = report.aiScore != null ? Math.round(report.aiScore * 100) : null;
  const severity = report.aiSeverity ? aiSeverityStyles[report.aiSeverity.toUpperCase()] : undefined;
  const category = report.aiCategory
    ? aiCategoryLabels[report.aiCategory.toUpperCase()] || report.aiCategory
    : null;
  const barColor =
    percent == null ? 'bg-gray-400' : percent >= 85 ? 'bg-red-500' : percent >= 65 ? 'bg-orange-500' : 'bg-amber-500';
  const explanation = report.aiReason || report.description;

  return (
    <div className="mt-3 rounded-2xl border border-purple-200/80 bg-purple-50/70 p-3.5 dark:border-purple-900/40 dark:bg-purple-950/20">
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 text-xs font-black text-purple-700 dark:text-purple-300">
          <Sparkles className="h-3.5 w-3.5" />
          Phân tích của AI
        </span>
        {category && (
          <span className="rounded-md bg-white px-2 py-0.5 text-[11px] font-bold text-gray-700 shadow-2xs dark:bg-[#1a1b1d] dark:text-gray-200">
            {category}
          </span>
        )}
        {severity && (
          <span className={`rounded-md px-2 py-0.5 text-[11px] font-bold ${severity.className}`}>
            Mức độ: {severity.label}
          </span>
        )}
      </div>

      {percent !== null && (
        <div className="mt-2.5 flex items-center gap-2.5">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-purple-100 dark:bg-purple-950/60">
            <div className={`h-full rounded-full ${barColor}`} style={{ width: `${Math.min(100, percent)}%` }} />
          </div>
          <span className="text-xs font-black text-gray-700 dark:text-gray-200">{percent}% nghi vấn</span>
        </div>
      )}

      {explanation && (
        <p className="mt-2.5 text-xs font-medium italic leading-relaxed text-gray-700 dark:text-gray-300">
          "{explanation}"
        </p>
      )}

      <p className="mt-2 text-[11px] text-gray-500 dark:text-gray-400">
        Bài viết đang được tạm ẩn chờ bạn quyết định: Bỏ qua để hiển thị lại, hoặc Ẩn/Gỡ bài.
      </p>
    </div>
  );
};

const StatCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: number;
  accentColor: string;
  bgGlow: string;
  onClick?: () => void;
  active?: boolean;
}> = ({ icon, label, value, accentColor, bgGlow, onClick, active }) => {
  const body = (
    <>
      <div className={`absolute -top-10 -right-10 h-24 w-24 rounded-full bg-gradient-to-br ${bgGlow} blur-2xl`} />
      <div className="relative flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-gray-100 bg-gray-50/80 shadow-inner dark:border-[#2f3032] dark:bg-[#242526]">
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-2xl leading-none font-black tracking-tight text-gray-900 dark:text-white">{value}</p>
          <h3 className="mt-1 truncate text-[11px] font-bold text-gray-500 dark:text-gray-400">{label}</h3>
        </div>
      </div>
    </>
  );
  const base = `relative block w-full overflow-hidden rounded-2xl border ${accentColor} bg-white/90 p-4 text-left shadow-sm backdrop-blur-md transition-all dark:bg-[#1a1b1d] ${
    active ? 'shadow-md ring-2 ring-blue-500/50' : ''
  }`;

  return onClick ? (
    <button type="button" onClick={onClick} className={`${base} cursor-pointer hover:-translate-y-0.5 hover:shadow-md`}>
      {body}
    </button>
  ) : (
    <div className={base}>{body}</div>
  );
};

const FilterChip: React.FC<{
  active: boolean;
  onClick: () => void;
  label: string;
  count?: number;
  icon?: React.ReactNode;
}> = ({ active, onClick, label, count, icon }) => (
  <button
    type="button"
    onClick={onClick}
    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-bold transition-all active:scale-95 ${
      active
        ? 'border-blue-500 bg-blue-600 text-white shadow-sm shadow-blue-500/25'
        : 'border-gray-200 bg-white text-gray-600 hover:border-blue-300 hover:text-blue-600 dark:border-[#3a3b3c] dark:bg-[#242526] dark:text-gray-300 dark:hover:border-blue-500/50 dark:hover:text-blue-400'
    }`}
  >
    {icon}
    <span>{label}</span>
    {count !== undefined && (
      <span
        className={`rounded-full px-1.5 text-[10px] font-black ${
          active ? 'bg-white/25 text-white' : 'bg-gray-100 text-gray-500 dark:bg-[#343538] dark:text-gray-400'
        }`}
      >
        {count}
      </span>
    )}
  </button>
);

const FilterGroup: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="flex flex-wrap items-center gap-2">
    <span className="w-full shrink-0 text-[10px] font-black tracking-wider text-gray-400 uppercase sm:w-24">{label}</span>
    {children}
  </div>
);

const ToolbarSelect: React.FC<{
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  ariaLabel: string;
}> = ({ value, onChange, options, ariaLabel }) => (
  <div className="relative">
    <select
      value={value}
      aria-label={ariaLabel}
      onChange={(e) => onChange(e.target.value)}
      className="appearance-none rounded-xl border border-gray-200 bg-white py-2.5 pr-8 pl-3 text-xs font-semibold text-gray-700 shadow-sm transition focus:border-blue-500 focus:outline-none dark:border-[#3a3b3c] dark:bg-[#242526] dark:text-gray-200"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
    <ChevronDown className="pointer-events-none absolute top-1/2 right-2.5 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
  </div>
);

const ResultSummary: React.FC<{
  shown: number;
  total: number;
  noun: string;
  hasFilters: boolean;
  onReset: () => void;
}> = ({ shown, total, noun, hasFilters, onReset }) => (
  <div className="mb-3 flex items-center justify-between gap-3 px-1 text-xs">
    <p className="font-semibold text-gray-500 dark:text-gray-400">
      {hasFilters ? (
        <>
          Hiển thị <b className="text-gray-900 dark:text-white">{shown}</b> / {total} {noun} khớp bộ lọc
        </>
      ) : (
        <>
          Tổng cộng <b className="text-gray-900 dark:text-white">{total}</b> {noun}
        </>
      )}
    </p>
    {hasFilters && (
      <button
        type="button"
        onClick={onReset}
        className="inline-flex items-center gap-1 font-bold text-blue-600 transition hover:underline dark:text-blue-400"
      >
        <X className="h-3 w-3" />
        Xoá bộ lọc
      </button>
    )}
  </div>
);

const NoMatchState: React.FC<{ onReset: () => void }> = ({ onReset }) => (
  <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-gray-300 bg-white/60 py-16 text-center dark:border-[#3a3b3c] dark:bg-[#1a1b1d]/60">
    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-400 dark:bg-[#242526]">
      <Search className="h-7 w-7" />
    </div>
    <h3 className="mt-4 text-base font-extrabold text-gray-900 dark:text-white">Không có kết quả phù hợp</h3>
    <p className="mt-1 max-w-sm text-xs text-gray-500 dark:text-gray-400">
      Thử đổi từ khoá hoặc nới lỏng bộ lọc để xem thêm.
    </p>
    <button
      type="button"
      onClick={onReset}
      className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-blue-500/20 transition hover:bg-blue-700 active:scale-95"
    >
      <X className="h-3.5 w-3.5" />
      Xoá bộ lọc
    </button>
  </div>
);

const TabButton: React.FC<{
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
  accentColor?: 'blue' | 'amber';
}> = ({ active, onClick, label, count, accentColor = 'blue' }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
      active
        ? accentColor === 'amber'
          ? 'bg-white text-amber-600 shadow-sm dark:bg-[#2d2e30] dark:text-amber-400'
          : 'bg-white text-blue-600 shadow-sm dark:bg-[#2d2e30] dark:text-white'
        : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'
    }`}
  >
    <span>{label}</span>
    <span
      className={`rounded-full px-2 py-0.5 text-[10px] font-black ${
        active
          ? accentColor === 'amber'
            ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-200'
            : 'bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-200'
          : 'bg-gray-300/50 text-gray-600 dark:bg-[#343538] dark:text-gray-400'
      }`}
    >
      {count}
    </span>
  </button>
);

const PostReportList: React.FC<{
  reports: ModerationReport[];
  postsMap: Record<string, Post | null>;
  loadingPostsMap: Record<string, boolean>;
  processingId: string | null;
  onSelect: (report: ModerationReport) => void;
  onProcess: (report: ModerationReport, action: ModerationAction, note?: string) => void;
  empty: string;
}> = ({ reports, postsMap, loadingPostsMap, processingId, onSelect, onProcess, empty }) => {
  if (reports.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-3xl border border-gray-200/80 bg-white/70 py-20 text-center shadow-xs backdrop-blur-md dark:border-[#2f3032] dark:bg-[#1a1b1d]/80">
        <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-50 text-emerald-500 shadow-inner dark:bg-emerald-950/40">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h3 className="mt-4 text-base font-extrabold text-gray-900 dark:text-white">Không có báo cáo nào</h3>
        <p className="mt-1 max-w-sm text-xs text-gray-500 dark:text-gray-400">{empty}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reports.map((report) => {
        const rConf = reasonConfig[report.reason] || reasonConfig.OTHER;
        const post = postsMap[report.targetId];
        const isLoadingPost = loadingPostsMap[report.targetId];
        const isProcessing = processingId === report.reportId;

        return (
          <div
            key={report.reportId}
            className="group relative rounded-3xl border border-gray-200/80 bg-white/95 p-5 shadow-2xs backdrop-blur-md transition-all hover:border-blue-400/60 hover:shadow-lg dark:border-[#2f3032] dark:bg-[#1a1b1d] dark:hover:border-blue-500/40"
          >
            {/* Top Bar: Reason, Status, Report Date */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-3 dark:border-[#28292b]">
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-black ${rConf.border} ${rConf.bgLight} ${rConf.bgDark} ${rConf.color}`}
                >
                  <AlertTriangle className="h-3.5 w-3.5" />
                  {rConf.label}
                </span>

                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-[10px] font-black tracking-wide text-amber-700 uppercase dark:bg-amber-950/60 dark:text-amber-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                  {report.status}
                </span>

                {report.source === 'AI' && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-2.5 py-0.5 text-[10px] font-black tracking-wide text-purple-700 uppercase dark:bg-purple-950/60 dark:text-purple-300">
                    <Sparkles className="h-3 w-3" />
                    AI gắn cờ
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3 text-xs text-gray-400 dark:text-gray-500">
                <span>
                  {report.source === 'AI' ? 'AI gắn cờ lúc' : 'Báo cáo lúc'}: {new Date(report.createdAt).toLocaleString('vi-VN')}
                </span>
                <span>Mã bài: <code className="font-mono text-gray-500 dark:text-gray-400">{report.targetId}</code></span>
              </div>
            </div>

            {/* Reporter's reason / AI analysis */}
            {report.source === 'AI' ? (
              <AiFlagInfo report={report} />
            ) : (
              report.description && (
                <div className="mt-3 flex items-start gap-2 text-xs text-gray-600 dark:text-gray-300">
                  <span className="font-bold text-rose-500 shrink-0">Lý do báo cáo:</span>
                  <span className="italic font-medium">"{report.description}"</span>
                </div>
              )
            )}

            {/* EMBEDDED REAL POST CONTENT */}
            <div className="mt-3.5 rounded-2xl border border-gray-200/80 bg-gray-50/90 p-4 transition dark:border-[#323336] dark:bg-[#222325]">
              {isLoadingPost ? (
                <div className="flex items-center justify-center py-6 text-xs text-gray-400">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin text-blue-500" />
                  Đang tải nội dung bài viết gốc...
                </div>
              ) : post ? (
                <div className="space-y-3">
                  {/* Author Row */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      {post.authorAvatar ? (
                        <img
                          src={post.authorAvatar}
                          alt=""
                          className="h-9 w-9 rounded-full object-cover ring-2 ring-blue-500/20"
                        />
                      ) : (
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white shadow-xs">
                          {post.authorName?.[0] || 'U'}
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-black text-gray-900 dark:text-white">
                            {post.authorName || 'Người dùng'}
                          </p>
                          {post.isArchived && (
                            <span className="rounded bg-amber-100 px-1.5 py-0.2 text-[9px] font-bold text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
                              Đang ẩn
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-gray-400">
                          Đăng lúc: {new Date(post.createdAtRaw || post.createdAt).toLocaleString('vi-VN')}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <ThumbsUp className="h-3 w-3" /> {post.likesCount || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" /> {post.commentsCount || 0}
                      </span>
                    </div>
                  </div>

                  {/* Post Text */}
                  <p className="text-sm leading-relaxed text-gray-800 dark:text-gray-100 whitespace-pre-wrap font-medium">
                    {post.content || <span className="italic text-gray-400">Bài viết không có nội dung văn bản.</span>}
                  </p>

                  {/* Media attachments */}
                  {post.mediaUrls && post.mediaUrls.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {post.mediaUrls.map((url, idx) => (
                        <a
                          key={idx}
                          href={url}
                          target="_blank"
                          rel="noreferrer"
                          className="group/img relative max-h-36 overflow-hidden rounded-xl shadow-xs ring-1 ring-black/5"
                        >
                          <img
                            src={url}
                            alt="post media"
                            className="max-h-36 rounded-xl object-cover transition group-hover/img:scale-105"
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition group-hover/img:opacity-100">
                            <ExternalLink className="h-4 w-4 text-white" />
                          </div>
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-4 text-xs italic text-gray-400">
                  <div className="flex items-center gap-1.5">
                    <FileWarning className="h-4 w-4 text-amber-500" />
                    <span>Bài viết này đang được bảo vệ hoặc đã bị xóa khỏi cơ sở dữ liệu.</span>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Actions Footer */}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => onProcess(report, 'DELETE_POST', 'Gỡ bỏ bài viết vi phạm tiêu chuẩn cộng đồng')}
                  disabled={isProcessing}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-3.5 py-2 text-xs font-bold text-white shadow-xs shadow-red-600/20 transition hover:bg-red-700 active:scale-95 disabled:opacity-50"
                  title="Gỡ vĩnh viễn bài viết khỏi hệ thống"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Gỡ bài viết</span>
                </button>

                <button
                  onClick={() => onProcess(report, 'HIDE_POST', 'Ẩn bài viết khỏi bảng tin')}
                  disabled={isProcessing}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50 px-3.5 py-2 text-xs font-bold text-amber-700 transition hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300 active:scale-95 disabled:opacity-50"
                  title="Ẩn bài viết khỏi bảng tin"
                >
                  <EyeOff className="h-3.5 w-3.5" />
                  <span>Ẩn bài</span>
                </button>

                <button
                  onClick={() => onProcess(report, 'DISMISS', 'Nội dung hợp lệ, bỏ qua báo cáo')}
                  disabled={isProcessing}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2 text-xs font-bold text-gray-700 transition hover:bg-gray-100 dark:border-[#383a3d] dark:bg-[#252628] dark:text-gray-300 active:scale-95 disabled:opacity-50"
                  title="Bỏ qua báo cáo nếu bài viết không vi phạm"
                >
                  <Check className="h-3.5 w-3.5" />
                  <span>Bỏ qua (Hợp lệ)</span>
                </button>
              </div>

              <button
                onClick={() => onSelect(report)}
                disabled={isProcessing}
                className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-blue-500/20 transition hover:bg-blue-700 active:scale-95"
              >
                <Gavel className="h-3.5 w-3.5" />
                <span>Chi tiết & Ghi chú...</span>
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const toneStyles: Record<string, { bar: string; chip: string }> = {
  danger: { bar: 'bg-rose-500', chip: 'bg-rose-50 text-rose-600 dark:bg-rose-950/60' },
  warning: { bar: 'bg-amber-500', chip: 'bg-amber-50 text-amber-600 dark:bg-amber-950/60' },
  success: { bar: 'bg-emerald-500', chip: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60' },
  neutral: { bar: 'bg-blue-500', chip: 'bg-blue-50 text-blue-600 dark:bg-blue-950/60' },
};

const LogCard: React.FC<{
  log: ModerationLog;
  reports: ModerationReport[];
  post: Post | null | undefined;
  isLoadingPost: boolean;
  isProcessing: boolean;
  onUndo: (reportId: string, targetId: string) => void;
}> = ({ log, reports, post, isLoadingPost, isProcessing, onUndo }) => {
  const [expanded, setExpanded] = useState(false);
  const actInfo = actionDetails[log.action] || { label: log.action, tone: 'neutral', icon: CheckCircle2 };
  const IconComponent = actInfo.icon;
  const tone = toneStyles[actInfo.tone] || toneStyles.neutral;
  const automated = isAutomatedLog(log);

  // Check if report has already been restored to PENDING queue
  const matchedReport = reports.find((r) => r.reportId === log.reportId);
  const isAlreadyInQueue = matchedReport?.status === 'PENDING';
  const isRestored = log.action === 'RESTORE_POST';
  const canUndo =
    (log.action === 'DELETE_POST' || log.action === 'HIDE_POST' || log.action === 'DISMISS') && !isAlreadyInQueue;
  const isLongContent = (post?.content?.length ?? 0) > 180;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-gray-200/90 bg-white shadow-xs transition hover:shadow-md dark:border-[#2f3032] dark:bg-[#1a1b1d]">
      <div className={`absolute inset-y-0 left-0 w-1 ${tone.bar}`} />
      <div className="p-4 pl-5">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${tone.chip}`}>
              <IconComponent className="h-4 w-4" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-xs font-black tracking-wide text-gray-900 uppercase dark:text-white">
                  {actInfo.label}
                </span>
                <span className="rounded-md bg-gray-100 px-1.5 py-0.5 text-[10px] font-bold text-gray-500 dark:bg-[#282a2d] dark:text-gray-400">
                  {log.targetType}
                </span>
                {automated ? (
                  <span className="inline-flex items-center gap-1 rounded-md bg-purple-100 px-1.5 py-0.5 text-[10px] font-bold text-purple-700 dark:bg-purple-950/60 dark:text-purple-300">
                    <Sparkles className="h-2.5 w-2.5" />
                    AI / Hệ thống
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-md bg-blue-100 px-1.5 py-0.5 text-[10px] font-bold text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                    <Gavel className="h-2.5 w-2.5" />
                    Kiểm duyệt viên
                  </span>
                )}
              </div>
              <p className="mt-0.5 text-[11px] text-gray-400">
                Xử lý lúc {new Date(log.createdAt).toLocaleString('vi-VN')}
              </p>
            </div>
          </div>

          {/* Status Badge or Undo Button */}
          <div className="flex items-center gap-2">
            {isAlreadyInQueue ? (
              <span className="inline-flex items-center gap-1 rounded-xl bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Đã ở hàng chờ</span>
              </span>
            ) : isRestored ? (
              <span className="inline-flex items-center gap-1 rounded-xl bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700 dark:bg-blue-950/50 dark:text-blue-300">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Đã khôi phục</span>
              </span>
            ) : canUndo && log.reportId ? (
              <button
                onClick={() => onUndo(log.reportId!, log.targetId)}
                disabled={isProcessing}
                className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50 px-3.5 py-1.5 text-xs font-bold text-emerald-700 shadow-2xs transition hover:border-emerald-400 hover:bg-emerald-100 active:scale-95 disabled:opacity-50 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                title="Hoàn tác quyết định và đưa bài viết quay trở lại Hàng chờ xử lý"
              >
                {isProcessing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Undo2 className="h-3.5 w-3.5" />}
                <span>Hoàn tác (Về hàng chờ)</span>
              </button>
            ) : null}
          </div>
        </div>

        {/* Note & Reason from Moderator */}
        <div className="mt-3 border-l-2 border-gray-200 pl-3 dark:border-[#3a3b3c]">
          <span className="text-[10px] font-black tracking-wider text-gray-400 uppercase">Lý do / Ghi chú kiểm duyệt</span>
          <p className="mt-0.5 text-xs font-semibold text-gray-800 dark:text-gray-200">
            "{log.note || log.reason || 'Không có ghi chú thêm.'}"
          </p>
        </div>

        {/* Embedded Post Preview Content */}
        <div className="mt-3 rounded-xl bg-gray-50/80 p-3 dark:bg-[#151617]">
          {isLoadingPost ? (
            <div className="flex items-center justify-center py-3 text-xs text-gray-400">
              <Loader2 className="mr-2 h-4 w-4 animate-spin text-blue-500" />
              Đang tải nội dung bài viết...
            </div>
          ) : post ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2.5">
                {post.authorAvatar ? (
                  <img src={post.authorAvatar} alt="" className="h-7 w-7 rounded-full object-cover ring-2 ring-blue-500/20" />
                ) : (
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-[11px] font-bold text-white shadow-sm">
                    {post.authorName?.[0] || 'U'}
                  </div>
                )}
                <div className="min-w-0 leading-tight">
                  <span className="text-xs font-bold text-gray-900 dark:text-white">{post.authorName || 'Người dùng'}</span>
                  <span className="ml-1.5 text-[10px] text-gray-400">
                    đăng lúc {new Date(post.createdAtRaw || post.createdAt).toLocaleString('vi-VN')}
                  </span>
                </div>
              </div>

              <p
                className={`text-xs leading-relaxed whitespace-pre-wrap break-words text-gray-800 dark:text-gray-200 ${
                  expanded ? '' : 'line-clamp-3'
                }`}
              >
                {post.content || <span className="italic text-gray-400">Bài viết không có nội dung chữ.</span>}
              </p>
              {isLongContent && (
                <button
                  type="button"
                  onClick={() => setExpanded((v) => !v)}
                  className="text-[11px] font-bold text-blue-600 hover:underline dark:text-blue-400"
                >
                  {expanded ? 'Thu gọn' : 'Xem thêm'}
                </button>
              )}

              {post.mediaUrls && post.mediaUrls.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {post.mediaUrls.map((url, idx) => (
                    <img
                      key={idx}
                      src={url}
                      alt="Đính kèm"
                      className="h-16 w-24 rounded-lg object-cover ring-1 ring-black/5 dark:ring-white/10"
                    />
                  ))}
                </div>
              )}

              <div className="flex flex-wrap items-center gap-3 pt-0.5 text-[11px] text-gray-400">
                <span className="flex items-center gap-1">
                  <ThumbsUp className="h-3 w-3" /> {post.likesCount || 0}
                </span>
                <span className="flex items-center gap-1">
                  <MessageSquare className="h-3 w-3" /> {post.commentsCount || 0}
                </span>
                <span className="ml-auto font-mono text-[10px]">Mã bài: {post.id}</span>
              </div>
            </div>
          ) : (
            <div className="text-xs text-gray-400">
              <span>Mã bài viết: </span>
              <code className="font-mono text-gray-500 dark:text-gray-400">{log.targetId}</code>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const AuditLogList: React.FC<{
  logs: ModerationLog[];
  reports: ModerationReport[];
  postsMap: Record<string, Post | null>;
  loadingPostsMap: Record<string, boolean>;
  processingId: string | null;
  onUndo: (reportId: string, targetId: string) => void;
}> = ({ logs, reports, postsMap, loadingPostsMap, processingId, onUndo }) => {
  if (logs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-3xl border border-gray-200/80 bg-white/70 py-20 text-center shadow-xs backdrop-blur-md dark:border-[#2f3032] dark:bg-[#1a1b1d]/80">
        <FileWarning className="h-10 w-10 text-gray-400" />
        <h3 className="mt-4 text-base font-extrabold text-gray-900 dark:text-white">Chưa có lịch sử xử lý</h3>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Các quyết định xử lý bài viết, cảnh cáo và gỡ vi phạm sẽ xuất hiện tại đây.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {logs.map((log) => (
        <LogCard
          key={log.logId}
          log={log}
          reports={reports}
          post={postsMap[log.targetId]}
          isLoadingPost={!!loadingPostsMap[log.targetId]}
          isProcessing={processingId === log.reportId}
          onUndo={onUndo}
        />
      ))}
    </div>
  );
};

const AppealsPanel: React.FC<{
  appeals: any[];
  authors: Record<string, { name: string; avatarUrl?: string }>;
  loading: boolean;
  busy: string | null;
  onReview: (postId: string, approved: boolean) => void;
}> = ({ appeals, authors, loading, busy, onReview }) => {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-28 text-center">
        <Loader2 className="h-10 w-10 animate-spin text-amber-500" />
        <p className="mt-4 text-sm font-semibold text-gray-500 dark:text-gray-400">
          Đang tải hàng chờ kháng nghị...
        </p>
      </div>
    );
  }

  if (appeals.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-500 shadow-inner dark:bg-emerald-950/50">
          <ShieldCheck className="h-9 w-9" />
        </div>
        <p className="text-lg font-black text-gray-900 dark:text-white">Không có kháng nghị đang chờ.</p>
        <p className="mt-1 text-sm text-gray-500">
          Tất cả các yêu cầu kháng nghị đã được xử lý hoặc chưa có ai gửi kháng nghị.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {appeals.map((appeal) => {
        const author = authors[appeal.authorId] || { name: 'Người dùng đang tải...' };
        const isBusy = busy === appeal.postId;
        const actionLabel = appeal.action === 'HIDE_POST' ? 'Bài viết đã bị ẩn' : 'Bài viết đã bị gỡ';

        return (
          <article
            key={appeal.postId}
            className="rounded-3xl border border-amber-200/60 bg-white p-5 shadow-sm transition-all hover:shadow-md dark:border-amber-900/40 dark:bg-[#1a1b1d]"
          >
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-3 text-xs dark:border-[#323336]">
              <span className="rounded-lg bg-amber-100 px-2.5 py-1 font-black text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
                {actionLabel}
              </span>
              <span className="font-mono text-gray-400">
                Mã bài: <code>{appeal.postId}</code>
              </span>
            </div>

            {/* Moderation reason */}
            <p className="mt-3 text-sm text-rose-500">
              <b>Lý do xử lý:</b> {appeal.reason || 'Nội dung đã bị kiểm duyệt'}
            </p>

            {/* Original post preview */}
            <div className="mt-3 rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-[#323336] dark:bg-[#222325]">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  {author.avatarUrl ? (
                    <img
                      src={author.avatarUrl}
                      alt=""
                      className="h-10 w-10 rounded-full object-cover ring-2 ring-amber-500/20"
                    />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500 text-sm font-bold text-white">
                      {author.name[0]?.toUpperCase() || 'U'}
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-extrabold text-gray-900 dark:text-white">{author.name}</p>
                    <p className="text-[11px] text-gray-400">
                      Đăng lúc:{' '}
                      {appeal.createdAt
                        ? new Date(appeal.createdAt).toLocaleString('vi-VN')
                        : 'Không rõ thời gian'}
                    </p>
                  </div>
                </div>
                <div className="flex gap-3 text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <ThumbsUp size={14} /> {appeal.likeCount || 0}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageSquare size={14} /> {appeal.commentCount || 0}
                  </span>
                </div>
              </div>
              <p className="mt-4 whitespace-pre-wrap break-words text-sm font-medium leading-relaxed text-gray-800 dark:text-gray-200">
                {appeal.content || (
                  <span className="italic text-gray-400">Bài viết không có nội dung chữ.</span>
                )}
              </p>
            </div>

            {/* Appeal message */}
            <div className="mt-4 rounded-xl bg-amber-50 p-4 text-sm dark:bg-amber-950/20">
              <b className="text-amber-800 dark:text-amber-300">Lý do kháng nghị:</b>
              <p className="mt-1 whitespace-pre-wrap text-gray-700 dark:text-gray-300">{appeal.appealMessage}</p>
            </div>

            {/* Actions */}
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                disabled={isBusy}
                onClick={() => onReview(appeal.postId, true)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700 active:scale-95 disabled:opacity-60"
              >
                {isBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check size={16} />}
                Chấp nhận &amp; khôi phục
              </button>
              <button
                disabled={isBusy}
                onClick={() => onReview(appeal.postId, false)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-red-700 active:scale-95 disabled:opacity-60"
              >
                {isBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <X size={16} />}
                Bác bỏ
              </button>
            </div>
          </article>
        );
      })}
    </div>
  );
};
