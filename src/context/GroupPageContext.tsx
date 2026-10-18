import { createContext, useContext } from 'react';
import { GroupResponse, GroupRole, GroupStaffMember } from '../services/groupService';
import { Post } from '../types';

/**
 * Ngữ cảnh của trang một nhóm: thẻ bài viết đọc nó để hiện tác giả làm tiêu đề (như Facebook trong nhóm), huy hiệu
 * "Quản trị viên"/"Người kiểm duyệt" cạnh tên tác giả và các lệnh điều hành (ghim, gỡ bài) trong menu "...".
 * Ngoài trang nhóm (bảng tin, trang cá nhân...) không có provider nên thẻ bài giữ nguyên giao diện cũ.
 */
export interface GroupPageContextValue {
  group: GroupResponse;
  staff: GroupStaffMember[];
  /** Vai trò điều hành của một người trong nhóm; null nếu là thành viên thường. */
  roleOf: (userId?: string) => Exclude<GroupRole, 'MEMBER'> | null;
  /** Mình là quản trị/kiểm duyệt viên của nhóm. */
  canModerate: boolean;
  /** Ghim/bỏ ghim bài lên đầu nhóm; ném lỗi (đã có thông báo) khi thất bại. */
  onPinPost: (post: Post, pinned: boolean) => Promise<void>;
  /** Mở hộp thoại gỡ bài khỏi nhóm (có lý do và tùy chọn cấm tác giả). */
  onRemovePost: (post: Post) => void;
  /** Mở hộp thoại báo cáo bài viết cho quản trị viên nhóm (thành viên). */
  onReportPost: (post: Post) => void;
}

export const GroupPageContext = createContext<GroupPageContextValue | null>(null);

export const useGroupPage = (): GroupPageContextValue | null => useContext(GroupPageContext);
