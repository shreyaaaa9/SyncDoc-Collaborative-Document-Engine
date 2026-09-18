import React from 'react';
import { UserCheck, AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';

const NotificationToasts = ({ notifications, onDismiss }) => {
  if (!notifications || notifications.length === 0) return null;

  const getIcon = (type) => {
    switch (type) {
      case 'user':
        return <UserCheck size={18} color="var(--primary)" />;
      case 'success':
        return <CheckCircle2 size={18} color="var(--success)" />;
      case 'warning':
        return <AlertTriangle size={18} color="var(--warning)" />;
      case 'error':
        return <AlertTriangle size={18} color="var(--danger)" />;
      default:
        return <Info size={18} color="var(--primary)" />;
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '80px',
        right: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        zIndex: 999,
        maxWidth: '380px',
        pointerEvents: 'none',
      }}
    >
      {notifications.map((n) => (
        <div
          key={n.id}
          style={{
            pointerEvents: 'auto',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-medium)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 14px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px',
            boxShadow: 'var(--shadow-xl)',
            backdropFilter: 'blur(8px)',
            animation: 'slideIn 250ms ease-out',
            color: 'var(--text-primary)',
          }}
        >
          <div style={{ marginTop: '2px' }}>{getIcon(n.type)}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{n.title}</div>
            {n.message && (
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                {n.message}
              </div>
            )}
          </div>
          <button
            onClick={() => onDismiss(n.id)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '2px',
            }}
          >
            <X size={14} />
          </button>
        </div>
      ))}

      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default NotificationToasts;
