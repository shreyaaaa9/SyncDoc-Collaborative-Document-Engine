import React from 'react';
import { Users } from 'lucide-react';
import type { Collaborator } from '../collaboration/types';

interface PresenceIndicatorProps {
  collaborators: Collaborator[];
  currentUserId?: string;
}

export const PresenceIndicator: React.FC<PresenceIndicatorProps> = ({
  collaborators,
  currentUserId,
}) => {
  const otherCollaborators = collaborators.filter((c) => c.id !== currentUserId);

  if (otherCollaborators.length === 0) {
    return (
      <div className="inline-flex items-center gap-1.5 text-xs text-slate-400 font-medium">
        <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
        <span>Editing solo</span>
      </div>
    );
  }

  const names = otherCollaborators.map((c) => c.name).join(', ');

  return (
    <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-xs text-indigo-700 animate-in fade-in">
      <Users className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" />
      <span className="truncate max-w-[200px] sm:max-w-xs font-medium">
        {otherCollaborators.length === 1
          ? `${otherCollaborators[0].name} is also here`
          : `${names} are also here`}
      </span>
    </div>
  );
};
