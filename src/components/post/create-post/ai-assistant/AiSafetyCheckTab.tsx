import React from 'react';
import { ShieldCheck, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { UseCreatePostAiReturn } from './types';

type AiSafetyCheckTabProps = Pick<
  UseCreatePostAiReturn,
  'checkResult' | 'isChecking' | 'handleCheck'
> & {
  hasContent: boolean;
};

export const AiSafetyCheckTab: React.FC<AiSafetyCheckTabProps> = ({
  checkResult,
  isChecking,
  handleCheck,
  hasContent,
}) => {
  return (
    <div className="space-y-3">
      <div className="p-3 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40 rounded-lg text-xs text-blue-800 dark:text-blue-300 space-y-1">
        <p className="font-semibold flex items-center space-x-1">
          <Info className="w-3.5 h-3.5" />
          <span>Kiểm tra chuẩn mực cộng đồng tự động:</span>
        </p>
        <p className="text-[11px] text-gray-600 dark:text-gray-400 leading-normal">
          AI sẽ phân tích toàn diện xem bài viết của bạn có vô tình chứa từ ngữ xúc phạm, quấy rối, thù ghét hoặc nội dung không phù hợp trước khi đăng tải.
        </p>
      </div>

      <button
        type="button"
        disabled={isChecking || !hasContent}
        onClick={handleCheck}
        className="w-full py-2 bg-gradient-to-r from-blue-700 to-cyan-600 hover:from-blue-800 hover:to-cyan-700 text-white rounded-lg text-xs font-bold flex items-center justify-center space-x-1.5 shadow-sm transition disabled:opacity-60 cursor-pointer"
      >
        <ShieldCheck className="w-3.5 h-3.5" />
        <span>{isChecking ? 'AI đang thẩm định an toàn...' : 'Kiểm tra mức độ an toàn bài viết'}</span>
      </button>

      {checkResult && (
        <div
          className={`p-3 rounded-lg border text-xs space-y-2 ${
            checkResult.isToxic
              ? 'bg-amber-50 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200'
              : 'bg-green-50 dark:bg-green-950/20 border-green-300 dark:border-green-800 text-green-900 dark:text-green-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-bold flex items-center space-x-1.5">
              {checkResult.isToxic ? (
                <>
                  <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span>Cảnh báo: Nội dung có thể vi phạm chuẩn mực</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                  <span>Nội dung an toàn, văn minh & tích cực!</span>
                </>
              )}
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-white dark:bg-[#2b2d2f] border shadow-xs">
              Mức độ: {checkResult.severity || 'LOW'}
            </span>
          </div>

          <p className="text-[11px] leading-relaxed">
            {checkResult.reason ||
              (checkResult.isToxic
                ? 'Nội dung có thể chứa từ ngữ nhạy cảm hoặc mang tính công kích.'
                : 'Bài viết không phát hiện vi phạm và sẵn sàng đăng tải.')}
          </p>

          {checkResult.extractedKeywords && checkResult.extractedKeywords.length > 0 && (
            <div className="pt-1 flex flex-wrap gap-1 items-center">
              <span className="text-[10px] text-gray-500 dark:text-gray-400">Từ ngữ cần chú ý:</span>
              {checkResult.extractedKeywords.map((kw, i) => (
                <span
                  key={i}
                  className="px-1.5 py-0.5 bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 rounded text-[10px] font-mono"
                >
                  {kw}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
