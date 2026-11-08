import React, { useState, useRef } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  Activity, 
  Play, 
  Square, 
  Trash2, 
  Lock, 
  Sparkles, 
  FileText, 
  Radio, 
  Clock, 
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ExternalLink,
  ChevronDown,
  Info
} from 'lucide-react';

interface RequestLog {
  id: number;
  time: string;
  category: 'auth' | 'ai' | 'mutation' | 'websocket' | 'general';
  endpoint: string;
  method: string;
  status: number;
  statusText: string;
  durationMs: number;
  limit?: string | null;
  remaining?: string | null;
  retryAfter?: string | null;
  responseBody?: string;
  isRateLimited: boolean;
}

export const RateLimitTestPage: React.FC = () => {
  const [logs, setLogs] = useState<RequestLog[]>([]);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'all' | '429' | 'success'>('all');
  const [concurrencyMode, setConcurrencyMode] = useState<'sequential' | 'parallel'>('sequential');
  const [customCount, setCustomCount] = useState<number>(25);
  const stopSignalRef = useRef<boolean>(false);

  // Stats
  const totalSent = logs.length;
  const rateLimitedCount = logs.filter(l => l.isRateLimited).length;
  const normalCount = totalSent - rateLimitedCount;

  const apiGatewayBaseUrl = import.meta.env.VITE_API_BASE_URL 
    ? import.meta.env.VITE_API_BASE_URL.replace(/\/api\/v1\/?$/, '') 
    : 'http://localhost:8080';

  const clearLogs = () => {
    setLogs([]);
  };

  const stopTesting = () => {
    stopSignalRef.current = true;
    setIsRunning(false);
  };

  const executeRequests = async (
    category: 'auth' | 'ai' | 'mutation' | 'websocket' | 'general',
    endpoint: string,
    method: 'GET' | 'POST',
    bodyGenerator: () => any,
    count: number
  ) => {
    setIsRunning(true);
    stopSignalRef.current = false;

    const fullUrl = `${apiGatewayBaseUrl}${endpoint}`;

    const sendSingle = async (index: number): Promise<RequestLog> => {
      const startTime = performance.now();
      const timeStr = new Date().toLocaleTimeString('vi-VN', { hour12: false }) + '.' + String(new Date().getMilliseconds()).padStart(3, '0');

      try {
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        };

        const res = await fetch(fullUrl, {
          method,
          headers,
          body: method === 'POST' ? JSON.stringify(bodyGenerator()) : undefined,
        });

        const durationMs = Math.round(performance.now() - startTime);
        let resText = '';
        try {
          resText = await res.text();
        } catch {
          resText = '';
        }

        const is429 = res.status === 429;
        const limit = res.headers.get('X-RateLimit-Limit');
        const remaining = res.headers.get('X-RateLimit-Remaining');
        const retryAfter = res.headers.get('Retry-After');

        return {
          id: Date.now() + index,
          time: timeStr,
          category,
          endpoint,
          method,
          status: res.status,
          statusText: is429 ? '429 TOO MANY REQUESTS' : `${res.status} ${res.statusText || 'OK'}`,
          durationMs,
          limit,
          remaining,
          retryAfter,
          responseBody: resText,
          isRateLimited: is429,
        };
      } catch (err: any) {
        const durationMs = Math.round(performance.now() - startTime);
        return {
          id: Date.now() + index,
          time: timeStr,
          category,
          endpoint,
          method,
          status: 0,
          statusText: 'Network / Connection Error',
          durationMs,
          responseBody: err.message || 'Lỗi kết nối tới Gateway',
          isRateLimited: false,
        };
      }
    };

    if (concurrencyMode === 'parallel') {
      const promises = Array.from({ length: count }, (_, i) => sendSingle(i + 1));
      const results = await Promise.all(promises);
      setLogs(prev => [...results, ...prev]);
    } else {
      for (let i = 1; i <= count; i++) {
        if (stopSignalRef.current) break;
        const log = await sendSingle(i);
        setLogs(prev => [log, ...prev]);
        // Giãn cách 30ms giữa các request để dễ quan sát trên bảng Network
        await new Promise(r => setTimeout(r, 30));
      }
    }

    setIsRunning(false);
  };

  const handleTestAuth = (count = 25) => {
    executeRequests(
      'auth',
      '/api/v1/auth/login',
      'POST',
      () => ({ email: `test_${Date.now()}@example.com`, password: 'WrongPassword123!' }),
      count
    );
  };

  const handleTestAi = (count = 35) => {
    executeRequests(
      'ai',
      '/api/v1/ai/chat',
      'POST',
      () => ({ prompt: 'Xin chào AI, hãy kiểm tra rate limit', conversationId: 'test-session' }),
      count
    );
  };

  const handleTestMutation = (count = 65) => {
    executeRequests(
      'mutation',
      '/api/v1/posts',
      'POST',
      () => ({ content: 'Nội dung bài viết kiểm thử rate limit', privacy: 'PUBLIC' }),
      count
    );
  };

  const handleTestWebSocket = (count = 25) => {
    executeRequests(
      'websocket',
      '/ws-chat/info',
      'GET',
      () => null,
      count
    );
  };

  const filteredLogs = logs.filter(log => {
    if (activeTab === '429') return log.isRateLimited;
    if (activeTab === 'success') return !log.isRateLimited;
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 font-sans">
      {/* Header */}
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-600/20 text-blue-400 rounded-xl border border-blue-500/30">
                <ShieldAlert className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white flex items-center gap-2">
                  Trung Tâm Kiểm Thử Rate Limiting
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    Live Demo
                  </span>
                </h1>
                <p className="text-sm text-slate-400 mt-1">
                  Mô phỏng lưu lượng truy cập qua <strong className="text-slate-200">API Gateway ({apiGatewayBaseUrl})</strong> để kiểm chứng cơ chế chặn <strong className="text-rose-400">HTTP 429 Too Many Requests</strong> theo thời gian thực.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-medium text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Gateway: <code className="text-blue-400 font-mono">{apiGatewayBaseUrl}</code>
            </span>
          </div>
        </div>

        {/* Instructor Presentation Banner */}
        <div className="bg-gradient-to-r from-blue-950/60 to-indigo-950/60 border border-blue-800/40 rounded-2xl p-5 shadow-xl">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-blue-500/20 text-blue-400 rounded-lg shrink-0 mt-0.5">
              <Info className="w-5 h-5" />
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-white text-base flex items-center gap-2">
                Hướng dẫn trình diễn cho Giảng viên / Hội đồng chấm khóa luận
              </h3>
              <ol className="text-sm text-slate-300 space-y-1 list-decimal list-inside leading-relaxed">
                <li>
                  Nhấn phím <kbd className="px-2 py-0.5 bg-slate-800 border border-slate-700 rounded text-amber-300 text-xs font-mono">F12</kbd> trên bàn phím trình duyệt → Chọn tab <strong>Network</strong> → Nhập bộ lọc <code>Fetch/XHR</code>.
                </li>
                <li>
                  Bấm nút <strong>"Test Auth (25 requests)"</strong> ở thẻ màu xanh bên dưới.
                </li>
                <li>
                  <strong>Quan sát kết quả:</strong> 20 request đầu tiên xử lý bình thường (HTTP 200/400). Đến request thứ 21 trở đi, API Gateway <span className="text-rose-400 font-bold">chặn ngay lập tức với HTTP 429 Too Many Requests</span> (hiện đỏ rực trên tab Network).
                </li>
                <li>
                  Bấm vào request 429 trên tab Network, xem phần <strong>Response Headers</strong> để thấy các header chuẩn IETF: <code className="text-emerald-400">Retry-After: 30</code>, <code className="text-emerald-400">X-RateLimit-Limit: 20</code>, <code className="text-emerald-400">X-RateLimit-Remaining: 0</code>.
                </li>
              </ol>
            </div>
          </div>
        </div>

        {/* Stats Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
            <span className="text-xs text-slate-400 font-medium">Tổng yêu cầu đã gửi</span>
            <div className="text-2xl md:text-3xl font-bold text-white mt-1 flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-400" />
              {totalSent}
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
            <span className="text-xs text-slate-400 font-medium">Yêu cầu qua thành công</span>
            <div className="text-2xl md:text-3xl font-bold text-emerald-400 mt-1 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              {normalCount}
            </div>
          </div>

          <div className={`rounded-xl p-4 border transition-all ${
            rateLimitedCount > 0 
              ? 'bg-rose-950/40 border-rose-500/50 shadow-lg shadow-rose-900/20' 
              : 'bg-slate-900/80 border-slate-800'
          }`}>
            <span className="text-xs text-rose-300 font-medium flex items-center gap-1.5">
              Bị chặn HTTP 429
              {rateLimitedCount > 0 && <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>}
            </span>
            <div className="text-2xl md:text-3xl font-bold text-rose-400 mt-1 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-400" />
              {rateLimitedCount}
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
            <span className="text-xs text-slate-400 font-medium">Chế độ gửi</span>
            <div className="mt-1 flex items-center gap-2">
              <button
                onClick={() => setConcurrencyMode(m => m === 'sequential' ? 'parallel' : 'sequential')}
                className="text-xs px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-blue-400 font-semibold border border-slate-700 transition"
              >
                {concurrencyMode === 'sequential' ? 'Tuần tự (30ms)' : 'Đồng thời (Flood)'}
              </button>
            </div>
          </div>
        </div>

        {/* 4 Interactive Test Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Auth */}
          <div className="bg-slate-900/90 border border-blue-900/40 hover:border-blue-700/60 transition rounded-2xl p-5 flex flex-col justify-between shadow-lg">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="p-2 bg-blue-600/20 text-blue-400 rounded-xl">
                  <Lock className="w-5 h-5" />
                </span>
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/30">
                  Hạn mức: 20 req/m
                </span>
              </div>
              <div>
                <h3 className="font-bold text-white text-base">1. Xác thực (Auth)</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Chặn vét cạn mật khẩu / brute-force tại <code className="text-slate-300">/auth/login</code>.
                </p>
              </div>
              <div className="text-xs text-slate-500 space-y-1 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800 font-mono">
                <div>Endpoint: POST /auth/login</div>
                <div>Ngưỡng: 20 req/phút</div>
                <div>Kỳ vọng: 429 từ req thứ 21</div>
              </div>
            </div>

            <div className="mt-5 space-y-2">
              <button
                disabled={isRunning}
                onClick={() => handleTestAuth(25)}
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold rounded-xl text-sm transition shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4 fill-white" />
                Test Auth (Gửi 25 req)
              </button>
              <button
                disabled={isRunning}
                onClick={() => handleTestAuth(5)}
                className="w-full py-1.5 px-3 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-300 font-medium rounded-lg text-xs transition"
              >
                Test nhẹ (5 req an toàn)
              </button>
            </div>
          </div>

          {/* Card 2: AI Assistant */}
          <div className="bg-slate-900/90 border border-purple-900/40 hover:border-purple-700/60 transition rounded-2xl p-5 flex flex-col justify-between shadow-lg">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="p-2 bg-purple-600/20 text-purple-400 rounded-xl">
                  <Sparkles className="w-5 h-5" />
                </span>
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/30">
                  Hạn mức: 30 req/m
                </span>
              </div>
              <div>
                <h3 className="font-bold text-white text-base">2. Trí tuệ nhân tạo (AI)</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Bảo vệ quota Google Gemini API tại <code className="text-slate-300">/api/v1/ai/*</code>.
                </p>
              </div>
              <div className="text-xs text-slate-500 space-y-1 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800 font-mono">
                <div>Endpoint: POST /api/v1/ai/chat</div>
                <div>Ngưỡng: 30 req/phút</div>
                <div>Kỳ vọng: 429 từ req thứ 31</div>
              </div>
            </div>

            <div className="mt-5 space-y-2">
              <button
                disabled={isRunning}
                onClick={() => handleTestAi(35)}
                className="w-full py-2.5 px-4 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-semibold rounded-xl text-sm transition shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4 fill-white" />
                Test AI (Gửi 35 req)
              </button>
              <button
                disabled={isRunning}
                onClick={() => handleTestAi(10)}
                className="w-full py-1.5 px-3 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-300 font-medium rounded-lg text-xs transition"
              >
                Test nhẹ (10 req an toàn)
              </button>
            </div>
          </div>

          {/* Card 3: Mutation */}
          <div className="bg-slate-900/90 border border-amber-900/40 hover:border-amber-700/60 transition rounded-2xl p-5 flex flex-col justify-between shadow-lg">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="p-2 bg-amber-600/20 text-amber-400 rounded-xl">
                  <FileText className="w-5 h-5" />
                </span>
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  Hạn mức: 60 req/m
                </span>
              </div>
              <div>
                <h3 className="font-bold text-white text-base">3. Ghi dữ liệu (Mutation)</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Kiểm soát tần suất đăng bài, tạo nhóm tại <code className="text-slate-300">/api/v1/posts</code>.
                </p>
              </div>
              <div className="text-xs text-slate-500 space-y-1 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800 font-mono">
                <div>Endpoint: POST /api/v1/posts</div>
                <div>Ngưỡng: 60 req/phút</div>
                <div>Kỳ vọng: 429 từ req thứ 61</div>
              </div>
            </div>

            <div className="mt-5 space-y-2">
              <button
                disabled={isRunning}
                onClick={() => handleTestMutation(65)}
                className="w-full py-2.5 px-4 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-semibold rounded-xl text-sm transition shadow-lg shadow-amber-600/30 flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4 fill-white" />
                Test Post (Gửi 65 req)
              </button>
              <button
                disabled={isRunning}
                onClick={() => handleTestMutation(20)}
                className="w-full py-1.5 px-3 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-300 font-medium rounded-lg text-xs transition"
              >
                Test nhẹ (20 req an toàn)
              </button>
            </div>
          </div>

          {/* Card 4: WebSocket Bypass */}
          <div className="bg-slate-900/90 border border-emerald-900/40 hover:border-emerald-700/60 transition rounded-2xl p-5 flex flex-col justify-between shadow-lg">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="p-2 bg-emerald-600/20 text-emerald-400 rounded-xl">
                  <Radio className="w-5 h-5" />
                </span>
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  Miễn trừ 100%
                </span>
              </div>
              <div>
                <h3 className="font-bold text-white text-base">4. Miễn trừ WebSocket</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Bảo vệ kết nối chat, gọi thoại không bao giờ bị ngắt bởi rate limit.
                </p>
              </div>
              <div className="text-xs text-slate-500 space-y-1 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800 font-mono">
                <div>Endpoint: GET /ws-chat/info</div>
                <div>Ngưỡng: Whitelist</div>
                <div>Kỳ vọng: 100% không bị 429</div>
              </div>
            </div>

            <div className="mt-5 space-y-2">
              <button
                disabled={isRunning}
                onClick={() => handleTestWebSocket(25)}
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold rounded-xl text-sm transition shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4 fill-white" />
                Test WS (Gửi 25 req)
              </button>
              <button
                disabled={isRunning}
                onClick={() => handleTestWebSocket(50)}
                className="w-full py-1.5 px-3 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-300 font-medium rounded-lg text-xs transition"
              >
                Gửi 50 req WebSocket
              </button>
            </div>
          </div>
        </div>

        {/* Global Toolbar & Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-slate-800">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'all' ? 'bg-blue-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              Tất cả ({logs.length})
            </button>
            <button
              onClick={() => setActiveTab('429')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === '429' ? 'bg-rose-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              Chỉ 429 Rate Limited ({rateLimitedCount})
            </button>
            <button
              onClick={() => setActiveTab('success')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'success' ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              Thành công ({normalCount})
            </button>
          </div>

          <div className="flex items-center gap-2">
            {isRunning && (
              <button
                onClick={stopTesting}
                className="px-3.5 py-1.5 bg-rose-600/20 text-rose-300 border border-rose-500/30 hover:bg-rose-600 hover:text-white rounded-lg text-xs font-semibold transition flex items-center gap-1.5"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
                Dừng gửi
              </button>
            )}
            <button
              onClick={clearLogs}
              disabled={logs.length === 0}
              className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-slate-300 border border-slate-800 rounded-lg text-xs font-medium transition flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Xóa nhật ký
            </button>
          </div>
        </div>

        {/* Live Network Request Table */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
          <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-400" />
              Nhật Ký Yêu Cầu Network Thời Gian Thực ({filteredLogs.length})
            </h2>
            <span className="text-xs text-slate-500">Mới nhất ở đầu</span>
          </div>

          <div className="overflow-x-auto max-h-[480px] overflow-y-auto">
            {filteredLogs.length === 0 ? (
              <div className="py-16 text-center text-slate-500 space-y-2">
                <Activity className="w-10 h-10 mx-auto stroke-1 opacity-40" />
                <p className="text-sm font-medium">Chưa có yêu cầu nào được gửi.</p>
                <p className="text-xs text-slate-600">Bấm một trong các nút kiểm thử bên trên để bắt đầu gửi yêu cầu qua Gateway.</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-slate-950 text-slate-400 sticky top-0 uppercase tracking-wider font-semibold border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">#</th>
                    <th className="py-3 px-4">Thời gian</th>
                    <th className="py-3 px-4">Phương thức</th>
                    <th className="py-3 px-4">Đường dẫn (Endpoint)</th>
                    <th className="py-3 px-4">HTTP Status</th>
                    <th className="py-3 px-4">Limit / Còn lại</th>
                    <th className="py-3 px-4">Retry-After</th>
                    <th className="py-3 px-4">Độ trễ</th>
                    <th className="py-3 px-4">Nội dung phản hồi (JSON)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {filteredLogs.map((log, index) => {
                    const rowNumber = filteredLogs.length - index;
                    return (
                      <tr 
                        key={log.id} 
                        className={`transition ${
                          log.isRateLimited 
                            ? 'bg-rose-950/20 hover:bg-rose-950/40 text-rose-200' 
                            : 'hover:bg-slate-800/40 text-slate-300'
                        }`}
                      >
                        <td className="py-2.5 px-4 font-bold text-slate-400">{rowNumber}</td>
                        <td className="py-2.5 px-4 text-slate-400">{log.time}</td>
                        <td className="py-2.5 px-4 font-bold">
                          <span className={`px-2 py-0.5 rounded text-[10px] ${
                            log.method === 'POST' ? 'bg-amber-500/20 text-amber-300' : 'bg-blue-500/20 text-blue-300'
                          }`}>
                            {log.method}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 font-sans font-medium text-slate-200">{log.endpoint}</td>
                        <td className="py-2.5 px-4">
                          {log.isRateLimited ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold font-sans text-[11px] animate-pulse">
                              <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                              429 TOO MANY REQUESTS
                            </span>
                          ) : log.status === 200 ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[11px] font-sans">
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                              200 OK
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[11px] font-sans">
                              {log.status} {log.statusText}
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-4 text-slate-400">
                          {log.limit ? (
                            <span>{log.limit} / <strong className={log.remaining === '0' ? 'text-rose-400' : 'text-emerald-400'}>{log.remaining ?? '0'}</strong></span>
                          ) : (
                            <span className="text-slate-600">-</span>
                          )}
                        </td>
                        <td className="py-2.5 px-4">
                          {log.retryAfter ? (
                            <span className="text-amber-300 font-bold">{log.retryAfter}s</span>
                          ) : (
                            <span className="text-slate-600">-</span>
                          )}
                        </td>
                        <td className="py-2.5 px-4 text-slate-400">{log.durationMs}ms</td>
                        <td className="py-2.5 px-4 max-w-xs truncate text-[11px]" title={log.responseBody}>
                          {log.responseBody || '-'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RateLimitTestPage;
