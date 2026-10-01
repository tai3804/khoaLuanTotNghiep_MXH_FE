import React from 'react';
import { LiveReaction } from '../../../../context/LiveStreamContext';

interface LiveStreamFloatingReactionsProps {
  reactions: LiveReaction[];
}

export const LiveStreamFloatingReactions: React.FC<LiveStreamFloatingReactionsProps> = ({ reactions }) => {
  if (!reactions || reactions.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
      {reactions.map((r) => (
        <div
          key={r.id}
          style={{ left: `${r.x}%` }}
          className="absolute bottom-14 text-2xl sm:text-3xl animate-floatUp opacity-90 drop-shadow-lg"
        >
          {r.emoji}
        </div>
      ))}
    </div>
  );
};
