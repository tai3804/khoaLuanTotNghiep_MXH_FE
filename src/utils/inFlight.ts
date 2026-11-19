/**
 * Gộp các lời gọi giống hệt nhau đang chạy dở thành một request. Hai lần gọi cùng khoá trong lúc lần đầu chưa xong sẽ dùng chung một
 * Promise (React StrictMode chạy effect hai lần ở chế độ dev, người dùng bấm Enter hai lần liên tiếp, nhiều widget cùng mở...).
 * Khoá được xoá khi request xong, nên lần gọi sau đó vẫn lấy dữ liệu mới.
 */
export function dedupeInFlight<T>(store: Map<string, Promise<T>>, key: string, start: () => Promise<T>): Promise<T> {
  const running = store.get(key);
  if (running) return running;
  const promise = start().finally(() => {
    store.delete(key);
  });
  store.set(key, promise);
  return promise;
}
