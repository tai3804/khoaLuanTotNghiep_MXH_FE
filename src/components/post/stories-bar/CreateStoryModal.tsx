import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, Image as ImageIcon, Loader2, Music, Pause, Play, Settings, Trash2, X } from 'lucide-react';
import { UserAvatar } from '../../common/UserAvatar';
import { ConfirmModal } from '../../common/ConfirmModal';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { useSystemConfig } from '../../../context/SystemConfigContext';
import { mediaService } from '../../../services/mediaService';
import { storyService } from '../../../services/storyService';
import { StoryAudioTrack, StoryPrivacy } from './types';
import { StoryAudioPickerModal } from './StoryAudioPickerModal';
import { StoryMusicBadge } from './StoryMusicBadge';
import { StoryPreview } from './StoryPreview';
import { PRIVACY_OPTIONS, StoryPrivacyDialog } from './StoryPrivacyDialog';
import {
  backgroundCss,
  exportStory,
  makeBackdrop,
  PhotoState,
  STORY_BACKGROUNDS,
  STORY_FONTS,
  StoryScene,
  StoryTextLayer,
  TEXT_COLORS,
} from './storyCanvas';

interface CreateStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Mode = 'select' | 'photo' | 'text';

const TEXT_LIMIT = 250;

/** Màn hình tạo tin theo bố cục Facebook: thanh "Tin của bạn" bên trái, chọn loại tin rồi xem trước 9:16 bên phải. */
export const CreateStoryModal: React.FC<CreateStoryModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const toast = useToast();
  const { maxUploadSizeMb } = useSystemConfig();

  const [mode, setMode] = useState<Mode>('select');
  const [privacy, setPrivacy] = useState<StoryPrivacy>('PUBLIC');
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [confirm, setConfirm] = useState<null | 'close' | 'discard'>(null);
  const [publishing, setPublishing] = useState(false);

  // Tin văn bản
  const [text, setText] = useState('');
  const [fontId, setFontId] = useState(STORY_FONTS[0].id);
  const [background, setBackground] = useState(STORY_BACKGROUNDS[0]);

  // Tin ảnh
  const [photo, setPhoto] = useState<PhotoState | null>(null);
  const [overlay, setOverlay] = useState<StoryTextLayer | null>(null);
  const photoUrlRef = useRef<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Nhạc
  const [audio, setAudio] = useState<StoryAudioTrack | null>(null);
  const [showAudioPicker, setShowAudioPicker] = useState(false);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const stopAudio = () => {
    audioRef.current?.pause();
    setAudioPlaying(false);
  };

  const releasePhotoUrl = () => {
    if (photoUrlRef.current) URL.revokeObjectURL(photoUrlRef.current);
    photoUrlRef.current = null;
  };

  const resetAll = () => {
    stopAudio();
    releasePhotoUrl();
    setMode('select');
    setText('');
    setFontId(STORY_FONTS[0].id);
    setBackground(STORY_BACKGROUNDS[0]);
    setPhoto(null);
    setOverlay(null);
    setAudio(null);
  };

  const requestClose = () => {
    if (publishing) return;
    if (mode === 'select') {
      resetAll();
      onClose();
    } else {
      setConfirm('close');
    }
  };

  // Khoá cuộn trang phía sau và cho phép Esc để thoát
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !showPrivacy && !showAudioPicker && !confirm) requestClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  useEffect(() => () => {
    audioRef.current?.pause();
    if (photoUrlRef.current) URL.revokeObjectURL(photoUrlRef.current);
  }, []);

  const scene: StoryScene | null = useMemo(() => {
    if (mode === 'text') return { kind: 'text', text, fontId, background };
    if (mode === 'photo' && photo) return { kind: 'photo', photo, overlay };
    return null;
  }, [mode, text, fontId, background, photo, overlay]);

  if (!isOpen) return null;

  const authorName = user?.fullName || user?.username || 'Người dùng';
  const privacyLabel = PRIVACY_OPTIONS.find((o) => o.id === privacy)?.label;

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.showError('Tin chỉ hỗ trợ hình ảnh (JPG, PNG, WEBP, GIF).');
      return;
    }
    const limitMb = maxUploadSizeMb || 25;
    if (file.size > limitMb * 1024 * 1024) {
      toast.showError(`Ảnh vượt quá giới hạn ${limitMb}MB.`);
      return;
    }
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      releasePhotoUrl();
      photoUrlRef.current = url;
      setPhoto({ image, backdrop: makeBackdrop(image), zoom: 1, panX: 0, panY: 0, rotate: 0 });
      setOverlay(null);
      setMode('photo');
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      toast.showError('Không đọc được ảnh này, vui lòng chọn ảnh khác.');
    };
    image.src = url;
  };

  const toggleAudioPreview = () => {
    if (!audio) return;
    if (audioPlaying) {
      stopAudio();
      return;
    }
    if (!audioRef.current) audioRef.current = new Audio();
    audioRef.current.src = audio.url;
    audioRef.current.onended = () => setAudioPlaying(false);
    audioRef.current.play().then(() => setAudioPlaying(true)).catch(() => setAudioPlaying(false));
  };

  const canShare = !publishing && (mode === 'photo' ? !!photo : text.trim().length > 0);

  const handleShare = async () => {
    if (!scene || !canShare) return;
    setPublishing(true);
    try {
      const file = await exportStory(scene);
      if (!file) throw new Error('Không thể xử lý ảnh tin');
      const uploaded = await mediaService.uploadMedia(file, 'stories');
      // Chữ đã vẽ vào ảnh nên không gửi lại làm chú thích (trang xem tin sẽ hiện trùng); chỉ gửi kèm thông tin nhạc
      const caption = audio
        ? JSON.stringify({ text: '', audio: { title: audio.title, artist: audio.artist, url: audio.url } })
        : undefined;
      await storyService.createStory(uploaded.fileUrl, 'IMAGE', caption, privacy);
      toast.showSuccess('Đã chia sẻ lên tin của bạn.');
      resetAll();
      onClose();
      window.dispatchEvent(new Event('stories_updated'));
    } catch (err: any) {
      toast.showError('Không thể chia sẻ tin: ' + (err.response?.data?.message || err.message));
    } finally {
      setPublishing(false);
    }
  };

  const fontSelect = (value: string, onChange: (id: string) => void) => (
    <div className="relative">
      <span className="absolute left-3 top-1.5 text-xs text-gray-500 dark:text-[#b0b3b8] pointer-events-none">Phông chữ</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none pt-5 pb-2 pl-3 pr-9 rounded-lg border border-gray-300 dark:border-[#4e4f50] bg-white dark:bg-[#3a3b3c] text-[15px] text-gray-900 dark:text-[#e4e6eb] focus:outline-none focus:border-[#1877f2] cursor-pointer"
      >
        {STORY_FONTS.map((f) => (
          <option key={f.id} value={f.id}>
            Aa {f.label}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
    </div>
  );

  const textArea = (value: string, onChange: (v: string) => void, autoFocus = false) => (
    <div className="rounded-lg border border-gray-300 dark:border-[#4e4f50] focus-within:border-[#1877f2] bg-white dark:bg-[#3a3b3c]">
      <textarea
        rows={7}
        autoFocus={autoFocus}
        value={value}
        maxLength={TEXT_LIMIT}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Bắt đầu nhập"
        className="w-full resize-none bg-transparent px-3 pt-3 text-[15px] text-gray-900 dark:text-[#e4e6eb] placeholder:text-gray-500 focus:outline-none"
      />
      <p className="px-3 pb-2 text-right text-xs text-gray-400">
        {value.length}/{TEXT_LIMIT}
      </p>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[55] flex flex-col md:flex-row bg-[#f0f2f5] dark:bg-[#18191a]">
      {/* Thanh bên "Tin của bạn" */}
      <aside className="order-2 md:order-1 w-full md:w-[360px] shrink-0 max-h-[48vh] md:max-h-none flex flex-col bg-white dark:bg-[#242526] shadow-[2px_0_4px_rgba(0,0,0,0.08)] border-t md:border-t-0 md:border-r border-gray-200 dark:border-[#393a3b]">
        <div className="flex items-center gap-2 px-4 pt-3">
          <button
            type="button"
            onClick={requestClose}
            aria-label="Đóng"
            className="w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 dark:bg-[#3a3b3c] dark:hover:bg-[#4e4f50] flex items-center justify-center text-gray-700 dark:text-[#e4e6eb] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center justify-between px-4 pt-3 pb-2">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-[#e4e6eb]">Tin của bạn</h1>
          <button
            type="button"
            onClick={() => setShowPrivacy(true)}
            aria-label="Quyền riêng tư của tin"
            title={`Quyền riêng tư: ${privacyLabel}`}
            className="w-9 h-9 rounded-full bg-gray-200 hover:bg-gray-300 dark:bg-[#3a3b3c] dark:hover:bg-[#4e4f50] flex items-center justify-center text-gray-700 dark:text-[#e4e6eb] cursor-pointer"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center gap-3 px-4 pb-4 border-b border-gray-200 dark:border-[#393a3b]">
          <UserAvatar src={user?.avatar} alt={authorName} size="lg" />
          <div className="min-w-0">
            <p className="text-[17px] font-semibold text-gray-900 dark:text-[#e4e6eb] truncate">{authorName}</p>
            <p className="text-[13px] text-gray-500 dark:text-[#b0b3b8]">{privacyLabel}</p>
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4 space-y-3">
          {mode === 'text' && (
            <>
              {textArea(text, setText, true)}
              {fontSelect(fontId, setFontId)}
              <div className="rounded-lg border border-gray-300 dark:border-[#4e4f50] p-3">
                <p className="text-[15px] font-semibold text-gray-900 dark:text-[#e4e6eb] mb-3">Phông nền</p>
                <div className="grid grid-cols-8 gap-2">
                  {STORY_BACKGROUNDS.map((bg) => (
                    <button
                      key={bg.id}
                      type="button"
                      onClick={() => setBackground(bg)}
                      aria-label={`Phông nền ${bg.id}`}
                      style={{ background: backgroundCss(bg) }}
                      className={`w-7 h-7 rounded-full border border-black/10 cursor-pointer transition ${
                        background.id === bg.id ? 'ring-2 ring-[#1877f2] ring-offset-2 ring-offset-white dark:ring-offset-[#242526]' : 'hover:scale-110'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </>
          )}

          {mode === 'photo' &&
            (overlay ? (
              <>
                {textArea(overlay.text, (v) => setOverlay({ ...overlay, text: v }), true)}
                {fontSelect(overlay.fontId, (id) => setOverlay({ ...overlay, fontId: id }))}
                <div className="rounded-lg border border-gray-300 dark:border-[#4e4f50] p-3">
                  <p className="text-[15px] font-semibold text-gray-900 dark:text-[#e4e6eb] mb-3">Màu chữ</p>
                  <div className="flex flex-wrap gap-2">
                    {TEXT_COLORS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setOverlay({ ...overlay, color: c })}
                        aria-label={`Màu chữ ${c}`}
                        style={{ background: c }}
                        className={`w-7 h-7 rounded-full border border-black/15 cursor-pointer ${
                          overlay.color === c ? 'ring-2 ring-[#1877f2] ring-offset-2 ring-offset-white dark:ring-offset-[#242526]' : ''
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setOverlay(null)}
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-[15px] font-semibold text-gray-700 dark:text-[#e4e6eb] hover:bg-gray-100 dark:hover:bg-[#3a3b3c] cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  Xoá văn bản
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setOverlay({ text: '', x: 0.5, y: 0.5, fontId: STORY_FONTS[0].id, color: '#ffffff' })}
                className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#3a3b3c] cursor-pointer"
              >
                <span className="w-9 h-9 rounded-full bg-gray-200 dark:bg-[#3a3b3c] flex items-center justify-center text-sm font-bold text-gray-900 dark:text-[#e4e6eb]">
                  Aa
                </span>
                <span className="text-[15px] font-semibold text-gray-900 dark:text-[#e4e6eb]">Thêm văn bản</span>
              </button>
            ))}

          {mode !== 'select' &&
            (audio ? (
              <div className="flex items-center gap-3 p-2 rounded-lg bg-gray-100 dark:bg-[#3a3b3c]">
                <span className="w-9 h-9 rounded-full bg-white dark:bg-[#4e4f50] flex items-center justify-center text-[#1877f2] shrink-0">
                  <Music className="w-4 h-4" />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-[#e4e6eb] truncate">{audio.title}</p>
                  <p className="text-xs text-gray-500 dark:text-[#b0b3b8] truncate">{audio.artist}</p>
                </div>
                <button
                  type="button"
                  onClick={toggleAudioPreview}
                  aria-label={audioPlaying ? 'Dừng nghe thử' : 'Nghe thử'}
                  className="w-8 h-8 rounded-full hover:bg-gray-200 dark:hover:bg-[#4e4f50] flex items-center justify-center text-gray-700 dark:text-[#e4e6eb] cursor-pointer"
                >
                  {audioPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    stopAudio();
                    setAudio(null);
                  }}
                  aria-label="Bỏ nhạc"
                  className="w-8 h-8 rounded-full hover:bg-gray-200 dark:hover:bg-[#4e4f50] flex items-center justify-center text-gray-700 dark:text-[#e4e6eb] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowAudioPicker(true)}
                className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#3a3b3c] cursor-pointer"
              >
                <span className="w-9 h-9 rounded-full bg-gray-200 dark:bg-[#3a3b3c] flex items-center justify-center text-gray-900 dark:text-[#e4e6eb]">
                  <Music className="w-4 h-4" />
                </span>
                <span className="text-[15px] font-semibold text-gray-900 dark:text-[#e4e6eb]">Thêm nhạc</span>
              </button>
            ))}

          {mode === 'photo' && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#3a3b3c] cursor-pointer"
            >
              <span className="w-9 h-9 rounded-full bg-gray-200 dark:bg-[#3a3b3c] flex items-center justify-center text-gray-900 dark:text-[#e4e6eb]">
                <ImageIcon className="w-4 h-4" />
              </span>
              <span className="text-[15px] font-semibold text-gray-900 dark:text-[#e4e6eb]">Đổi ảnh khác</span>
            </button>
          )}
        </div>

        {mode !== 'select' && (
          <div className="flex gap-2 p-4 border-t border-gray-200 dark:border-[#393a3b] shadow-[0_-2px_4px_rgba(0,0,0,0.04)]">
            <button
              type="button"
              onClick={() => setConfirm('discard')}
              disabled={publishing}
              className="flex-1 py-2 rounded-md text-[15px] font-semibold bg-gray-200 hover:bg-gray-300 dark:bg-[#3a3b3c] dark:hover:bg-[#4e4f50] text-gray-900 dark:text-[#e4e6eb] disabled:opacity-50 cursor-pointer"
            >
              Bỏ
            </button>
            <button
              type="button"
              onClick={handleShare}
              disabled={!canShare}
              className="flex-[2] py-2 rounded-md text-[15px] font-semibold bg-[#1877f2] hover:bg-[#166fe5] text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
            >
              {publishing && <Loader2 className="w-4 h-4 animate-spin" />}
              {publishing ? 'Đang chia sẻ...' : 'Chia sẻ lên tin'}
            </button>
          </div>
        )}
      </aside>

      {/* Vùng chính: chọn loại tin, sau đó là khung xem trước */}
      <main className="order-1 md:order-2 flex-1 min-h-0 flex p-4 md:p-6">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          onChange={handleFile}
          className="hidden"
        />

        {mode === 'select' || !scene ? (
          <div className="flex-1 flex items-center justify-center gap-4 md:gap-5">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="group w-40 h-60 md:w-[220px] md:h-[330px] rounded-xl shadow-md overflow-hidden flex flex-col items-center justify-center gap-3 bg-[linear-gradient(to_bottom_right,#6b8cff,#9b5cf6)] hover:brightness-95 transition cursor-pointer"
            >
              <span className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-md text-gray-900 group-hover:scale-105 transition">
                <ImageIcon className="w-5 h-5" />
              </span>
              <span className="text-[15px] font-semibold text-white">Tạo tin dạng ảnh</span>
            </button>
            <button
              type="button"
              onClick={() => setMode('text')}
              className="group w-40 h-60 md:w-[220px] md:h-[330px] rounded-xl shadow-md overflow-hidden flex flex-col items-center justify-center gap-3 bg-[linear-gradient(to_bottom_right,#f06292,#b44ccf)] hover:brightness-95 transition cursor-pointer"
            >
              <span className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-md text-gray-900 text-base font-bold group-hover:scale-105 transition">
                Aa
              </span>
              <span className="text-[15px] font-semibold text-white">Tạo tin dạng văn bản</span>
            </button>
          </div>
        ) : (
          <StoryPreview
            scene={scene}
            onPhotoChange={(patch) => setPhoto((p) => (p ? { ...p, ...patch } : p))}
            onOverlayMove={(pos) => setOverlay((o) => (o ? { ...o, ...pos } : o))}
          >
            {audio && (
              <div className="absolute top-3 left-3 pointer-events-none">
                <StoryMusicBadge audio={{ title: audio.title, artist: audio.artist, url: audio.url }} isPlaying={audioPlaying} size="sm" />
              </div>
            )}
          </StoryPreview>
        )}
      </main>

      <StoryPrivacyDialog isOpen={showPrivacy} value={privacy} onSave={setPrivacy} onClose={() => setShowPrivacy(false)} />

      <StoryAudioPickerModal
        isOpen={showAudioPicker}
        onClose={() => setShowAudioPicker(false)}
        selectedAudio={audio}
        onSelectAudio={(track) => {
          stopAudio();
          setAudio(track);
        }}
      />

      <ConfirmModal
        isOpen={confirm !== null}
        title="Bỏ tin?"
        message="Bạn có chắc chắn muốn bỏ tin này không? Hệ thống sẽ không lưu tin của bạn."
        cancelText="Tiếp tục chỉnh sửa"
        confirmText="Bỏ"
        onClose={() => setConfirm(null)}
        onConfirm={() => {
          const closing = confirm === 'close';
          setConfirm(null);
          resetAll();
          if (closing) onClose();
        }}
      />
    </div>
  );
};
