import React, { useState, useRef, useEffect } from 'react';
import { X, Music, Play, Pause, Upload, Check, Loader2, Search } from 'lucide-react';
import { STORY_AUDIO_PRESETS } from './storyAudioPresets';
import { StoryAudioTrack } from './types';
import { mediaService } from '../../../services/mediaService';
import { useToast } from '../../../context/ToastContext';

interface StoryAudioPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedAudio: StoryAudioTrack | null;
  onSelectAudio: (audio: StoryAudioTrack | null) => void;
}

export const StoryAudioPickerModal: React.FC<StoryAudioPickerModalProps> = ({
  isOpen,
  onClose,
  selectedAudio,
  onSelectAudio,
}) => {
  const toast = useToast();
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Stop audio on close
  useEffect(() => {
    if (!isOpen && audioRef.current) {
      audioRef.current.pause();
      setPlayingId(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTogglePlay = (track: StoryAudioTrack) => {
    if (playingId === track.id) {
      audioRef.current?.pause();
      setPlayingId(null);
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      const audio = new Audio(track.url);
      audioRef.current = audio;
      audio.play().then(() => {
        setPlayingId(track.id);
      }).catch((e) => {
        console.error('Audio play error:', e);
        setPlayingId(null);
      });
      audio.onended = () => setPlayingId(null);
    }
  };

  const handleCustomAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('audio/')) {
      toast.showError('Vui lòng chọn định dạng tệp âm thanh (MP3, WAV, M4A, etc.)');
      return;
    }

    setIsUploading(true);
    toast.showInfo('Đang tải tệp âm thanh lên...');
    try {
      const uploaded = await mediaService.uploadMedia(file, 'story-audio');
      const customTrack: StoryAudioTrack = {
        id: 'custom-' + Date.now(),
        title: file.name.replace(/\.[^/.]+$/, ''),
        artist: 'Tệp tải lên của bạn',
        url: uploaded.fileUrl,
      };
      onSelectAudio(customTrack);
      toast.showSuccess('Đã thêm âm thanh thành công!');
      onClose();
    } catch (err: any) {
      toast.showError('Tải tệp âm thanh thất bại: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsUploading(false);
    }
  };

  const filteredTracks = STORY_AUDIO_PRESETS.filter(
    (t) =>
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.artist.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/75 backdrop-blur-sm p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-white dark:bg-[#242526] rounded-2xl shadow-2xl border border-gray-200 dark:border-[#393a3b] overflow-hidden flex flex-col max-h-[85vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-200 dark:border-[#393a3b]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-pink-100 dark:bg-pink-900/40 flex items-center justify-center text-pink-500">
              <Music className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">Thêm âm nhạc vào tin</h3>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">Chọn bài hát hoặc tải nhạc từ máy</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-[#3a3b3c] dark:text-gray-400 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Upload section */}
        <div className="p-4 border-b border-gray-100 dark:border-[#393a3b] space-y-2.5">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm bài hát, nghệ sĩ..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-gray-100 dark:bg-[#3a3b3c] border border-transparent focus:border-pink-500 rounded-xl text-gray-900 dark:text-white focus:outline-none"
            />
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleCustomAudioUpload}
            accept="audio/*"
            className="hidden"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="w-full py-2 px-3 rounded-xl border border-dashed border-gray-300 dark:border-[#4e4f50] hover:border-pink-500 bg-pink-50/40 dark:bg-pink-950/20 text-pink-600 dark:text-pink-400 text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
          >
            {isUploading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
            <span>{isUploading ? 'Đang tải âm thanh lên...' : 'Tải nhạc từ máy của bạn (.mp3, .wav)'}</span>
          </button>
        </div>

        {/* Tracks List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1.5 divide-y divide-gray-100 dark:divide-[#393a3b]">
          {filteredTracks.map((track) => {
            const isSelected = selectedAudio?.id === track.id;
            const isPlaying = playingId === track.id;

            return (
              <div
                key={track.id}
                onClick={() => {
                  onSelectAudio(track);
                  onClose();
                }}
                className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition ${
                  isSelected
                    ? 'bg-pink-50 dark:bg-pink-900/30 border border-pink-300 dark:border-pink-700'
                    : 'hover:bg-gray-100 dark:hover:bg-[#3a3b3c]'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  {/* Play Preview Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTogglePlay(track);
                    }}
                    className={`w-9 h-9 rounded-full flex items-center justify-center transition shrink-0 ${
                      isPlaying
                        ? 'bg-pink-500 text-white'
                        : 'bg-gray-200 dark:bg-[#3a3b3c] text-gray-700 dark:text-gray-200 hover:bg-pink-500 hover:text-white'
                    }`}
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                  </button>

                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-gray-900 dark:text-white truncate">
                      {track.title}
                    </p>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
                      {track.artist}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {isSelected && (
                    <div className="w-6 h-6 rounded-full bg-pink-500 text-white flex items-center justify-center">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        {selectedAudio && (
          <div className="p-3 border-t border-gray-200 dark:border-[#393a3b] bg-gray-50 dark:bg-[#18191a] flex items-center justify-between">
            <span className="text-xs text-gray-600 dark:text-gray-400 truncate max-w-[220px]">
              Đang chọn: <strong className="text-pink-500">{selectedAudio.title}</strong>
            </span>
            <button
              type="button"
              onClick={() => {
                onSelectAudio(null);
                if (audioRef.current) audioRef.current.pause();
                setPlayingId(null);
              }}
              className="text-xs font-semibold text-red-500 hover:underline"
            >
              Gỡ bỏ âm thanh
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
