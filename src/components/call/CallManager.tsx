import React from 'react';
import { IncomingCallModal } from './IncomingCallModal';
import { ActiveCallModal } from './ActiveCallModal';
import { CallHistoryModal } from './CallHistoryModal';

export const CallManager: React.FC = () => {
  return (
    <>
      <IncomingCallModal />
      <ActiveCallModal />
      <CallHistoryModal />
    </>
  );
};
