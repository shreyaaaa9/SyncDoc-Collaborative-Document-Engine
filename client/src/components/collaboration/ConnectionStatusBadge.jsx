import React from 'react';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { ConnectionState } from '../../types/collaboration';

const ConnectionStatusBadge = ({ connection }) => {
  const { status, latency, reconnect, isConnected, isReconnecting, isDisconnected } = connection;

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        padding: '5px 12px',
        borderRadius: 'var(--radius-full)',
        backgroundColor: 'var(--bg-tertiary)',
        border: `1px solid ${
          isConnected
            ? 'rgba(16, 185, 129, 0.3)'
            : isReconnecting
            ? 'rgba(245, 158, 11, 0.4)'
            : 'rgba(239, 68, 68, 0.4)'
        }`,
        fontSize: '0.8rem',
        fontWeight: 500,
        boxShadow: 'var(--shadow-sm)',
        transition: 'all var(--transition-fast)',
      }}
      title={`Status: ${status} | Latency: ${latency}ms`}
    >
      {isConnected && (
        <>
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: 'var(--success)',
              boxShadow: '0 0 8px var(--success)',
            }}
          />
          <Wifi size={14} color="var(--success)" />
          <span style={{ color: 'var(--text-primary)' }}>Connected</span>
          <span
            style={{
              color: 'var(--text-muted)',
              fontSize: '0.72rem',
              fontFamily: 'var(--font-mono)',
              borderLeft: '1px solid var(--border-medium)',
              paddingLeft: '6px',
            }}
          >
            {latency}ms
          </span>
        </>
      )}

      {isReconnecting && (
        <>
          <RefreshCw
            size={14}
            color="var(--warning)"
            style={{ animation: 'spin 1.5s linear infinite' }}
          />
          <span style={{ color: 'var(--warning)' }}>Reconnecting...</span>
        </>
      )}

      {isDisconnected && (
        <>
          <WifiOff size={14} color="var(--danger)" />
          <span style={{ color: 'var(--danger)' }}>Offline</span>
          <button
            onClick={reconnect}
            style={{
              padding: '2px 8px',
              fontSize: '0.72rem',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--primary)',
              color: '#ffffff',
              border: 'none',
              marginLeft: '4px',
            }}
          >
            Reconnect
          </button>
        </>
      )}

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default ConnectionStatusBadge;
