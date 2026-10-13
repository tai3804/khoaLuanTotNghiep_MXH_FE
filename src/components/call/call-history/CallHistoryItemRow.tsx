import React from 'react';
import {
  Phone,
  Video,
  PhoneIncoming,
  PhoneOutgoing,
  PhoneMissed,
} from 'lucide-react';
import { CallHistoryItem } from '../../../services/callService';
import { UserAvatar } from '../../common/UserAvatar';

interface PartnerInfo {
  id: string;
  name: string;
  avatar: string;
}

interface CallHistoryItemRowProps {
  item: CallHistoryItem;
  partner: PartnerInfo;
  isOutgoing: boolean;
  isMissed: boolean;
  isVideo: boolean;
  formattedTime: string;
  formattedDuration: string;
  onCallback: (item: CallHistoryItem) => void;
}

export const CallHistoryItemRow: React.FC<CallHistoryItemRowProps> = ({
  item,
  partner,
  isOutgoing,
  isMissed,
  isVideo,
  formattedTime,
  formattedDuration,
  onCallback,
}) => {
  return (
    <div className="flex items-center justify-between p-3 rounded-2xl hover:bg-gray-50 dark:hover:bg-[#3a3b3c]/50 transition duration-150">
      <div className="flex items-center space-x-3.5 min-w-0">
        <UserAvatar src={partner.avatar} alt={partner.name} size="md" />
        <div className="min-w-0">
          <h4
            className={`text-sm font-bold truncate max-w-[180px] md:max-w-[220px] ${
              isMissed ? 'text-red-500' : 'text-gray-900 dark:text-white'
            }`}
          >
            {partner.name}
          </h4>
          <div className="flex items-center space-x-1.5 text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {isMissed ? (
              <PhoneMissed className="w-3.5 h-3.5 text-red-500 shrink-0" />
            ) : isOutgoing ? (
              <PhoneOutgoing className="w-3.5 h-3.5 text-blue-500 shrink-0" />
            ) : (
              <PhoneIncoming className="w-3.5 h-3.5 text-green-500 shrink-0" />
            )}
            <span className="truncate">{formattedTime}</span>
            {item.durationInSeconds > 0 && (
              <>
                <span>•</span>
                <span className="font-mono">{formattedDuration}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Callback Action Button */}
      <button
        type="button"
        onClick={() => onCallback(item)}
        className="p-2.5 rounded-full bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-[#1877f2] dark:text-blue-400 transition cursor-pointer shrink-0"
        title={isVideo ? 'Gọi lại video' : 'Gọi lại thoại'}
      >
        {isVideo ? <Video className="w-4 h-4" /> : <Phone className="w-4 h-4" />}
      </button>
    </div>
  );
};
