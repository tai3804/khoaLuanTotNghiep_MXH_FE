import { PostPoll, PollOption } from '../../../types';

export interface PostPollViewProps {
  postId: string;
  poll: PostPoll;
  onPollUpdated?: (updatedPoll: PostPoll) => void;
}

export interface PollHeaderProps {
  question: string;
  totalVotes: number;
  multipleChoice?: boolean;
  isClosed: boolean;
  closedAt?: string;
  canChangeVote: boolean;
  onChangeVoteClick: () => void;
}

export interface PollResultBarProps {
  option: PollOption;
}

export interface PollVoteOptionProps {
  option: PollOption;
  isSelected: boolean;
  multipleChoice?: boolean;
  disabled?: boolean;
  onToggle: (optionId: string) => void;
}
