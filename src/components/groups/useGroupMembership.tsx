import React, { useCallback, useState } from 'react';
import { groupService, GroupResponse } from '../../services/groupService';
import { useToast } from '../../context/ToastContext';
import { getApiErrorMessage } from '../../utils/apiError';
import { JoinGroupModal } from './JoinGroupModal';

/** Nhóm riêng tư có đặt câu hỏi: người xin vào phải trả lời trước khi gửi yêu cầu. */
export const needsJoinAnswers = (group: GroupResponse): boolean =>
  group.privacy === 'PRIVATE' && group.membershipQuestions.length > 0;

/**
 * Tham gia / hủy yêu cầu / chấp nhận hoặc từ chối lời mời, dùng chung cho trang nhóm, thẻ nhóm và kết quả tìm kiếm.
 * Nhóm có câu hỏi sẽ tự mở hộp thoại trả lời (render `joinModal` ở nơi dùng hook). `onChanged` nhận nhóm đã cập nhật
 * (null nếu server không trả về nhóm) và bản nhóm trước khi thao tác.
 */
export const useGroupMembership = (onChanged?: (updated: GroupResponse | null, previous: GroupResponse) => void) => {
  const toast = useToast();
  const [busyId, setBusyId] = useState('');
  const [questionsFor, setQuestionsFor] = useState<GroupResponse | null>(null);

  const run = useCallback(async (
    group: GroupResponse,
    action: () => Promise<GroupResponse | null>,
    message: (updated: GroupResponse | null) => string,
  ): Promise<boolean> => {
    setBusyId(group.id);
    try {
      const updated = await action();
      toast.showSuccess(message(updated));
      onChanged?.(updated, group);
      return true;
    } catch (err) {
      toast.showError(getApiErrorMessage(err, 'Không thể thực hiện thao tác, vui lòng thử lại.'));
      return false;
    } finally {
      setBusyId('');
    }
  }, [toast, onChanged]);

  const joinMessage = (updated: GroupResponse | null, fallbackName: string) => {
    if (updated?.joinStatus === 'PENDING') return 'Đã gửi yêu cầu tham gia, vui lòng chờ quản trị viên duyệt.';
    return `Bạn đã tham gia nhóm "${updated?.name ?? fallbackName}".`;
  };

  const requestJoin = useCallback((group: GroupResponse) => {
    if (busyId) return;
    if (needsJoinAnswers(group)) {
      setQuestionsFor(group);
      return;
    }
    void run(group, () => groupService.joinGroup(group.id), (u) => joinMessage(u, group.name));
  }, [busyId, run]);

  const submitAnswers = useCallback(async (answers: string[]) => {
    if (!questionsFor) return;
    const group = questionsFor;
    const ok = await run(group, () => groupService.joinGroup(group.id, answers), (u) => joinMessage(u, group.name));
    if (ok) setQuestionsFor(null);
  }, [questionsFor, run]);

  const cancelRequest = useCallback((group: GroupResponse) => {
    if (busyId) return;
    void run(group, () => groupService.cancelJoinRequest(group.id), () => 'Đã hủy yêu cầu tham gia nhóm.');
  }, [busyId, run]);

  const respondToInvitation = useCallback((group: GroupResponse, accept: boolean) => {
    if (busyId) return;
    void run(
      group,
      () => groupService.respondToInvitation(group.id, accept),
      (u) => {
        if (!accept) return 'Đã từ chối lời mời.';
        return u?.isMember ? `Bạn đã tham gia nhóm "${u.name}".` : 'Đã chấp nhận lời mời. Quản trị viên sẽ duyệt yêu cầu của bạn.';
      },
    );
  }, [busyId, run]);

  const joinModal: React.ReactNode = (
    <JoinGroupModal
      group={questionsFor}
      loading={Boolean(questionsFor && busyId === questionsFor.id)}
      onClose={() => setQuestionsFor(null)}
      onSubmit={submitAnswers}
    />
  );

  return { busyId, requestJoin, cancelRequest, respondToInvitation, joinModal };
};
