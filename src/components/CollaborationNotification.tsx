import React from 'react';
import { UserPlus, UserMinus, Wifi, RefreshCw, X } from 'lucide-react';
import type { CollaborationNotification as NotificationItem } from '../collaboration/types';

interface CollaborationNotificationProps {
  notifications: NotificationItem[];
  onDismiss: (id: string) => void;
}

export const CollaborationNotification: React.FC<CollaborationNotificationProps> = ({
  notifications,
  onDismiss,
}) => {
  if (notifications.length === 0) return null;

  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'join':
        return <UserPlus className="w-4 h-4 text-emerald-400" />;
      case 'leave':
        return <UserMinus className="w-4 h-4 text-slate-400" />;
      case 'connection':
        return <Wifi className="w-4 h-4 text-indigo-400" />;
      case 'sync':
      default:
        return <RefreshCw className="w-4 h-4 text-blue-400" />;
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {notifications.map((notif) => (
        <div
          key={notif.id}
          className="pointer-events-auto bg-slate-900/95 backdrop-blur-md text-white text-xs px-3.5 py-2.5 rounded-xl shadow-2xl border border-slate-700/60 flex items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-2 duration-200"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex-shrink-0">{getIcon(notif.type)}</div>
            <span className="truncate text-slate-200 font-medium">{notif.message}</span>
          </div>

          <button
            onClick={() => onDismiss(notif.id)}
            className="text-slate-400 hover:text-white p-1 rounded transition-colors flex-shrink-0"
            title="Dismiss"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};
