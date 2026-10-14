import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  X,
  Upload,
  Image as ImageIcon,
  Type,
  Loader2,
  Sparkles,
  Music,
  Plus,
  Trash2,
  GripHorizontal,
  Move,
  RotateCw,
} from 'lucide-react';
import { UserAvatar } from '../../common/UserAvatar';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { mediaService } from '../../../services/mediaService';
import { storyService } from '../../../services/storyService';
import {
  PhotoAdjustments,
  PhotoCropSettings,
  PhotoFilter,
  PhotoTransform,
  StoryAudioTrack,
  StoryPrivacy,
  StorySticker,
  DraggableText,
} from './types';
import { PHOTO_FILTERS, StoryImageEditor } from './StoryImageEditor';
import { StoryAudioPickerModal } from './StoryAudioPickerModal';
import { StoryPrivacySelector } from './StoryPrivacySelector';
import { StoryMusicBadge } from './StoryMusicBadge';

interface CreateStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl?: string;
  setImageUrl?: (url: string) => void;
  creating?: boolean;
  uploadingMedia?: boolean;
  storyFileInputRef?: React.RefObject<HTMLInputElement | null>;
  handleStoryFileSelect?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleCreateStorySubmit?: (e: React.FormEvent) => void;
}

const GRADIENT_PRESETS = [
  { id: 'sunset', label: 'Hoàng hôn', gradient: 'linear-gradient(135deg, #f12711 0%, #f5af19 100%)', colors: ['#f12711', '#f5af19'] },
  { id: 'ocean', label: 'Đại dương', gradient: 'linear-gradient(135deg, #2193b0 0%, #6dd5ed 100%)', colors: ['#2193b0', '#6dd5ed'] },
  { id: 'violet', label: 'Tím mộng mơ', gradient: 'linear-gradient(135deg, #8e2de2 0%, #4a00e0 100%)', colors: ['#8e2de2', '#4a00e0'] },
  { id: 'berry', label: 'Dâu tây', gradient: 'linear-gradient(135deg, #ff0844 0%, #ffb199 100%)', colors: ['#ff0844', '#ffb199'] },
  { id: 'emerald', label: 'Ngọc bích', gradient: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)', colors: ['#11998e', '#38ef7d'] },
  { id: 'midnight', label: 'Bóng đêm', gradient: 'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)', colors: ['#0f2027', '#2c5364'] },
  { id: 'neon', label: 'Neon Cyber', gradient: 'linear-gradient(135deg, #b224ef 0%, #7579ff 100%)', colors: ['#b224ef', '#7579ff'] },
];

const FONT_STYLES = [
  { id: 'sans', label: 'Gọn gàng', fontClass: 'font-sans font-bold' },
  { id: 'serif', label: 'Thanh lịch', fontClass: 'font-serif font-medium italic' },
  { id: 'mono', label: 'Hiện đại', fontClass: 'font-mono font-bold tracking-wide' },
  { id: 'headline', label: 'Nổi bật', fontClass: 'font-black uppercase tracking-wider' },
];

const DEFAULT_ADJUSTMENTS: PhotoAdjustments = {
  brightness: 100,
  contrast: 100,
  saturation: 100,
  blur: 0,
};

const DEFAULT_TRANSFORM: PhotoTransform = {
  rotate: 0,
  flipH: false,
  flipV: false,
};

const DEFAULT_CROP: PhotoCropSettings = {
  zoom: 1.0,
  panX: 0,
  panY: 0,
  fitMode: 'cover',
};

export const CreateStoryModal: React.FC<CreateStoryModalProps> = ({
  isOpen,
  onClose,
  setImageUrl: setParentImageUrl,
}) => {
  const { user } = useAuth();
  const toast = useToast();

  const [storyType, setStoryType] = useState<'photo' | 'text'>('photo');
  const [privacy, setPrivacy] = useState<StoryPrivacy>('PUBLIC');
  const [selectedAudio, setSelectedAudio] = useState<StoryAudioTrack | null>(null);
  const [showAudioModal, setShowAudioModal] = useState(false);
  const [isAudioPreviewPlaying, setIsAudioPreviewPlaying] = useState(false);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);

  // Photo Story States
  const [photoSrc, setPhotoSrc] = useState<string>('');
  const [filter, setFilter] = useState<PhotoFilter>(PHOTO_FILTERS[0]);
  const [adjustments, setAdjustments] = useState<PhotoAdjustments>(DEFAULT_ADJUSTMENTS);
  const [transform, setTransform] = useState<PhotoTransform>(DEFAULT_TRANSFORM);
  const [crop, setCrop] = useState<PhotoCropSettings>(DEFAULT_CROP);
  const [stickers, setStickers] = useState<StorySticker[]>([]);
  const [draggableText, setDraggableText] = useState<DraggableText | null>(null);

  // Text Story States
  const [textContent, setTextContent] = useState('');
  const [selectedGradient, setSelectedGradient] = useState(GRADIENT_PRESETS[0]);
  const [selectedFont, setSelectedFont] = useState(FONT_STYLES[0]);

  // Publishing State
  const [isPublishing, setIsPublishing] = useState(false);
  const localFileInputRef = useRef<HTMLInputElement | null>(null);
  const phoneCanvasRef = useRef<HTMLDivElement | null>(null);

  // Interactive Dragging on Phone Canvas Preview
  const [draggingItem, setDraggingItem] = useState<{
    type: 'text' | 'sticker' | 'image';
    id?: string;
    startClientX: number;
    startClientY: number;
    initialX: number;
    initialY: number;
  } | null>(null);

  // Clean up preview audio on unmount or close
  useEffect(() => {
    if (!isOpen && previewAudioRef.current) {
      previewAudioRef.current.pause();
      setIsAudioPreviewPlaying(false);
    }
  }, [isOpen]);

  // Global mouse move & mouse up handler for canvas dragging
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!draggingItem || !phoneCanvasRef.current) return;
      const rect = phoneCanvasRef.current.getBoundingClientRect();
      const deltaXPercent = ((e.clientX - draggingItem.startClientX) / rect.width) * 100;
      const deltaYPercent = ((e.clientY - draggingItem.startClientY) / rect.height) * 100;

      if (draggingItem.type === 'text') {
        setDraggableText((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            x: Math.max(5, Math.min(95, draggingItem.initialX + deltaXPercent)),
            y: Math.max(8, Math.min(92, draggingItem.initialY + deltaYPercent)),
          };
        });
      } else if (draggingItem.type === 'sticker' && draggingItem.id) {
        setStickers((prev) =>
          prev.map((s) => {
            if (s.id !== draggingItem.id) return s;
            return {
              ...s,
              x: Math.max(5, Math.min(95, draggingItem.initialX + deltaXPercent)),
              y: Math.max(8, Math.min(92, draggingItem.initialY + deltaYPercent)),
            };
          })
        );
      } else if (draggingItem.type === 'image') {
        setCrop((prev) => ({
          ...prev,
          panX: Math.max(-50, Math.min(50, draggingItem.initialX + deltaXPercent * 0.8)),
          panY: Math.max(-50, Math.min(50, draggingItem.initialY + deltaYPercent * 0.8)),
        }));
      }
    };

    const handleMouseUp = () => {
      setDraggingItem(null);
    };

    if (draggingItem) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggingItem]);

  if (!isOpen) return null;

  const authorName = user?.fullName || user?.username || 'Người dùng';
  const avatarUrl = user?.avatar || '/default-avatar.png';

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.showError('Hệ thống Story chỉ hỗ trợ tệp hình ảnh (JPG, PNG, WEBP).');
      return;
    }

    const localUrl = URL.createObjectURL(file);
    setPhotoSrc(localUrl);
    setParentImageUrl?.(localUrl);
    // Reset edits for new image
    setFilter(PHOTO_FILTERS[0]);
    setAdjustments(DEFAULT_ADJUSTMENTS);
    setTransform(DEFAULT_TRANSFORM);
    setCrop(DEFAULT_CROP);
    setStickers([]);
  };

  const handleResetPhotoEdits = () => {
    setFilter(PHOTO_FILTERS[0]);
    setAdjustments(DEFAULT_ADJUSTMENTS);
    setTransform(DEFAULT_TRANSFORM);
    setCrop(DEFAULT_CROP);
    setStickers([]);
    setDraggableText(null);
  };

  const handleResetCrop = () => {
    setCrop(DEFAULT_CROP);
  };

  const handleZoomMinus = () => {
    setCrop((prev) => ({
      ...prev,
      zoom: Math.max(1, parseFloat((prev.zoom - 0.1).toFixed(2))),
    }));
  };

  const handleZoomPlus = () => {
    setCrop((prev) => ({
      ...prev,
      zoom: Math.min(3, parseFloat((prev.zoom + 0.1).toFixed(2))),
    }));
  };

  const handleZoomSlider = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCrop((prev) => ({
      ...prev,
      zoom: parseFloat(e.target.value),
    }));
  };

  const handleRotateCanvas = () => {
    setTransform((prev) => ({
      ...prev,
      rotate: (prev.rotate + 90) % 360,
    }));
  };

  const handleAddSticker = (emoji: string) => {
    if (stickers.length >= 8) {
      toast.showInfo('Bạn đã thêm tối đa 8 nhãn dán cho tin.');
      return;
    }
    const newSticker: StorySticker = {
      id: 'sticker-' + Date.now(),
      emoji,
      x: 35 + Math.random() * 30,
      y: 25 + Math.random() * 40,
    };
    setStickers((prev) => [...prev, newSticker]);
  };

  const handleRemoveSticker = (id: string) => {
    setStickers((prev) => prev.filter((s) => s.id !== id));
  };

  const togglePreviewAudio = () => {
    if (!selectedAudio) return;
    if (isAudioPreviewPlaying) {
      previewAudioRef.current?.pause();
      setIsAudioPreviewPlaying(false);
    } else {
      if (!previewAudioRef.current) {
        previewAudioRef.current = new Audio(selectedAudio.url);
      } else {
        previewAudioRef.current.src = selectedAudio.url;
      }
      previewAudioRef.current
        .play()
        .then(() => setIsAudioPreviewPlaying(true))
        .catch(() => setIsAudioPreviewPlaying(false));
      previewAudioRef.current.onended = () => setIsAudioPreviewPlaying(false);
    }
  };

  // Helper to draw rounded rectangle on canvas
  const drawRoundedRect = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    r: number
  ) => {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  };

  // Generate 1080x1920 Story Image with canvas
  const generateEditedCanvasFile = async (): Promise<File | null> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      canvas.width = 1080;
      canvas.height = 1920;
      const ctx = canvas.getContext('2d');
      if (!ctx) return resolve(null);

      if (storyType === 'text') {
        // Text Story
        const grad = ctx.createLinearGradient(0, 0, 1080, 1920);
        grad.addColorStop(0, selectedGradient.colors[0]);
        grad.addColorStop(1, selectedGradient.colors[1]);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 1080, 1920);

        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        let fontFam = 'sans-serif';
        if (selectedFont.id === 'serif') fontFam = 'serif';
        if (selectedFont.id === 'mono') fontFam = 'monospace';

        ctx.font = `bold 64px ${fontFam}`;
        ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
        ctx.shadowBlur = 18;
        ctx.shadowOffsetY = 4;

        const words = textContent.trim().split(/\s+/);
        const lines: string[] = [];
        let currentLine = '';
        const maxWidth = 880;

        for (const word of words) {
          const testLine = currentLine ? `${currentLine} ${word}` : word;
          if (ctx.measureText(testLine).width > maxWidth && currentLine) {
            lines.push(currentLine);
            currentLine = word;
          } else {
            currentLine = testLine;
          }
        }
        if (currentLine) lines.push(currentLine);

        const lineHeight = 96;
        const totalHeight = lines.length * lineHeight;
        let startY = 1920 / 2 - totalHeight / 2 + lineHeight / 2;

        for (const line of lines) {
          ctx.fillText(line, 1080 / 2, startY);
          startY += lineHeight;
        }

        canvas.toBlob((blob) => {
          if (!blob) return resolve(null);
          resolve(new File([blob], 'story-text.png', { type: 'image/png' }));
        }, 'image/png');
      } else {
        // Photo Story with crop, filters, transform, stickers, and draggable text
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          // Fill black background
          ctx.fillStyle = '#000000';
          ctx.fillRect(0, 0, 1080, 1920);

          // If fitMode is 'contain', draw blurred background image for aesthetic fill
          if (crop.fitMode === 'contain') {
            ctx.save();
            ctx.filter = 'blur(35px) brightness(60%)';
            const bgScale = Math.max(1080 / img.width, 1920 / img.height) * 1.15;
            const bgW = img.width * bgScale;
            const bgH = img.height * bgScale;
            ctx.drawImage(img, 1080 / 2 - bgW / 2, 1920 / 2 - bgH / 2, bgW, bgH);
            ctx.restore();
          }

          // Build filter string
          let filterString = '';
          if (filter.id !== 'normal') filterString += filter.css + ' ';
          filterString += `brightness(${adjustments.brightness}%) contrast(${adjustments.contrast}%) saturate(${adjustments.saturation}%) `;
          if (adjustments.blur > 0) filterString += `blur(${adjustments.blur}px) `;
          ctx.filter = filterString.trim();

          // Compute scale based on fitMode ('cover' or 'contain') and zoom
          const baseScale =
            crop.fitMode === 'contain'
              ? Math.min(1080 / img.width, 1920 / img.height)
              : Math.max(1080 / img.width, 1920 / img.height);
          const finalScale = baseScale * crop.zoom;
          const w = img.width * finalScale;
          const h = img.height * finalScale;

          // Pan translation offsets
          const panXpx = (crop.panX / 100) * 1080;
          const panYpx = (crop.panY / 100) * 1920;

          // Apply Transformations (Rotate & Flip)
          ctx.save();
          ctx.translate(1080 / 2 + panXpx, 1920 / 2 + panYpx);
          if (transform.rotate !== 0) {
            ctx.rotate((transform.rotate * Math.PI) / 180);
          }
          ctx.scale(transform.flipH ? -1 : 1, transform.flipV ? -1 : 1);
          ctx.drawImage(img, -w / 2, -h / 2, w, h);
          ctx.restore();

          // Reset filter for stickers & draggable text
          ctx.filter = 'none';

          // Draw Stickers
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.font = '84px sans-serif';
          ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
          ctx.shadowBlur = 12;

          for (const s of stickers) {
            const posX = (s.x / 100) * 1080;
            const posY = (s.y / 100) * 1920;
            ctx.fillText(s.emoji, posX, posY);
          }

          // Draw Draggable Text Note if exists
          if (draggableText && draggableText.text.trim()) {
            ctx.save();
            const textPixelX = (draggableText.x / 100) * 1080;
            const textPixelY = (draggableText.y / 100) * 1920;
            const fontPx = Math.round(draggableText.fontSize * 3.2);
            ctx.font = `bold ${fontPx}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            const metrics = ctx.measureText(draggableText.text);
            const padX = fontPx * 0.7;
            const padY = fontPx * 0.45;
            const boxW = metrics.width + padX * 2;
            const boxH = fontPx + padY * 2;

            if (draggableText.bgColor !== 'transparent') {
              ctx.fillStyle = draggableText.bgColor;
              drawRoundedRect(
                ctx,
                textPixelX - boxW / 2,
                textPixelY - boxH / 2,
                boxW,
                boxH,
                boxH / 2
              );
              ctx.fill();
            }

            ctx.fillStyle = draggableText.color;
            ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
            ctx.shadowBlur = 10;
            ctx.fillText(draggableText.text, textPixelX, textPixelY);
            ctx.restore();
          }

          canvas.toBlob((blob) => {
            if (!blob) return resolve(null);
            resolve(new File([blob], 'story-photo.png', { type: 'image/png' }));
          }, 'image/png');
        };
        img.onerror = () => resolve(null);
        img.src = photoSrc;
      }
    });
  };

  const handlePublishStory = async () => {
    if (storyType === 'photo' && !photoSrc) {
      toast.showError('Vui lòng chọn hình ảnh để tạo tin.');
      return;
    }
    if (storyType === 'text' && !textContent.trim()) {
      toast.showError('Vui lòng nhập nội dung cho tin văn bản.');
      return;
    }

    setIsPublishing(true);
    try {
      const file = await generateEditedCanvasFile();
      if (!file) throw new Error('Không thể xử lý hình ảnh tin');

      // 1. Upload to Cloud Storage
      const uploaded = await mediaService.uploadMedia(file, 'stories');

      // 2. Prepare Caption Payload (with audio metadata if music is selected)
      const captionText = draggableText?.text.trim() || (storyType === 'text' ? textContent.trim() : '');
      let finalCaptionPayload = captionText || undefined;

      if (selectedAudio) {
        finalCaptionPayload = JSON.stringify({
          text: captionText,
          audio: {
            title: selectedAudio.title,
            artist: selectedAudio.artist,
            url: selectedAudio.url,
          },
        });
      }

      // 3. Create Story with Selected Privacy
      await storyService.createStory(uploaded.fileUrl, 'IMAGE', finalCaptionPayload, privacy);

      toast.showSuccess('Đã chia sẻ tin thành công!');
      // Reset state and close
      setPhotoSrc('');
      setTextContent('');
      setSelectedAudio(null);
      handleResetPhotoEdits();
      onClose();
      window.dispatchEvent(new Event('stories_updated'));
    } catch (err: any) {
      toast.showError('Không thể tạo tin: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsPublishing(false);
    }
  };

  // Compute CSS filter and transform for preview
  const photoPreviewFilter = `${filter.id !== 'normal' ? filter.css : ''} brightness(${adjustments.brightness}%) contrast(${adjustments.contrast}%) saturate(${adjustments.saturation}%) ${adjustments.blur > 0 ? `blur(${adjustments.blur}px)` : ''}`.trim();
  const photoPreviewTransform = `translate(${crop.panX}%, ${crop.panY}%) scale(${crop.zoom}) rotate(${transform.rotate}deg) scaleX(${transform.flipH ? -1 : 1}) scaleY(${transform.flipV ? -1 : 1})`;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 overflow-y-auto"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-4xl h-[92vh] max-h-[820px] bg-white dark:bg-[#242526] rounded-2xl shadow-2xl border border-gray-200 dark:border-[#393a3b] flex flex-col overflow-hidden"
      >
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 dark:border-[#393a3b] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-blue-50 dark:bg-blue-900/40 flex items-center justify-center text-[#1877f2]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-white">Tạo tin 24h</h2>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                Tự động hết hạn sau 24 giờ • Không lưu vĩnh viễn
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Privacy Selector Dropdown */}
            <StoryPrivacySelector value={privacy} onChange={setPrivacy} />

            <button
              type="button"
              onClick={onClose}
              aria-label="Đóng"
              className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-[#3a3b3c] text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 2-Column Split Workspace */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Left Column: Controls & Editing Tools */}
          <div className="w-full md:w-[410px] p-5 flex flex-col justify-between border-r border-gray-200 dark:border-[#393a3b] overflow-y-auto">
            <div className="space-y-4">
              {/* User Bar */}
              <div className="flex items-center gap-2.5">
                <UserAvatar src={avatarUrl} alt={authorName} size="md" />
                <div className="min-w-0">
                  <p className="font-bold text-sm text-gray-900 dark:text-white truncate">
                    {authorName}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Đăng lên tin của bạn</p>
                </div>
              </div>

              {/* Story Type Selector Tabs (Photo Story vs Text Story) */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 dark:bg-[#18191a] rounded-xl">
                <button
                  type="button"
                  onClick={() => setStoryType('photo')}
                  className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition ${
                    storyType === 'photo'
                      ? 'bg-white dark:bg-[#3a3b3c] text-[#1877f2] shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <ImageIcon className="w-4 h-4" />
                  <span>Tin hình ảnh</span>
                </button>
                <button
                  type="button"
                  onClick={() => setStoryType('text')}
                  className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition ${
                    storyType === 'text'
                      ? 'bg-white dark:bg-[#3a3b3c] text-[#1877f2] shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <Type className="w-4 h-4" />
                  <span>Tin văn bản</span>
                </button>
              </div>

              {/* Audio / Music Action Card */}
              <div className="p-3 rounded-xl bg-gray-100/80 dark:bg-[#18191a] border border-gray-200 dark:border-[#393a3b] flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/40 text-[#1877f2] flex items-center justify-center shrink-0">
                    <Music className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    {selectedAudio ? (
                      <div>
                        <p className="text-xs font-bold text-gray-900 dark:text-white truncate">
                          {selectedAudio.title}
                        </p>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate">
                          {selectedAudio.artist}
                        </p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-xs font-bold text-gray-800 dark:text-gray-200">Âm nhạc cho tin</p>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400">Chọn bài hát hoặc giai điệu</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {selectedAudio ? (
                    <>
                      <button
                        type="button"
                        onClick={togglePreviewAudio}
                        className="px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-50 dark:bg-blue-900/30 text-[#1877f2] hover:bg-blue-100 dark:hover:bg-blue-900/50 transition cursor-pointer"
                      >
                        {isAudioPreviewPlaying ? 'Dừng' : 'Nghe thử'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedAudio(null);
                          if (previewAudioRef.current) previewAudioRef.current.pause();
                          setIsAudioPreviewPlaying(false);
                        }}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-gray-200 dark:hover:bg-[#3a3b3c] transition cursor-pointer"
                        title="Xóa âm nhạc"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowAudioModal(true)}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#1877f2] hover:bg-[#166fe5] text-white transition flex items-center gap-1 cursor-pointer shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Chọn nhạc</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Mode 1: Photo Story */}
              {storyType === 'photo' && (
                <div className="space-y-3.5">
                  <input
                    type="file"
                    ref={localFileInputRef}
                    onChange={handleFileChange}
                    accept="image/png,image/jpeg,image/webp,image/gif"
                    className="hidden"
                  />

                  {!photoSrc ? (
                    <button
                      type="button"
                      onClick={() => localFileInputRef.current?.click()}
                      className="w-full py-6 px-4 rounded-xl border-2 border-dashed border-gray-300 dark:border-[#4e4f50] hover:border-[#1877f2] bg-gray-50 dark:bg-[#18191a] hover:bg-blue-50/40 text-gray-700 dark:text-[#e4e6eb] font-semibold text-xs flex flex-col items-center justify-center gap-2 transition cursor-pointer"
                    >
                      <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-[#1877f2]">
                        <Upload className="w-6 h-6" />
                      </div>
                      <span className="font-bold text-sm">Chọn hình ảnh từ máy tính</span>
                      <span className="text-[11px] text-gray-500 dark:text-gray-400 font-normal">
                        Hỗ trợ định dạng JPG, PNG, WEBP
                      </span>
                    </button>
                  ) : (
                    <>
                      {/* Photo Actions bar */}
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                          Bộ công cụ chỉnh sửa & cắt ảnh
                        </span>
                        <button
                          type="button"
                          onClick={() => localFileInputRef.current?.click()}
                          className="text-xs text-blue-500 hover:underline font-semibold cursor-pointer"
                        >
                          Đổi ảnh khác
                        </button>
                      </div>

                      {/* Photo Editor: Crop, Draggable Text, Filters, Adjustments, Transform, Stickers */}
                      <StoryImageEditor
                        filter={filter}
                        onFilterChange={setFilter}
                        adjustments={adjustments}
                        onAdjustmentsChange={setAdjustments}
                        transform={transform}
                        onTransformChange={setTransform}
                        crop={crop}
                        onCropChange={setCrop}
                        onResetCrop={handleResetCrop}
                        draggableText={draggableText}
                        onDraggableTextChange={setDraggableText}
                        stickers={stickers}
                        onAddSticker={handleAddSticker}
                        onRemoveSticker={handleRemoveSticker}
                        onReset={handleResetPhotoEdits}
                      />
                    </>
                  )}
                </div>
              )}

              {/* Mode 2: Text Story */}
              {storyType === 'text' && (
                <div className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-[#e4e6eb] mb-1">
                      Nội dung văn bản
                    </label>
                    <textarea
                      rows={3}
                      value={textContent}
                      onChange={(e) => setTextContent(e.target.value)}
                      placeholder="Bắt đầu nhập nội dung tin..."
                      className="w-full p-3 text-sm bg-gray-100 dark:bg-[#3a3b3c] border border-gray-200 dark:border-[#4e4f50] text-gray-900 dark:text-[#e4e6eb] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#1877f2] resize-none"
                    />
                  </div>

                  {/* Background Presets */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-[#e4e6eb] mb-1.5">
                      Phông nền màu sắc
                    </label>
                    <div className="flex items-center gap-2 overflow-x-auto pb-1">
                      {GRADIENT_PRESETS.map((preset) => (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => setSelectedGradient(preset)}
                          title={preset.label}
                          style={{ background: preset.gradient }}
                          className={`w-7 h-7 rounded-full shrink-0 transition-transform cursor-pointer ${
                            selectedGradient.id === preset.id
                              ? 'scale-125 ring-2 ring-white ring-offset-2 ring-offset-black'
                              : 'hover:scale-110 opacity-90'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Font Style Selection */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-[#e4e6eb] mb-1.5">
                      Kiểu chữ
                    </label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {FONT_STYLES.map((style) => (
                        <button
                          key={style.id}
                          type="button"
                          onClick={() => setSelectedFont(style)}
                          className={`py-1.5 px-3 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                            selectedFont.id === style.id
                              ? 'border-[#1877f2] bg-blue-50 dark:bg-blue-900/30 text-[#1877f2]'
                              : 'border-gray-200 dark:border-[#393a3b] text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#3a3b3c]'
                          }`}
                        >
                          {style.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-gray-200 dark:border-[#393a3b] flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#3a3b3c] rounded-xl transition cursor-pointer"
              >
                Hủy bỏ
              </button>

              <button
                type="button"
                onClick={handlePublishStory}
                disabled={
                  isPublishing ||
                  (storyType === 'photo' && !photoSrc) ||
                  (storyType === 'text' && !textContent.trim())
                }
                className="px-5 py-2.5 text-xs font-bold text-white bg-[#1877f2] hover:bg-[#166fe5] disabled:opacity-50 rounded-xl shadow transition cursor-pointer flex items-center gap-1.5"
              >
                {isPublishing && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>{isPublishing ? 'Đang chia sẻ...' : 'Chia sẻ lên tin'}</span>
              </button>
            </div>
          </div>

          {/* Right Column: Live Story Canvas Preview Matching User Screenshot */}
          <div className="flex-1 bg-[#18191a] flex flex-col justify-between p-6 relative overflow-hidden select-none">
            {/* Top Header: Plain "Xem trước" as shown in user screenshot */}
            <div className="w-full flex items-center justify-between pb-1 shrink-0">
              <span className="text-sm font-semibold text-gray-200">Xem trước</span>
            </div>

            {/* Center Canvas: Clean 9:16 Frame (NO iPhone bezel/notch) */}
            <div className="flex-1 flex items-center justify-center min-h-0 py-2">
              <div
                ref={phoneCanvasRef}
                className="relative aspect-[9/16] h-full max-h-[560px] rounded-xl border border-white/30 overflow-hidden bg-black flex flex-col shadow-2xl select-none touch-none"
              >
                {/* Simulated Top User Info */}
                <div className="absolute top-4 left-3.5 right-3.5 z-30 flex items-center gap-2 pointer-events-none">
                  <UserAvatar src={avatarUrl} alt={authorName} size="sm" />
                  <div className="min-w-0">
                    <p className="text-white text-xs font-bold truncate drop-shadow">{authorName}</p>
                    <p className="text-[10px] text-white/75 drop-shadow">Vừa xong</p>
                  </div>
                </div>

              {/* Music Badge Overlay on Preview */}
              {selectedAudio && (
                <div className="absolute top-14 left-3 z-30">
                  <StoryMusicBadge
                    audio={{
                      title: selectedAudio.title,
                      artist: selectedAudio.artist,
                      url: selectedAudio.url,
                    }}
                    isPlaying={isAudioPreviewPlaying}
                    onRemove={() => {
                      setSelectedAudio(null);
                      if (previewAudioRef.current) previewAudioRef.current.pause();
                      setIsAudioPreviewPlaying(false);
                    }}
                    size="sm"
                  />
                </div>
              )}

              {/* Canvas Content */}
              <div className="flex-1 flex items-center justify-center overflow-hidden relative w-full h-full">
                {storyType === 'text' ? (
                  <div
                    style={{ background: selectedGradient.gradient }}
                    className="w-full h-full p-6 flex items-center justify-center text-center transition-all duration-300"
                  >
                    <p
                      className={`text-white text-base max-w-[220px] break-words drop-shadow-lg ${selectedFont.fontClass}`}
                    >
                      {textContent.trim() || 'Nhập nội dung tin của bạn vào khung bên trái...'}
                    </p>
                  </div>
                ) : photoSrc ? (
                  <div
                    className="w-full h-full relative overflow-hidden flex items-center justify-center cursor-grab active:cursor-grabbing"
                    onMouseDown={(e) => {
                      // Drag image to pan & choose crop section
                      setDraggingItem({
                        type: 'image',
                        startClientX: e.clientX,
                        startClientY: e.clientY,
                        initialX: crop.panX,
                        initialY: crop.panY,
                      });
                    }}
                  >
                    {/* Blurred backdrop when contain mode */}
                    {crop.fitMode === 'contain' && (
                      <img
                        src={photoSrc}
                        alt="Background blur"
                        className="absolute inset-0 w-full h-full object-cover blur-xl scale-125 opacity-60 pointer-events-none"
                      />
                    )}

                    {/* Foreground Photo with Crop & Pan Transform */}
                    <img
                      src={photoSrc}
                      alt="Xem trước tin"
                      draggable={false}
                      style={{
                        filter: photoPreviewFilter,
                        transform: photoPreviewTransform,
                      }}
                      className={`max-w-none transition-none pointer-events-none select-none ${
                        crop.fitMode === 'contain'
                          ? 'max-w-full max-h-full object-contain'
                          : 'w-full h-full object-cover'
                      }`}
                    />

                    {/* 3x3 Rule-of-Thirds Grid Overlay while dragging image to crop */}
                    {draggingItem?.type === 'image' && (
                      <div className="absolute inset-0 z-20 pointer-events-none grid grid-cols-3 grid-rows-3 transition-opacity duration-200">
                        <div className="border-r border-b border-white/35" />
                        <div className="border-r border-b border-white/35" />
                        <div className="border-b border-white/35" />
                        <div className="border-r border-b border-white/35" />
                        <div className="border-r border-b border-white/35" />
                        <div className="border-b border-white/35" />
                        <div className="border-r border-white/35" />
                        <div className="border-r border-white/35" />
                        <div />
                      </div>
                    )}

                    {/* Stickers Overlay (Interactive Draggable) */}
                    {stickers.map((s) => (
                      <div
                        key={s.id}
                        style={{
                          left: `${s.x}%`,
                          top: `${s.y}%`,
                        }}
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          setDraggingItem({
                            type: 'sticker',
                            id: s.id,
                            startClientX: e.clientX,
                            startClientY: e.clientY,
                            initialX: s.x,
                            initialY: s.y,
                          });
                        }}
                        className="absolute -translate-x-1/2 -translate-y-1/2 text-3xl drop-shadow-lg cursor-grab active:cursor-grabbing z-20 hover:scale-110 transition-transform"
                        title="Kéo để di chuyển • Bấm đúp để xóa"
                        onDoubleClick={() => handleRemoveSticker(s.id)}
                      >
                        {s.emoji}
                      </div>
                    ))}

                    {/* Draggable Text Overlay (Phần ghi chú kéo vào được) */}
                    {draggableText && draggableText.text.trim() && (
                      <div
                        style={{
                          left: `${draggableText.x}%`,
                          top: `${draggableText.y}%`,
                          backgroundColor: draggableText.bgColor,
                          color: draggableText.color,
                          fontSize: `${draggableText.fontSize}px`,
                        }}
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          setDraggingItem({
                            type: 'text',
                            startClientX: e.clientX,
                            startClientY: e.clientY,
                            initialX: draggableText.x,
                            initialY: draggableText.y,
                          });
                        }}
                        className="absolute -translate-x-1/2 -translate-y-1/2 px-3 py-1.5 rounded-full font-bold shadow-xl border border-white/25 cursor-grab active:cursor-grabbing z-30 flex items-center gap-1.5 select-none hover:ring-2 hover:ring-blue-400 group transition-all"
                        title="Kéo thả đến bất kỳ vị trí nào trên ảnh"
                      >
                        <GripHorizontal className="w-3 h-3 opacity-60 group-hover:opacity-100" />
                        <span className="drop-shadow-sm leading-tight max-w-[200px] break-words">
                          {draggableText.text}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDraggableText(null);
                          }}
                          className="opacity-0 group-hover:opacity-100 hover:text-red-400 ml-1 p-0.5 rounded-full bg-black/40 hover:bg-black/70 transition cursor-pointer"
                          title="Xóa ghi chú này"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-6 text-center text-white/50 gap-2">
                    <ImageIcon className="w-12 h-12 stroke-[1.2]" />
                    <p className="text-xs font-medium">Chưa có ảnh nào được chọn</p>
                    <p className="text-[10px] text-white/40 max-w-[180px]">
                      Tải ảnh từ máy tính để cắt xén, căn góc, kéo chữ và xem trước tại đây
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

            {/* Bottom Toolbar: Zoom slider + Rotate button directly under canvas matching user screenshot */}
            {storyType === 'photo' && photoSrc ? (
              <div className="flex items-center justify-center gap-3 pt-3 shrink-0">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleZoomMinus}
                    title="Thu nhỏ"
                    className="w-7 h-7 flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 rounded-full transition cursor-pointer select-none text-lg font-bold leading-none"
                  >
                    −
                  </button>

                  <input
                    type="range"
                    min="1"
                    max="3"
                    step="0.05"
                    value={crop.zoom}
                    onChange={handleZoomSlider}
                    style={{
                      background: `linear-gradient(to right, #1877f2 0%, #1877f2 ${
                        ((crop.zoom - 1) / 2) * 100
                      }%, #4e4f50 ${((crop.zoom - 1) / 2) * 100}%, #4e4f50 100%)`,
                    }}
                    className="w-48 sm:w-60 h-1.5 rounded-lg appearance-none cursor-pointer accent-[#1877f2]"
                  />

                  <button
                    type="button"
                    onClick={handleZoomPlus}
                    title="Phóng to"
                    className="w-7 h-7 flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 rounded-full transition cursor-pointer select-none text-lg font-bold leading-none"
                  >
                    +
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleRotateCanvas}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#3a3b3c] hover:bg-[#4e4f50] text-white text-xs font-semibold shadow-sm transition cursor-pointer select-none"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>Xoay</span>
                </button>
              </div>
            ) : (
              <div className="h-9 shrink-0" />
            )}
          </div>
        </div>
      </div>

      {/* Audio Picker Modal */}
      <StoryAudioPickerModal
        isOpen={showAudioModal}
        onClose={() => setShowAudioModal(false)}
        selectedAudio={selectedAudio}
        onSelectAudio={setSelectedAudio}
      />
    </div>
  );
};
