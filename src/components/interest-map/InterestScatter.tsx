import React, { useMemo, useRef, useState } from 'react';
import { InterestMap } from '../../services/interestMapService';
import { ACTION_LABEL, recommendReason, timeAgo } from './labels';
import { ACTION_FILL, ACTION_WEIGHT, RECENT_FILL, RECOMMEND_FILL, TOPIC_FILL, USER_FILL } from './colors';

const W = 640;
const H = 420;
const PAD = 26;
/** Mọi chấm trên sơ đồ cùng một bán kính, chỉ khác màu */
const DOT_R = 3.5;
/** Bán kính bắt chuột tính bằng pixel màn hình: chỉ chọn chấm khi con trỏ đủ gần */
const HIT_PX = 9;
const OTHER_FILL = 'fill-gray-300 dark:fill-[#4e4f50]';

type Kind = 'other' | 'recent' | 'recommend' | 'trail' | 'interacted' | 'search' | 'topic' | 'user';

/** Thứ tự ưu tiên khi hai chấm cách con trỏ gần như bằng nhau (số lớn thắng) */
const PRIORITY: Record<Kind, number> = { other: 0, recent: 1, trail: 2, recommend: 3, search: 4, interacted: 5, topic: 6, user: 7 };

interface Mark {
  key: string;
  kind: Kind;
  x: number;
  y: number;
  fill: string;
  title: string;
  lines: string[];
  /** bấm vào thì mở bài này */
  postId?: string;
  /** chủ đề của bài (để tô viền khi chọn chủ đề) hoặc id chủ đề với chấm tâm chủ đề */
  topic?: number;
}

interface Props {
  data: InterestMap;
  highlightTopic: number | null;
}

/**
 * Mặt phẳng 2 trục chính (PCA) của không gian 768 chiều. Mọi đối tượng là chấm tròn cùng cỡ, phân biệt bằng màu (colors.ts).
 * Bắt chuột theo chấm gần con trỏ nhất (thay vì vùng vô hình quanh từng chấm, vốn chồng lên nhau ở chỗ dày chấm), nên di chuột
 * và bấm luôn trúng đúng chấm đang nhìn.
 */
export const InterestScatter: React.FC<Props> = ({ data, highlightTopic }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hover, setHover] = useState<{ mark: Mark; px: number; py: number; width: number } | null>(null);

  const domain = useMemo(() => {
    const xs: number[] = [];
    const ys: number[] = [];
    const add = (x: number | null | undefined, y: number | null | undefined) => {
      if (x == null || y == null) return;
      xs.push(x);
      ys.push(y);
    };
    data.posts.forEach((p) => add(p.x, p.y));
    data.interacted.forEach((p) => add(p.x, p.y));
    data.searches.forEach((p) => add(p.x, p.y));
    data.trail.forEach((p) => add(p.x, p.y));
    add(data.userX, data.userY);
    if (xs.length === 0) add(0, 0);
    return { minX: Math.min(...xs), maxX: Math.max(...xs), minY: Math.min(...ys), maxY: Math.max(...ys) };
  }, [data]);

  // Cùng tỉ lệ cho hai trục: khoảng cách trên hình tỉ lệ với khoảng cách trong mặt phẳng PCA
  const { sx, sy } = useMemo(() => {
    const dx = Math.max(domain.maxX - domain.minX, 1e-6) * 1.08;
    const dy = Math.max(domain.maxY - domain.minY, 1e-6) * 1.08;
    const k = Math.min((W - 2 * PAD) / dx, (H - 2 * PAD) / dy);
    const cx = (domain.minX + domain.maxX) / 2;
    const cy = (domain.minY + domain.maxY) / 2;
    return { sx: (x: number) => W / 2 + (x - cx) * k, sy: (y: number) => H / 2 - (y - cy) * k };
  }, [domain]);

  // Tất cả chấm theo thứ tự vẽ (vẽ sau nằm trên): bài khác → bài mới → bài sẽ ưu tiên → quỹ đạo → đã tương tác → tìm kiếm
  // → tâm chủ đề → vector của bạn
  const marks = useMemo(() => {
    const out: Mark[] = [];
    const interactedIds = new Set(data.interacted.map((p) => p.id));
    const recommended = new Map(data.recommendations.map((r) => [r.id, r]));
    const text = (s: string) => s || '(không có nội dung chữ)';

    for (const p of data.posts) {
      if (interactedIds.has(p.id) || recommended.has(p.id) || !!p.recent) continue;
      out.push({ key: `o-${p.id}`, kind: 'other', x: sx(p.x), y: sy(p.y), fill: OTHER_FILL, title: 'Bài viết', lines: [text(p.snippet)], postId: p.id, topic: p.topic });
    }
    for (const p of data.posts) {
      if (!p.recent || interactedIds.has(p.id) || recommended.has(p.id)) continue;
      out.push({ key: `n-${p.id}`, kind: 'recent', x: sx(p.x), y: sy(p.y), fill: RECENT_FILL, title: 'Bài mới (24 giờ qua)', lines: [text(p.snippet)], postId: p.id, topic: p.topic });
    }
    for (const p of data.posts) {
      const r = recommended.get(p.id);
      if (!r || interactedIds.has(p.id)) continue;
      out.push({ key: `r-${p.id}`, kind: 'recommend', x: sx(p.x), y: sy(p.y), fill: RECOMMEND_FILL,
        title: p.recent ? 'Bảng tin sẽ ưu tiên · bài mới' : 'Bảng tin sẽ ưu tiên', lines: [text(r.snippet), recommendReason(r)], postId: p.id, topic: p.topic });
    }
    data.trail.slice(0, -1).forEach((t, i) => {
      out.push({ key: `t-${i}`, kind: 'trail', x: sx(t.x), y: sy(t.y), fill: ACTION_FILL[t.action],
        title: 'Vị trí cũ của vector sở thích',
        lines: [`Sau khi ${ACTION_LABEL[t.action].toLowerCase()}${t.query ? ` “${t.query}”` : ''}`, timeAgo(t.at)] });
    });
    for (const p of data.interacted) {
      out.push({ key: `i-${p.id}`, kind: 'interacted', x: sx(p.x), y: sy(p.y), fill: ACTION_FILL[p.action],
        title: `Bạn đã ${ACTION_LABEL[p.action].toLowerCase()} (ảnh hưởng ×${ACTION_WEIGHT[p.action]})`,
        lines: [text(p.snippet), `Trọng số hiện tại ${p.weight.toFixed(2)}${p.count > 1 ? ` · ${p.count} lần tương tác` : ''}`],
        postId: p.id, topic: p.topic });
    }
    data.searches.forEach((s, i) => {
      out.push({ key: `s-${i}`, kind: 'search', x: sx(s.x), y: sy(s.y), fill: ACTION_FILL.SEARCH,
        title: `Bạn đã tìm kiếm (ảnh hưởng ×${ACTION_WEIGHT.SEARCH})`,
        lines: [`“${s.query}”`, `Trọng số hiện tại ${s.weight.toFixed(2)} · ${timeAgo(s.at)}`], topic: s.topic });
    });
    for (const t of data.topics) {
      out.push({ key: `c-${t.id}`, kind: 'topic', x: sx(t.x), y: sy(t.y), fill: TOPIC_FILL, title: `Chủ đề: ${t.label}`,
        lines: [`${t.posts} bài`, data.hasProfile ? `Mức gần với bạn (cosine) ${t.affinity.toFixed(3)}` : 'Chưa có vector sở thích để so'],
        topic: t.id });
    }
    if (data.userX != null && data.userY != null) {
      out.push({ key: 'user', kind: 'user', x: sx(data.userX), y: sy(data.userY), fill: USER_FILL, title: 'Vector sở thích của bạn',
        lines: [`Toạ độ (${data.userX.toFixed(3)}, ${data.userY.toFixed(3)}) trên 2 trục chính`,
          `Dựng từ ${data.vectorizedPosts} bài đã tương tác và câu đã tìm kiếm`] });
    }
    return out;
  }, [data, sx, sy]);

  /** Chấm gần con trỏ nhất trong bán kính {@link HIT_PX}; cách đều nhau (lệch ≤ 0,25) thì chấm ưu tiên cao hơn thắng */
  const pick = (e: React.MouseEvent<SVGSVGElement>) => {
    const svg = svgRef.current;
    if (!svg) return null;
    const rect = svg.getBoundingClientRect();
    const scale = W / rect.width; // đơn vị viewBox trên mỗi pixel màn hình
    const vx = (e.clientX - rect.left) * scale;
    const vy = (e.clientY - rect.top) * scale;
    const limit = HIT_PX * scale;
    let best: Mark | null = null;
    let bestD = Infinity;
    for (const m of marks) {
      const d = Math.hypot(m.x - vx, m.y - vy);
      if (d > limit) continue;
      if (d < bestD - 0.25 || (Math.abs(d - bestD) <= 0.25 && best && PRIORITY[m.kind] > PRIORITY[best.kind])) {
        best = m;
        bestD = Math.min(d, bestD);
      }
    }
    return best ? { mark: best, px: best.x / scale, py: best.y / scale, width: rect.width } : null;
  };

  const activeTopic = hover?.mark.kind === 'topic' ? hover.mark.topic ?? null : highlightTopic;
  const trailPath = data.trail.map((p) => `${sx(p.x)},${sy(p.y)}`).join(' ');
  const user = marks.find((m) => m.kind === 'user');

  return (
    <div className="relative">
      <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} className={`w-full h-auto select-none ${hover?.mark.postId ? 'cursor-pointer' : ''}`}
        role="img" aria-label="Sơ đồ sở thích: các bài viết và vector sở thích của bạn trên hai trục chính"
        onMouseMove={(e) => setHover(pick(e))} onMouseLeave={() => setHover(null)}
        onClick={(e) => {
          const hit = pick(e);
          if (hit?.mark.postId) window.open(`/posts/${hit.mark.postId}`, '_blank', 'noopener');
        }}>
        {/* Trục qua tâm dữ liệu, mờ */}
        <line x1={PAD} x2={W - PAD} y1={sy(0)} y2={sy(0)} className="stroke-gray-200 dark:stroke-[#3a3b3c]" strokeWidth={1} />
        <line y1={PAD} y2={H - PAD} x1={sx(0)} x2={sx(0)} className="stroke-gray-200 dark:stroke-[#3a3b3c]" strokeWidth={1} />

        {/* Đường quỹ đạo của vector sở thích (vẽ dưới các chấm) */}
        {data.trail.length > 1 && (
          <polyline points={trailPath} fill="none" className="stroke-[#257de0] dark:stroke-[#338ced]"
            strokeWidth={1.5} strokeOpacity={0.45} strokeLinejoin="round" strokeLinecap="round" pointerEvents="none" />
        )}

        {marks.map((m) => (
          <circle key={m.key} cx={m.x} cy={m.y} r={DOT_R} className={m.fill} pointerEvents="none" />
        ))}

        {/* Chủ đề đang chọn: viền mảnh quanh các bài và câu tìm thuộc chủ đề đó (không làm mờ chấm nào) */}
        {activeTopic !== null && marks
          .filter((m) => m.topic === activeTopic && m.kind !== 'topic')
          .map((m) => (
            <circle key={`ring-${m.key}`} cx={m.x} cy={m.y} r={DOT_R + 2} fill="none"
              className="stroke-gray-700 dark:stroke-[#e4e6eb]" strokeWidth={1} pointerEvents="none" />
          ))}

        {user && (
          <text x={user.x + 7} y={user.y + 4} pointerEvents="none"
            className="text-[12px] font-bold fill-gray-900 dark:fill-[#e4e6eb] stroke-white dark:stroke-[#242526]"
            strokeWidth={3} style={{ paintOrder: 'stroke' }}>Bạn</text>
        )}

        {/* Chấm đang trỏ: vẽ lại lên trên cùng kèm vòng viền để thấy rõ đang chọn chấm nào */}
        {hover && (
          <g pointerEvents="none">
            <circle cx={hover.mark.x} cy={hover.mark.y} r={DOT_R + 3.5} fill="none"
              className="stroke-gray-900 dark:stroke-white" strokeWidth={1.5} />
            <circle cx={hover.mark.x} cy={hover.mark.y} r={DOT_R} className={hover.mark.fill} />
          </g>
        )}

        <text x={W - PAD} y={H - 8} textAnchor="end" className="text-[10px] fill-gray-500 dark:fill-[#b0b3b8]">
          Trục chính 1 · giữ {(data.explainedX * 100).toFixed(1)}% phương sai
        </text>
        <text x={10} y={PAD - 10} className="text-[10px] fill-gray-500 dark:fill-[#b0b3b8]">
          Trục chính 2 · {(data.explainedY * 100).toFixed(1)}%
        </text>
      </svg>

      {/* Khung chi tiết neo vào chấm, nằm phía trên chấm để không che các chấm xung quanh */}
      {hover && (
        <div className="pointer-events-none absolute z-10 w-max max-w-[260px] rounded-xl bg-white dark:bg-[#3a3b3c] border border-gray-200 dark:border-[#4e4f50] shadow-lg px-3 py-2 text-xs"
          style={{
            left: hover.px > hover.width - 270 ? undefined : hover.px + 10,
            right: hover.px > hover.width - 270 ? hover.width - hover.px + 10 : undefined,
            top: hover.py - 10,
            transform: 'translateY(-100%)',
          }}>
          <div className="font-semibold text-gray-900 dark:text-[#e4e6eb] mb-0.5">{hover.mark.title}</div>
          {hover.mark.lines.map((l, i) => (
            <div key={i} className={i === 0 ? 'text-gray-700 dark:text-[#e4e6eb] line-clamp-3' : 'text-gray-500 dark:text-[#b0b3b8] mt-0.5'}>{l}</div>
          ))}
          {hover.mark.postId && <div className="text-[10px] text-[#1877f2] dark:text-[#4599ff] mt-1">Bấm để mở bài</div>}
        </div>
      )}
    </div>
  );
};
