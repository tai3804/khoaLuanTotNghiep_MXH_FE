import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Minus, Plus, RotateCw } from 'lucide-react';
import { Box, PhotoState, renderStory, STORY_H, STORY_W, StoryScene, StoryTextLayer } from './storyCanvas';

interface StoryPreviewProps {
  scene: StoryScene;
  onPhotoChange?: (patch: Partial<PhotoState>) => void;
  onOverlayMove?: (patch: Pick<StoryTextLayer, 'x' | 'y'>) => void;
  /** Lớp phủ chỉ để xem (vd nhãn nhạc), không vẽ vào ảnh đăng lên. */
  children?: React.ReactNode;
}

type Drag = { target: 'image' | 'text'; startX: number; startY: number; fromX: number; fromY: number; unit: number };

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

/** Khung "Xem trước" như Facebook: nền tối, tin 9:16 ở giữa; tin ảnh có thanh thu phóng và nút Xoay bên dưới. */
export const StoryPreview: React.FC<StoryPreviewProps> = ({ scene, onPhotoChange, onOverlayMove, children }) => {
  const areaRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const textBoxRef = useRef<Box | null>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [drag, setDrag] = useState<Drag | null>(null);
  const [hoverText, setHoverText] = useState(false);

  // Khung 9:16 lớn nhất vừa vùng xem trước
  useLayoutEffect(() => {
    const el = areaRef.current;
    if (!el) return;
    const fit = () => {
      const h = Math.min(el.clientHeight, (el.clientWidth * 16) / 9);
      setSize({ w: Math.floor((h * 9) / 16), h: Math.floor(h) });
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !size.w) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(size.w * dpr);
    canvas.height = Math.round(size.h * dpr);
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    textBoxRef.current = renderStory(ctx, scene, (size.w * dpr) / STORY_W, 'Bắt đầu nhập');
  }, [scene, size]);

  const toStory = (e: React.PointerEvent) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const unit = STORY_W / rect.width;
    return { x: (e.clientX - rect.left) * unit, y: (e.clientY - rect.top) * unit, unit };
  };

  const hitsText = (x: number, y: number) => {
    const b = textBoxRef.current;
    return !!b && x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h;
  };

  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (scene.kind !== 'photo') return;
    const { x, y, unit } = toStory(e);
    e.currentTarget.setPointerCapture(e.pointerId);
    if (scene.overlay && hitsText(x, y)) {
      setDrag({ target: 'text', startX: e.clientX, startY: e.clientY, fromX: scene.overlay.x, fromY: scene.overlay.y, unit });
    } else {
      setDrag({ target: 'image', startX: e.clientX, startY: e.clientY, fromX: scene.photo.panX, fromY: scene.photo.panY, unit });
    }
  };

  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (scene.kind !== 'photo') return;
    if (!drag) {
      const { x, y } = toStory(e);
      setHoverText(!!scene.overlay && hitsText(x, y));
      return;
    }
    const dx = (e.clientX - drag.startX) * drag.unit;
    const dy = (e.clientY - drag.startY) * drag.unit;
    if (drag.target === 'text') {
      onOverlayMove?.({ x: clamp(drag.fromX + dx / STORY_W, 0.05, 0.95), y: clamp(drag.fromY + dy / STORY_H, 0.05, 0.95) });
    } else {
      onPhotoChange?.({ panX: clamp(drag.fromX + dx, -STORY_W, STORY_W), panY: clamp(drag.fromY + dy, -STORY_H, STORY_H) });
    }
  };

  const endDrag = () => setDrag(null);

  const photo = scene.kind === 'photo' ? scene.photo : null;
  const cursor = !photo ? 'default' : drag ? 'grabbing' : hoverText ? 'move' : 'grab';

  return (
    <div className="flex-1 min-h-0 flex flex-col bg-white dark:bg-[#242526] rounded-lg shadow-sm border border-gray-200 dark:border-[#393a3b] p-4">
      <h3 className="text-[15px] font-semibold text-gray-900 dark:text-[#e4e6eb] mb-3">Xem trước</h3>
      <div className="flex-1 min-h-0 flex flex-col items-center rounded-lg bg-[#18191a] px-4 py-5 gap-4">
        {photo && (
          <p className="text-[13px] text-white/80 -mt-1">Kéo ảnh để căn chỉnh, kéo chữ để di chuyển</p>
        )}
        <div ref={areaRef} className="flex-1 min-h-0 w-full flex items-center justify-center">
          <div className="relative rounded-lg overflow-hidden shadow-2xl" style={{ width: size.w, height: size.h }}>
            <canvas
              ref={canvasRef}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={endDrag}
              onPointerCancel={endDrag}
              onPointerLeave={() => !drag && setHoverText(false)}
              style={{ width: size.w, height: size.h, cursor, touchAction: 'none' }}
              className="block"
              aria-label="Xem trước tin"
            />
            {children}
          </div>
        </div>

        {photo && onPhotoChange && (
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => onPhotoChange({ zoom: clamp(+(photo.zoom - 0.1).toFixed(2), 1, 3) })}
              aria-label="Thu nhỏ"
              className="w-8 h-8 rounded-full flex items-center justify-center text-white/80 hover:bg-white/10 cursor-pointer"
            >
              <Minus className="w-4 h-4" />
            </button>
            <input
              type="range"
              min={1}
              max={3}
              step={0.01}
              value={photo.zoom}
              onChange={(e) => onPhotoChange({ zoom: parseFloat(e.target.value) })}
              aria-label="Thu phóng"
              className="w-40 sm:w-56 accent-[#1877f2] cursor-pointer"
            />
            <button
              type="button"
              onClick={() => onPhotoChange({ zoom: clamp(+(photo.zoom + 0.1).toFixed(2), 1, 3) })}
              aria-label="Phóng to"
              className="w-8 h-8 rounded-full flex items-center justify-center text-white/80 hover:bg-white/10 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onPhotoChange({ rotate: (photo.rotate + 90) % 360 })}
              className="ml-2 flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#3a3b3c] hover:bg-[#4e4f50] text-white text-sm font-semibold cursor-pointer"
            >
              <RotateCw className="w-4 h-4" />
              <span>Xoay</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
