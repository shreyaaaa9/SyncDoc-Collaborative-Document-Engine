import React from 'react';
import { CheckCircle2, Info, AlertTriangle, AlertCircle, X } from 'lucide-react';

/**
 * CollaborationNotification
 * A notification toast item displaying collaboration events:
 * - Types: success | info | warning | conflict
 * - Title and message
 * - Dismiss action
 */
const CollaborationNotification = ({
  notification,
  onDismiss,
}) => {
  const { id, type = 'info', title, message, timestamp } = notification;

  const getConfig = () => {
    switch (type) {
      case 'success':
        return {
          icon: <CheckCircle2 size={18} color="#10b981" />,
          borderColor: 'rgba(16, 185, 129, 0.4)',
          bgColor: 'rgba(6, 78, 59, 0.35)',
          titleColor: '#34d399',
        };
      case 'warning':
        return {
          icon: <AlertTriangle size={18} color="#f59e0b" />,
          borderColor: 'rgba(245, 158, 11, 0.4)',
          bgColor: 'rgba(120, 53, 15, 0.35)',
          titleColor: '#fbbf24',
        };
      case 'conflict':
        return {
          icon: <AlertCircle size={18} color="#f97316" />,
          borderColor: 'rgba(249, 115, 22, 0.5)',
          bgColor: 'rgba(124, 45, 18, 0.4)',
          titleColor: '#fb923c',
        };
      case 'info':
      default:
        return {
          icon: <Info size={18} color="#60a5fa" />,
          borderColor: 'rgba(96, 165, 250, 0.4)',
          bgColor: 'rgba(30, 58, 138, 0.35)',
          titleColor: '#93c5fd',
        };
    }
  };

  const config = getConfig();

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        padding: '12px 14px',
        backgroundColor: '#18181b',
        borderLeft: `4px solid ${config.borderColor}`,
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        borderRight: '1px solid rgba(255, 255, 255, 0.08)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '8px',
        boxShadow: '0 8px 20px -4px rgba(0, 0, 0, 0.5)',
        minWidth: '280px',
        maxWidth: '360px',
        backdropFilter: 'blur(10px)',
        position: 'relative',
      }}
      role="status"
      aria-live="polite"
    >
      <div style={{ flexShrink: 0, marginTop: '2px' }}>{config.icon}</div>

      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
          <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: config.titleColor }}>
            {title}
          </span>
          {timestamp && (
            <span style={{ fontSize: '0.7rem', color: '#71717a' }}>
              {timestamp}
            </span>
          )}
        </div>
        <p style={{ fontSize: '0.8rem', color: '#d4d4d8', margin: '2px 0 0 0', lineHeight: 1.4 }}>
          {message}
        </p>
      </div>

      {onDismiss && (
        <button
          onClick={() => onDismiss(id)}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#71717a',
            cursor: 'pointer',
            padding: '2px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '4px',
          }}
          title="Dismiss notification"
          aria-label="Dismiss notification"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
};

export default CollaborationNotification;
