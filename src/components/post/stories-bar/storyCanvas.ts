/**
 * Vẽ tin 9:16. Cùng một hàm vẽ cho khung xem trước và ảnh 1080x1920 đăng lên, nên ảnh đăng giống hệt bản xem trước.
 * Mọi toạ độ tính trong không gian 1080x1920; khung xem trước chỉ đổi tỉ lệ.
 */

export const STORY_W = 1080;
export const STORY_H = 1920;

export interface StoryFont {
  id: string;
  label: string;
  family: string;
  weight: number;
  italic?: boolean;
  upper?: boolean;
}

export const STORY_FONTS: StoryFont[] = [
  { id: 'clean', label: 'Gọn gàng', family: '"Segoe UI", Helvetica, Arial, sans-serif', weight: 700 },
  { id: 'simple', label: 'Đơn giản', family: '"Segoe UI", Helvetica, Arial, sans-serif', weight: 400 },
  { id: 'casual', label: 'Thông thường', family: '"Comic Sans MS", "Chalkboard SE", cursive', weight: 700 },
  { id: 'fancy', label: 'Cầu kỳ', family: 'Georgia, "Times New Roman", serif', weight: 400, italic: true },
  { id: 'headline', label: 'Tiêu đề', family: 'Impact, "Arial Black", sans-serif', weight: 700, upper: true },
];

export interface StoryBackground {
  id: string;
  from: string;
  to: string;
  ink: string; // màu chữ trên nền này
}

export const STORY_BACKGROUNDS: StoryBackground[] = [
  { id: 'blue', from: '#1877f2', to: '#1877f2', ink: '#ffffff' },
  { id: 'sky', from: '#00c6ff', to: '#0072ff', ink: '#ffffff' },
  { id: 'violet', from: '#8e2de2', to: '#4a00e0', ink: '#ffffff' },
  { id: 'pink', from: '#f857a6', to: '#ff5858', ink: '#ffffff' },
  { id: 'sunset', from: '#f12711', to: '#f5af19', ink: '#ffffff' },
  { id: 'peach', from: '#ffecd2', to: '#fcb69f', ink: '#1c1e21' },
  { id: 'mint', from: '#11998e', to: '#38ef7d', ink: '#ffffff' },
  { id: 'night', from: '#0f2027', to: '#2c5364', ink: '#ffffff' },
  { id: 'red', from: '#e41e3f', to: '#e41e3f', ink: '#ffffff' },
  { id: 'orange', from: '#f7923b', to: '#f7923b', ink: '#ffffff' },
  { id: 'yellow', from: '#fcd34d', to: '#fcd34d', ink: '#1c1e21' },
  { id: 'green', from: '#45bd62', to: '#45bd62', ink: '#ffffff' },
  { id: 'teal', from: '#2abba7', to: '#2abba7', ink: '#ffffff' },
  { id: 'purple', from: '#9360f7', to: '#9360f7', ink: '#ffffff' },
  { id: 'black', from: '#1c1e21', to: '#1c1e21', ink: '#ffffff' },
  { id: 'white', from: '#f0f2f5', to: '#f0f2f5', ink: '#1c1e21' },
];

export const TEXT_COLORS = ['#ffffff', '#1c1e21', '#e41e3f', '#f7923b', '#fcd34d', '#45bd62', '#1877f2', '#9360f7', '#f857a6'];

export const backgroundCss = (bg: StoryBackground) =>
  bg.from === bg.to ? bg.from : `linear-gradient(to bottom right, ${bg.from}, ${bg.to})`;

/** Chữ đặt trên ảnh; x, y là tâm chữ theo tỉ lệ 0..1 của khung. */
export interface StoryTextLayer {
  text: string;
  x: number;
  y: number;
  fontId: string;
  color: string;
}

export interface PhotoState {
  image: HTMLImageElement;
  backdrop: HTMLCanvasElement; // ảnh thu nhỏ, phóng lên làm nền mờ
  zoom: number; // 1..3, 1 = vừa khít khung
  panX: number; // độ lệch tâm ảnh (px trong không gian 1080x1920)
  panY: number;
  rotate: number; // 0, 90, 180, 270
}

export type StoryScene =
  | { kind: 'text'; text: string; fontId: string; background: StoryBackground }
  | { kind: 'photo'; photo: PhotoState; overlay: StoryTextLayer | null };

export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

const fontOf = (id: string) => STORY_FONTS.find((f) => f.id === id) || STORY_FONTS[0];

const fontCss = (f: StoryFont, size: number) => `${f.italic ? 'italic ' : ''}${f.weight} ${size}px ${f.family}`;

/** Cỡ chữ tin văn bản giảm dần theo độ dài, giống Facebook: câu ngắn chữ to. */
export const textStorySize = (text: string) => {
  const n = text.trim().length;
  if (n <= 20) return 96;
  if (n <= 60) return 76;
  if (n <= 140) return 60;
  if (n <= 260) return 48;
  return 40;
};

const OVERLAY_SIZE = 64;

/** Xuống dòng theo bề rộng tối đa, giữ cả dấu xuống dòng người dùng gõ; từ quá dài thì cắt theo ký tự. */
export function wrapLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const lines: string[] = [];
  for (const paragraph of text.split('\n')) {
    let line = '';
    for (const word of paragraph.split(/\s+/).filter(Boolean)) {
      const candidate = line ? `${line} ${word}` : word;
      if (ctx.measureText(candidate).width <= maxWidth) {
        line = candidate;
        continue;
      }
      if (line) lines.push(line);
      line = '';
      let piece = '';
      for (const ch of word) {
        if (ctx.measureText(piece + ch).width > maxWidth && piece) {
          lines.push(piece);
          piece = ch;
        } else {
          piece += ch;
        }
      }
      line = piece;
    }
    lines.push(line);
  }
  return lines;
}

/** Vẽ khối chữ căn giữa tại (cx, cy); trả về khung bao để bắt thao tác kéo. */
function drawTextBlock(
  ctx: CanvasRenderingContext2D,
  raw: string,
  font: StoryFont,
  size: number,
  color: string,
  cx: number,
  cy: number,
  shadow: boolean,
): Box {
  const text = font.upper ? raw.toUpperCase() : raw;
  ctx.font = fontCss(font, size);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const lines = wrapLines(ctx, text, STORY_W * 0.8);
  const lineHeight = size * 1.25;
  const width = Math.max(...lines.map((l) => ctx.measureText(l).width), size);
  const height = lines.length * lineHeight;

  ctx.save();
  ctx.fillStyle = color;
  if (shadow) {
    ctx.shadowColor = 'rgba(0,0,0,0.55)';
    ctx.shadowBlur = 12;
    ctx.shadowOffsetY = 2;
  }
  let y = cy - height / 2 + lineHeight / 2;
  for (const line of lines) {
    ctx.fillText(line, cx, y);
    y += lineHeight;
  }
  ctx.restore();

  const pad = size * 0.3;
  return { x: cx - width / 2 - pad, y: cy - height / 2 - pad, w: width + pad * 2, h: height + pad * 2 };
}

/** Kích thước ảnh sau khi xoay và phóng (zoom 1 = vừa khít, không bị cắt). */
export function photoSize(p: PhotoState) {
  const sideways = p.rotate % 180 !== 0;
  const iw = sideways ? p.image.naturalHeight : p.image.naturalWidth;
  const ih = sideways ? p.image.naturalWidth : p.image.naturalHeight;
  const scale = Math.min(STORY_W / iw, STORY_H / ih) * p.zoom;
  return { scale, w: iw * scale, h: ih * scale };
}

/** Ảnh thu nhỏ còn 24px: khi phóng lên tự nhoè, làm nền mờ rẻ và chạy được cả trên Safari (không cần ctx.filter). */
export function makeBackdrop(image: HTMLImageElement): HTMLCanvasElement {
  const c = document.createElement('canvas');
  const ratio = image.naturalWidth / image.naturalHeight || 1;
  c.width = 24;
  c.height = Math.max(1, Math.round(24 / ratio));
  c.getContext('2d')?.drawImage(image, 0, 0, c.width, c.height);
  return c;
}

/**
 * Vẽ cả tin lên ctx. {@code pixelScale} = số pixel thật trên mỗi đơn vị của không gian 1080x1920.
 * Trả về khung bao của chữ trên ảnh (để kéo), hoặc null.
 */
export function renderStory(ctx: CanvasRenderingContext2D, scene: StoryScene, pixelScale: number, placeholder = ''): Box | null {
  ctx.setTransform(pixelScale, 0, 0, pixelScale, 0, 0);
  ctx.clearRect(0, 0, STORY_W, STORY_H);

  if (scene.kind === 'text') {
    const bg = scene.background;
    const grad = ctx.createLinearGradient(0, 0, STORY_W, STORY_H);
    grad.addColorStop(0, bg.from);
    grad.addColorStop(1, bg.to);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, STORY_W, STORY_H);

    const text = scene.text.trim() ? scene.text : placeholder;
    if (text) {
      ctx.save();
      if (!scene.text.trim()) ctx.globalAlpha = 0.6;
      drawTextBlock(ctx, text, fontOf(scene.fontId), textStorySize(text), bg.ink, STORY_W / 2, STORY_H / 2, false);
      ctx.restore();
    }
    return null;
  }

  const p = scene.photo;
  // Nền: ảnh mờ phủ kín khung, tối đi một chút để ảnh chính nổi lên
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, STORY_W, STORY_H);
  const cover = Math.max(STORY_W / p.backdrop.width, STORY_H / p.backdrop.height);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(
    p.backdrop,
    (STORY_W - p.backdrop.width * cover) / 2,
    (STORY_H - p.backdrop.height * cover) / 2,
    p.backdrop.width * cover,
    p.backdrop.height * cover,
  );
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.fillRect(0, 0, STORY_W, STORY_H);

  const { scale } = photoSize(p);
  const w = p.image.naturalWidth * scale;
  const h = p.image.naturalHeight * scale;
  ctx.save();
  ctx.translate(STORY_W / 2 + p.panX, STORY_H / 2 + p.panY);
  ctx.rotate((p.rotate * Math.PI) / 180);
  ctx.drawImage(p.image, -w / 2, -h / 2, w, h);
  ctx.restore();

  const o = scene.overlay;
  if (!o) return null;
  const text = o.text.trim() ? o.text : placeholder;
  if (!text) return null;
  ctx.save();
  if (!o.text.trim()) ctx.globalAlpha = 0.7;
  const box = drawTextBlock(ctx, text, fontOf(o.fontId), OVERLAY_SIZE, o.color, o.x * STORY_W, o.y * STORY_H, true);
  ctx.restore();
  return box;
}

/** Xuất ảnh 1080x1920 để tải lên. */
export function exportStory(scene: StoryScene): Promise<File | null> {
  const canvas = document.createElement('canvas');
  canvas.width = STORY_W;
  canvas.height = STORY_H;
  const ctx = canvas.getContext('2d');
  if (!ctx) return Promise.resolve(null);
  renderStory(ctx, scene, 1);
  return new Promise((resolve) =>
    canvas.toBlob((blob) => resolve(blob ? new File([blob], 'story.jpg', { type: 'image/jpeg' }) : null), 'image/jpeg', 0.92),
  );
}
