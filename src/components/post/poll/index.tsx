import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { PostPoll, PollOption } from '../../../types';
import { postService } from '../../../services/postService';
import { useToast } from '../../../context/ToastContext';
import { PostPollViewProps } from './types';
import { PollHeader } from './PollHeader';
import { PollResultBar } from './PollResultBar';
import { PollVoteOption } from './PollVoteOption';

export * from './types';
export * from './PollHeader';
export * from './PollResultBar';
export * from './PollVoteOption';

export const PostPollView: React.FC<PostPollViewProps> = ({ postId, poll, onPollUpdated }) => {
  const toast = useToast();
  const [selectedOptionIds, setSelectedOptionIds] = useState<string[]>(
    poll.userVotedOptionIds || []
  );
  const [isChangingVote, setIsChangingVote] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const isClosed = Boolean(
    poll.closed || (poll.closedAt && new Date(poll.closedAt).getTime() <= Date.now())
  );
  const showResults = (poll.userVoted && !isChangingVote) || isClosed;

  const handleToggleOption = (optionId: string) => {
    if (isClosed) return;
    if (poll.multipleChoice) {
      setSelectedOptionIds((prev) =>
        prev.includes(optionId) ? prev.filter((id) => id !== optionId) : [...prev, optionId]
      );
    } else {
      setSelectedOptionIds([optionId]);
    }
  };

  const handleVote = async () => {
    if (selectedOptionIds.length === 0) {
      toast.showWarning('Vui lòng chọn ít nhất một phương án');
      return;
    }

    try {
      setSubmitting(true);
      const updatedPost = await postService.votePoll(postId, selectedOptionIds);
      if (updatedPost.poll && onPollUpdated) {
        onPollUpdated(updatedPost.poll);
      }
      setIsChangingVote(false);
      toast.showSuccess('Đã ghi nhận bình chọn của bạn!');
    } catch (err: any) {
      toast.showError('Không thể gửi bình chọn: ' + (err.response?.data?.message || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="my-3 p-4 bg-gray-50/80 dark:bg-[#1e1f21] rounded-2xl border border-gray-200/80 dark:border-[#383a3d] shadow-xs">
      {/* Header */}
      <PollHeader
        question={poll.question}
        totalVotes={poll.totalVotes || 0}
        multipleChoice={poll.multipleChoice}
        isClosed={isClosed}
        closedAt={poll.closedAt}
        canChangeVote={Boolean(poll.userVoted && !isClosed && !isChangingVote)}
        onChangeVoteClick={() => setIsChangingVote(true)}
      />

      {/* Options List */}
      <div className="space-y-2">
        {poll.options.map((option: PollOption) => {
          if (showResults) {
            return <PollResultBar key={option.id} option={option} />;
          }

          return (
            <PollVoteOption
              key={option.id}
              option={option}
              isSelected={selectedOptionIds.includes(option.id)}
              multipleChoice={poll.multipleChoice}
              disabled={isClosed}
              onToggle={handleToggleOption}
            />
          );
        })}
      </div>

      {/* Voting Actions */}
      {!showResults && (
        <div className="mt-3 flex items-center justify-end gap-2">
          {isChangingVote && (
            <button
              type="button"
              onClick={() => {
                setSelectedOptionIds(poll.userVotedOptionIds || []);
                setIsChangingVote(false);
              }}
              className="px-3 py-1.5 text-xs text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#323436] rounded-lg transition cursor-pointer"
            >
              Hủy
            </button>
          )}

          <button
            type="button"
            onClick={handleVote}
            disabled={submitting || selectedOptionIds.length === 0}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-semibold rounded-lg shadow-xs transition cursor-pointer disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Đang gửi...</span>
              </>
            ) : (
              <span>Bình chọn</span>
            )}
          </button>
        </div>
      )}
    </div>
  );
};
