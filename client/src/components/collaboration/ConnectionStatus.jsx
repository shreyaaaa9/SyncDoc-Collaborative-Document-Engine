import React, { useState, useRef, useEffect } from 'react';
import { Wifi, WifiOff, RefreshCw, CheckCircle2, AlertCircle, Clock } from 'lucide-react';

/**
 * ConnectionStatus
 * Renders the real-time connection badge in the top-right toolbar:
 * - 🟢 Connected
 * - 🟡 Connecting...
 * - 🔴 Disconnected
 * Clicking opens a popover showing status details and last synchronized timestamp.
 */
const ConnectionStatus = ({
  status = 'connected',
  lastSynchronized = 'Just now',
  latencyMs = 34,
  onChangeStatus,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef(null);

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const getStatusDisplay = () => {
    switch (status.toLowerCase()) {
      case 'connected':
        return {
          dotColor: '#10b981',
          bg: 'rgba(16, 185, 129, 0.12)',
          border: 'rgba(16, 185, 129, 0.3)',
          textColor: '#34d399',
          label: 'Connected',
          icon: <Wifi size={14} color="#10b981" />,
        };
      case 'connecting':
        return {
          dotColor: '#f59e0b',
          bg: 'rgba(245, 158, 11, 0.12)',
          border: 'rgba(245, 158, 11, 0.3)',
          textColor: '#fbbf24',
          label: 'Connecting...',
          icon: <RefreshCw size={14} color="#f59e0b" className="animate-spin" />,
        };
      case 'disconnected':
      default:
        return {
          dotColor: '#ef4444',
          bg: 'rgba(239, 68, 68, 0.12)',
          border: 'rgba(239, 68, 68, 0.3)',
          textColor: '#f87171',
          label: 'Disconnected',
          icon: <WifiOff size={14} color="#ef4444" />,
        };
    }
  };

  const current = getStatusDisplay();

  return (
    <div style={{ position: 'relative', display: 'inline-block' }} ref={popoverRef}>
      {/* Status Trigger Pill */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 12px',
          borderRadius: '999px',
          backgroundColor: current.bg,
          border: `1px solid ${current.border}`,
          color: current.textColor,
          fontSize: '0.8125rem',
          fontWeight: 600,
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          outline: 'none',
        }}
        title="Click to view connection info"
        aria-expanded={isOpen}
      >
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            backgroundColor: current.dotColor,
            boxShadow: `0 0 8px ${current.dotColor}`,
          }}
        />
        <span>{current.label}</span>
      </button>

      {/* Popover Details */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            width: '260px',
            backgroundColor: '#18181b',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '12px',
            padding: '14px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.6), 0 8px 10px -6px rgba(0, 0, 0, 0.5)',
            zIndex: 50,
            color: '#f4f4f5',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#a1a1aa' }}>
              Connection
            </span>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: '0.75rem',
                color: current.textColor,
                fontWeight: 600,
              }}
            >
              ● {current.label}
            </span>
          </div>

          <div
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              borderRadius: '8px',
              padding: '10px',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              marginBottom: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#a1a1aa', marginBottom: '4px' }}>
              <Clock size={12} />
              <span>Last synchronized:</span>
            </div>
            <div style={{ fontSize: '0.875rem', fontWeight: 500, color: '#f4f4f5', paddingLeft: '18px' }}>
              {lastSynchronized}
            </div>
            {status === 'connected' && (
              <div style={{ fontSize: '0.7rem', color: '#71717a', paddingLeft: '18px', marginTop: '4px' }}>
                Ping: {latencyMs}ms (Mock WebSocket)
              </div>
            )}
          </div>

          {/* Interactive State Switcher for Week 1 Testing */}
          {onChangeStatus && (
            <div>
              <div style={{ fontSize: '0.7rem', color: '#71717a', marginBottom: '6px' }}>
                Simulate Connection State:
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  onClick={() => onChangeStatus('connected')}
                  style={{
                    flex: 1,
                    padding: '4px 6px',
                    fontSize: '0.7rem',
                    backgroundColor: status === 'connected' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                    border: `1px solid ${status === 'connected' ? '#10b981' : 'rgba(255, 255, 255, 0.1)'}`,
                    color: status === 'connected' ? '#34d399' : '#a1a1aa',
                    borderRadius: '6px',
                    cursor: 'pointer',
                  }}
                >
                  Online
                </button>
                <button
                  onClick={() => onChangeStatus('connecting')}
                  style={{
                    flex: 1,
                    padding: '4px 6px',
                    fontSize: '0.7rem',
                    backgroundColor: status === 'connecting' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                    border: `1px solid ${status === 'connecting' ? '#f59e0b' : 'rgba(255, 255, 255, 0.1)'}`,
                    color: status === 'connecting' ? '#fbbf24' : '#a1a1aa',
                    borderRadius: '6px',
                    cursor: 'pointer',
                  }}
                >
                  Retry
                </button>
                <button
                  onClick={() => onChangeStatus('disconnected')}
                  style={{
                    flex: 1,
                    padding: '4px 6px',
                    fontSize: '0.7rem',
                    backgroundColor: status === 'disconnected' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                    border: `1px solid ${status === 'disconnected' ? '#ef4444' : 'rgba(255, 255, 255, 0.1)'}`,
                    color: status === 'disconnected' ? '#f87171' : '#a1a1aa',
                    borderRadius: '6px',
                    cursor: 'pointer',
                  }}
                >
                  Offline
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ConnectionStatus;
