import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Image as ImageIcon, Lock, Play, Video } from 'lucide-react';
import { GroupResponse } from '../../services/groupService';
import { GroupMediaItem, postService } from '../../services/postService';
import { getApiErrorMessage } from '../../utils/apiError';
import { MediaLightbox } from '../post/MediaLightbox';
import { Skeleton } from '../common/Skeleton';
import { EmptyState, ErrorState, LoadMoreButton, TabCard, useInfiniteSentinel } from './groupTabUi';

type MediaFilter = 'all' | 'image' | 'video';

const FILTERS: { key: MediaFilter; label: string }[] = [
  { key: 'all', label: 'Tất cả' },
  { key: 'image', label: 'Ảnh' },
  { key: 'video', label: 'Video' },
];

const EMPTY_TEXT: Record<MediaFilter, { title: string; hint: string }> = {
  all: { title: 'Chưa có ảnh hoặc video nào', hint: 'Ảnh và video thành viên đăng trong nhóm sẽ hiện ở đây.' },
  image: { title: 'Chưa có ảnh nào', hint: 'Ảnh thành viên đăng trong nhóm sẽ hiện ở đây.' },
  video: { title: 'Chưa có video nào', hint: 'Video thành viên đăng trong nhóm sẽ hiện ở đây.' },
};

const PAGE_SIZE = 24;

/** Ô vuông trong lưới: ảnh cắt vuông, video có khung hình đầu và nút phát. */
const MediaTile: React.FC<{ item: GroupMediaItem; onOpen: () => void }> = ({ item, onOpen }) => {
  const [failed, setFailed] = useState(false);
  const isVideo = item.type === 'VIDEO';

  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={isVideo ? 'Xem video' : 'Xem ảnh'}
      className="group relative aspect-square overflow-hidden bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1877f2] dark:bg-[#3a3b3c] cursor-pointer"
    >
      {isVideo ? (
        <>
          {!failed && (
            <video
              src={item.url.includes('#') ? item.url : `${item.url}#t=0.1`}
              preload="metadata"
              muted
              playsInline
              onError={() => setFailed(true)}
              className="h-full w-full object-cover transition duration-200 group-hover:scale-105"
            />
          )}
          {failed && <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-700 to-gray-900"><Video className="h-8 w-8 text-white/50" /></div>}
          <span className="absolute inset-0 flex items-center justify-center bg-black/10">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-black/55 text-white shadow-lg">
              <Play className="h-5 w-5 translate-x-0.5" fill="currentColor" />
            </span>
          </span>
        </>
      ) : failed ? (
        <div className="flex h-full w-full items-center justify-center"><ImageIcon className="h-8 w-8 text-gray-400" /></div>
      ) : (
        <img
          src={item.url}
          alt=""
          loading="lazy"
          onError={() => setFailed(true)}
          className="h-full w-full object-cover transition duration-200 group-hover:scale-105"
        />
      )}
    </button>
  );
};

export const GroupMediaTab: React.FC<{ group: GroupResponse }> = ({ group }) => {
  const isPrivateLocked = group.privacy === 'PRIVATE' && !group.isMember && !group.isAdmin;
  const [filter, setFilter] = useState<MediaFilter>('all');
  const [items, setItems] = useState<GroupMediaItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [last, setLast] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const seq = useRef(0);

  const loadFirst = useCallback(async () => {
    const current = ++seq.current;
    if (isPrivateLocked) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const result = await postService.getGroupMediaPage(group.id, filter, 1, PAGE_SIZE);
      if (current !== seq.current) return;
      setItems(result.items);
      setTotal(result.total);
      setPage(1);
      setLast(result.last);
    } catch (err) {
      if (current !== seq.current) return;
      setItems([]);
      setError(getApiErrorMessage(err, 'Không thể tải ảnh và video của nhóm.'));
    } finally {
      if (current === seq.current) setLoading(false);
    }
  }, [group.id, filter, isPrivateLocked]);

  useEffect(() => {
    setLightboxIndex(null);
    void loadFirst();
  }, [loadFirst]);

  const loadMore = useCallback(async () => {
    if (loading || loadingMore || last || isPrivateLocked) return;
    const current = seq.current;
    setLoadingMore(true);
    try {
      const result = await postService.getGroupMediaPage(group.id, filter, page + 1, PAGE_SIZE);
      if (current !== seq.current) return;
      setItems((prev) => {
        const known = new Set(prev.map((m) => m.id));
        return [...prev, ...result.items.filter((m) => !known.has(m.id))];
      });
      setTotal(result.total);
      setPage((p) => p + 1);
      setLast(result.last);
    } catch (err) {
      if (current === seq.current) setError(getApiErrorMessage(err, 'Không thể tải thêm.'));
    } finally {
      setLoadingMore(false);
    }
  }, [loading, loadingMore, last, isPrivateLocked, group.id, filter, page]);

  const sentinel = useInfiniteSentinel(() => void loadMore(), !loading && !loadingMore && !last && !error);

  if (isPrivateLocked) {
    return (
      <TabCard className="mx-auto w-full max-w-[760px]">
        <EmptyState
          icon={<Lock className="h-7 w-7" />}
          title="Ảnh và video ở chế độ riêng tư"
          hint="Hãy tham gia nhóm này để xem ảnh và video các thành viên chia sẻ."
        />
      </TabCard>
    );
  }

  return (
    <TabCard className="mx-auto w-full max-w-[760px] p-3 sm:p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3 px-1">
        <h2 className="text-xl font-extrabold text-gray-900 dark:text-[#e4e6eb]">
          Ảnh và video{!loading && !error ? <span className="text-gray-500 dark:text-[#b0b3b8]"> · {total}</span> : null}
        </h2>
        <div role="tablist" aria-label="Lọc ảnh và video" className="flex gap-1 rounded-full bg-gray-100 p-1 dark:bg-[#3a3b3c]">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              role="tab"
              aria-selected={filter === f.key}
              onClick={() => setFilter(f.key)}
              className={`rounded-full px-4 py-1.5 text-sm font-bold transition cursor-pointer ${
                filter === f.key
                  ? 'bg-white text-[#1877f2] shadow-sm dark:bg-[#242526]'
                  : 'text-gray-600 hover:text-gray-900 dark:text-[#b0b3b8] dark:hover:text-[#e4e6eb]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div aria-busy="true" className="grid grid-cols-2 gap-1 overflow-hidden rounded-xl sm:grid-cols-3 md:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="aspect-square w-full rounded-none" />)}
        </div>
      ) : error && items.length === 0 ? (
        <ErrorState message={error} onRetry={() => void loadFirst()} />
      ) : items.length === 0 ? (
        <EmptyState icon={filter === 'video' ? <Video className="h-7 w-7" /> : <ImageIcon className="h-7 w-7" />} title={EMPTY_TEXT[filter].title} hint={EMPTY_TEXT[filter].hint} />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-1 overflow-hidden rounded-xl sm:grid-cols-3 md:grid-cols-4">
            {items.map((item, index) => (
              <MediaTile key={item.id} item={item} onOpen={() => setLightboxIndex(index)} />
            ))}
            {loadingMore && Array.from({ length: 4 }).map((_, i) => <Skeleton key={`s${i}`} className="aspect-square w-full rounded-none" />)}
          </div>
          <div ref={sentinel} className="h-1" aria-hidden="true" />
          {error && <p className="py-2 text-center text-xs text-red-500">{error}</p>}
          {!last && !loadingMore && <LoadMoreButton loading={false} onClick={() => void loadMore()} />}
        </>
      )}

      {lightboxIndex !== null && (
        <MediaLightbox
          items={items.map((m) => ({ url: m.url, video: m.type === 'VIDEO' }))}
          index={Math.min(lightboxIndex, items.length - 1)}
          onIndexChange={setLightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </TabCard>
  );
};
