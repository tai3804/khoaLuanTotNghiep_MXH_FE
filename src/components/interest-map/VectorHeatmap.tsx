import React, { useMemo, useRef, useState } from 'react';
import { useTheme } from '../../context/ThemeContext';

const COLS = 32;
const CELL = 14;
const GAP = 2;
interface Props {
  vector: number[];
}

type RGB = [number, number, number];
const hex = (h: string): RGB => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)) as RGB;
const mix = (a: RGB, b: RGB, t: number) => `rgb(${a.map((v, i) => Math.round(v + (b[i] - v) * t)).join(',')})`;

// Thang phân kỳ: âm = đỏ, 0 = xám trung tính, dương = xanh (hai cực ấm/lạnh, điểm giữa không mang sắc)
const SCALE = {
  light: { neg: hex('#c42f30'), mid: hex('#efefef'), pos: hex('#1b64be') },
  dark: { neg: hex('#eb6263'), mid: hex('#3a3b3c'), pos: hex('#519ced') },
};

/** Toàn bộ 768 chiều của vector sở thích, mỗi ô một chiều (24 hàng × 32 cột), màu theo dấu và độ lớn. */
export const VectorHeatmap: React.FC<Props> = ({ vector }) => {
  const { theme } = useTheme();
  const scale = theme === 'dark' ? SCALE.dark : SCALE.light;
  const wrapRef = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<{ i: number; left: number; top: number } | null>(null);

  const rows = Math.ceil(vector.length / COLS);
  const width = COLS * CELL + (COLS - 1) * GAP;
  const height = rows * CELL + (rows - 1) * GAP;
  // Thang màu bão hoà ở phân vị 98 của |giá trị|: vài chiều rất lớn không làm phần còn lại nhạt gần như xám
  const maxAbs = useMemo(() => {
    const sorted = vector.map(Math.abs).sort((a, b) => a - b);
    return Math.max(1e-6, sorted[Math.floor(sorted.length * 0.98)] ?? 0);
  }, [vector]);
  const color = (v: number) => {
    const t = Math.min(1, Math.abs(v) / maxAbs);
    return mix(scale.mid, v < 0 ? scale.neg : scale.pos, t);
  };
  const strongest = useMemo(
    () => vector.map((v, i) => ({ v, i })).sort((a, b) => Math.abs(b.v) - Math.abs(a.v)).slice(0, 3),
    [vector]
  );

  const onMove = (e: React.MouseEvent, i: number) => {
    const rect = wrapRef.current?.getBoundingClientRect();
    if (rect) setHover({ i, left: e.clientX - rect.left, top: e.clientY - rect.top });
  };

  return (
    <div className="space-y-2.5">
      <div ref={wrapRef} className="relative" onMouseLeave={() => setHover(null)}>
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto" role="img"
          aria-label={`Giá trị ${vector.length} chiều của vector sở thích`}>
          {vector.map((v, i) => {
            const c = i % COLS, r = Math.floor(i / COLS);
            return (
              <rect key={i} x={c * (CELL + GAP)} y={r * (CELL + GAP)} width={CELL} height={CELL} rx={2.5}
                fill={color(v)} onMouseMove={(e) => onMove(e, i)} />
            );
          })}
        </svg>
        {hover && (
          <div className="pointer-events-none absolute z-10 rounded-xl bg-white dark:bg-[#3a3b3c] border border-gray-200 dark:border-[#4e4f50] shadow-lg px-3 py-2 text-xs whitespace-nowrap"
            style={{ left: Math.min(hover.left + 12, (wrapRef.current?.clientWidth ?? 0) - 190), top: hover.top + 12 }}>
            <div className="font-semibold text-gray-900 dark:text-[#e4e6eb]">Chiều #{hover.i + 1}</div>
            <div className="text-gray-700 dark:text-[#e4e6eb] tabular-nums">Giá trị {vector[hover.i].toFixed(4)}</div>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 text-[11px] text-gray-500 dark:text-[#b0b3b8]">
        <div className="flex items-center gap-2">
          <span className="tabular-nums">≤ −{maxAbs.toFixed(3)}</span>
          <span className="h-2.5 w-32 rounded-full"
            style={{ background: `linear-gradient(90deg, ${mix(scale.mid, scale.neg, 1)}, ${mix(scale.mid, scale.mid, 0)}, ${mix(scale.mid, scale.pos, 1)})` }} />
          <span className="tabular-nums">≥ +{maxAbs.toFixed(3)}</span>
        </div>
        <div>
          Mạnh nhất: {strongest.map((s) => `#${s.i + 1} (${s.v >= 0 ? '+' : ''}${s.v.toFixed(3)})`).join(', ')}
        </div>
      </div>
    </div>
  );
};
