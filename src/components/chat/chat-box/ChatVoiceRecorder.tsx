import React, { useState, useRef, useEffect } from 'react';
import { Send, Trash2, Loader2 } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';

export interface ChatVoiceRecorderProps {
  uploading: boolean;
  onSendVoice: (audioBlob: Blob) => void;
  onCancel: () => void;
}

export const ChatVoiceRecorder: React.FC<ChatVoiceRecorderProps> = ({
  uploading,
  onSendVoice,
  onCancel,
}) => {
  const { language } = useLanguage();
  const isEn = language === 'en';

  const [recordSeconds, setRecordSeconds] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<any>(null);

  const stopRecordingResources = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    mediaRecorderRef.current = null;
    audioChunksRef.current = [];
    setRecordSeconds(0);
  };

  useEffect(() => {
    let mounted = true;

    const startRecording = async () => {
      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          alert(isEn ? 'Microphone is not supported in this browser' : 'Trình duyệt không hỗ trợ ghi âm microphone');
          onCancel();
          return;
        }

        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        if (!mounted) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        streamRef.current = stream;
        audioChunksRef.current = [];

        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;

        mediaRecorder.ondataavailable = (event) => {
          if (event.data && event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.start(200);
        setRecordSeconds(0);

        timerRef.current = setInterval(() => {
          setRecordSeconds((prev) => prev + 1);
        }, 1000);
      } catch (err: any) {
        console.error('[Voice] Failed to access mic:', err);
        alert(
          isEn
            ? 'Cannot access microphone. Please allow microphone permission.'
            : 'Không thể truy cập microphone. Vui lòng cấp quyền micro.'
        );
        stopRecordingResources();
        onCancel();
      }
    };

    startRecording();

    return () => {
      mounted = false;
      stopRecordingResources();
    };
  }, []);

  const handleCancel = () => {
    stopRecordingResources();
    onCancel();
  };

  const finishAndSend = () => {
    const recorder = mediaRecorderRef.current;
    if (!recorder) return;

    recorder.onstop = () => {
      const mimeType = recorder.mimeType || 'audio/webm';
      const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
      if (audioBlob.size > 0) {
        onSendVoice(audioBlob);
      }
      stopRecordingResources();
      onCancel();
    };

    if (recorder.state !== 'inactive') {
      recorder.stop();
    } else {
      stopRecordingResources();
      onCancel();
    }
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="p-2 bg-red-50 dark:bg-red-950/30 border-t border-red-200 dark:border-red-900/50 flex items-center justify-between animate-fadeIn">
      <div className="flex items-center space-x-2">
        <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
        <span className="text-xs font-semibold text-red-600 dark:text-red-400">
          {formatSeconds(recordSeconds)}
        </span>
        <span className="text-[11px] text-gray-500 dark:text-gray-400 hidden xs:inline">
          {isEn ? 'Recording...' : 'Đang thu âm...'}
        </span>
      </div>

      <div className="flex items-center space-x-2">
        <button
          type="button"
          onClick={handleCancel}
          className="p-1.5 text-gray-500 hover:text-red-500 hover:bg-white dark:hover:bg-[#3a3b3c] rounded-full transition cursor-pointer"
          title={isEn ? 'Cancel recording' : 'Hủy thu âm'}
        >
          <Trash2 className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={finishAndSend}
          disabled={uploading}
          className="flex items-center space-x-1 px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded-full shadow-xs transition cursor-pointer disabled:opacity-50"
          title={isEn ? 'Send voice message' : 'Gửi tin nhắn thoại'}
        >
          {uploading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <>
              <Send className="w-3.5 h-3.5" />
              <span>{isEn ? 'Send' : 'Gửi'}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
