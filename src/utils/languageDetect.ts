/**
 * Nhận diện ngôn ngữ của nội dung bài viết ngay trên trình duyệt (không gọi AI) để chỉ hiện nút "Dịch bài viết"
 * khi bài viết thực sự không phải ngôn ngữ của người xem.
 *
 *  - 'vi'      : tiếng Việt (có dấu, hoặc tiếng Việt không dấu với từ phổ biến)
 *  - 'en'      : tiếng Anh
 *  - 'other'   : ngôn ngữ khác (Hàn, Nhật, Trung, Nga, Ả Rập, Thái... hoặc các ngôn ngữ Latin có ký tự đặc trưng)
 *  - 'unknown' : không phải chữ (chỉ số, emoji, đường dẫn, hashtag, tên riêng...) hoặc quá ít dữ liệu để kết luận
 */
export type DetectedLanguage = 'vi' | 'en' | 'other' | 'unknown';

// Ký tự chỉ có trong tiếng Việt: ă ơ ư đ và các nguyên âm có dấu thanh (khối Latin Extended Additional)
const VI_STRONG = /[ăơưđĂƠƯĐẠ-ỹ]/;
// Ký tự có dấu dùng chung với một số ngôn ngữ Latin khác (Pháp, Bồ Đào Nha...), tiếng Việt vẫn dùng rất nhiều
const VI_WEAK = /[àáâãèéêìíòóôõùúýÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚÝ]/;
// Ký tự đặc trưng của ngôn ngữ Latin khác, không có trong tiếng Việt
const OTHER_LATIN = /[çñëïüöäßœæåøÇÑËÏÜÖÄÅØ¿¡]/;

// Từ chức năng phổ biến của tiếng Anh. Cố ý bỏ các từ trùng với tiếng Việt không dấu (a, an, no, do, me, so, to, on...)
const EN_WORDS = new Set([
  'the', 'and', 'is', 'are', 'was', 'were', 'be', 'been', 'am', 'of', 'in', 'for', 'with', 'this', 'that', 'these',
  'those', 'it', 'its', 'you', 'your', 'we', 'our', 'they', 'their', 'he', 'she', 'his', 'her', 'i', 'my', 'have',
  'has', 'had', 'not', 'but', 'what', 'when', 'where', 'who', 'why', 'how', 'will', 'would', 'can', 'could', 'just',
  'at', 'as', 'from', 'by', 'if', 'or', 'about', 'out', 'up', 'all', 'yes', 'hello', 'hi', 'hey', 'thanks', 'thank',
  'good', 'great', 'love', 'new', 'today', 'tomorrow', 'please', 'very', 'really', 'much', 'more', 'some', 'any',
  'than', 'then', 'there', 'here', 'now', 'like', 'get', 'got', 'make', 'know', 'think', 'want', 'need', 'let',
  'going', 'good', 'morning', 'night', 'happy', 'birthday', 'friends', 'friend', 'people', 'world', 'time', 'day',
  'check', 'out', 'look', 'see', 'one', 'two', 'three', 'first', 'last', 'best', 'amazing', 'beautiful', 'awesome',
]);

// Từ phổ biến của tiếng Việt viết không dấu (kiểu gõ nhanh trên mạng xã hội)
const VI_ASCII_WORDS = new Set([
  'la', 'va', 'cua', 'khong', 'toi', 'ban', 'nhung', 'duoc', 'nay', 'cho', 'voi', 'minh', 'mot', 'nhu', 'den', 'tren',
  'roi', 'nha', 'nhe', 'nhieu', 'cac', 'nguoi', 'hom', 'troi', 'dep', 'di', 'hoc', 've', 'com', 'tai', 'rat', 'cung',
  'da', 'se', 'dang', 'co', 'ma', 'thi', 'lam', 'gi', 'sao', 'ai', 'dau', 'nao', 'vay', 'thoi', 'em', 'anh', 'chi',
  'ong', 'ba', 'cam', 'chao', 'xin', 'chuc', 'mung', 'oi', 'qua', 'lai', 'moi', 'xem', 'bai', 'viet', 'hay', 'vui',
  'buon', 'yeu', 'nho', 'tung', 'dau', 'sinh', 'vien', 'truong', 'lop', 'thay', 'nhom', 'cuoc', 'song', 'ngay',
]);

/** Bỏ các phần không mang thông tin ngôn ngữ: đường dẫn, mention, hashtag, emoji. */
const stripNoise = (text: string) =>
  text
    .replace(/https?:\/\/\S+|www\.\S+/gi, ' ')
    .replace(/@\[[^\]]*\](?:\([^)]*\))?/g, ' ')
    .replace(/[#@][\p{L}\p{N}_.-]+/gu, ' ')
    .replace(/[\p{Extended_Pictographic}‍️]/gu, ' ');

export function detectLanguage(raw: string | null | undefined): DetectedLanguage {
  if (!raw) return 'unknown';

  const text = stripNoise(raw);
  const letters = text.match(/\p{L}/gu);
  if (!letters || letters.length === 0) return 'unknown'; // "1245", emoji, link...

  const latinCount = letters.filter((ch) => /\p{Script=Latin}/u.test(ch)).length;
  if ((letters.length - latinCount) / letters.length >= 0.5) return 'other'; // Hàn, Nhật, Trung, Nga, Ả Rập, Thái...

  // Ký tự chỉ có trong tiếng Việt: chắc chắn là tiếng Việt
  if (VI_STRONG.test(text)) return 'vi';

  const words = text.toLowerCase().match(/[a-z']+/g) ?? [];
  const en = words.filter((w) => EN_WORDS.has(w)).length;
  const vi = words.filter((w) => VI_ASCII_WORDS.has(w)).length;

  // Ký tự đặc trưng của ngôn ngữ Latin khác (ç, ñ, ü, ¿...): không phải tiếng Việt, trừ khi rõ ràng là tiếng Anh
  if (OTHER_LATIN.test(text)) return en > vi ? 'en' : 'other';

  // Có dấu dùng chung (é, ô, à...): thường là tiếng Việt, trừ khi có nhiều từ tiếng Anh hơn (vd "I love this café")
  const weakCount = (text.match(new RegExp(VI_WEAK.source, 'g')) ?? []).length;
  if (weakCount > 0) return en > weakCount ? 'en' : 'vi';

  // Chỉ có chữ không dấu: phân biệt tiếng Anh với tiếng Việt gõ không dấu bằng từ phổ biến
  if (en > vi) return 'en';
  if (vi > en) return 'vi';
  return 'unknown';
}

/**
 * Có nên hiện nút dịch cho người xem dùng ngôn ngữ `viewerLanguage` hay không:
 * chỉ khi nhận diện được rõ bài viết KHÔNG cùng ngôn ngữ với người xem.
 */
export function needsTranslation(content: string | null | undefined, viewerLanguage: 'vi' | 'en'): boolean {
  const detected = detectLanguage(content);
  return detected !== 'unknown' && detected !== viewerLanguage;
}
