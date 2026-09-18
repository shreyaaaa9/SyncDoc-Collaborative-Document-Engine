import React from 'react';

/**
 * PresenceIndicator
 * Visual status indicator showing collaborator availability:
 * - Green = Online
 * - Yellow = Away / Viewing
 * - Red/Gray = Offline
 * - Blue/Purple = Currently editing
 */
const PresenceIndicator = ({ status = 'online', size = 'md', pulse = true, showLabel = false }) => {
  const getStatusConfig = () => {
    switch (status.toLowerCase()) {
      case 'online':
        return {
          color: '#10b981', // green
          label: 'Online',
          bg: 'rgba(16, 185, 129, 0.2)',
          border: '#10b981',
        };
      case 'editing':
        return {
          color: '#6366f1', // blue/purple
          label: 'Editing',
          bg: 'rgba(99, 102, 241, 0.25)',
          border: '#6366f1',
        };
      case 'viewing':
      case 'away':
        return {
          color: '#f59e0b', // yellow
          label: status === 'viewing' ? 'Viewing' : 'Away',
          bg: 'rgba(245, 158, 11, 0.2)',
          border: '#f59e0b',
        };
      case 'offline':
      default:
        return {
          color: '#ef4444', // red / gray
          label: 'Offline',
          bg: 'rgba(239, 68, 68, 0.15)',
          border: '#ef4444',
        };
    }
  };

  const config = getStatusConfig();
  const dimension = size === 'sm' ? 8 : size === 'lg' ? 12 : 10;

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        verticalAlign: 'middle',
      }}
      title={config.label}
      aria-label={`Presence: ${config.label}`}
    >
      <span
        style={{
          position: 'relative',
          display: 'inline-flex',
          width: dimension,
          height: dimension,
        }}
      >
        {pulse && status !== 'offline' && (
          <span
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              backgroundColor: config.color,
              opacity: 0.6,
              animation: 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
            }}
          />
        )}
        <span
          style={{
            position: 'relative',
            display: 'inline-block',
            width: dimension,
            height: dimension,
            borderRadius: '50%',
            backgroundColor: config.color,
            border: '1.5px solid #18181b',
            boxShadow: `0 0 6px ${config.color}66`,
          }}
        />
      </span>
      {showLabel && (
        <span style={{ fontSize: '0.75rem', fontWeight: 500, color: config.color }}>
          {config.label}
        </span>
      )}
    </span>
  );
};

export default PresenceIndicator;
