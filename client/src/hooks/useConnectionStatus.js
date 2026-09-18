import { useState, useEffect, useCallback } from 'react';
import { ConnectionState } from '../types/collaboration';

export const useConnectionStatus = (onNotify) => {
  const [status, setStatus] = useState(ConnectionState.CONNECTED);
  const [latency, setLatency] = useState(24);
  const [lastSyncTime, setLastSyncTime] = useState(new Date());
  const [reconnectAttempts, setReconnectAttempts] = useState(0);

  // Ping / Heartbeat simulation
  useEffect(() => {
    if (status !== ConnectionState.CONNECTED) return;

    const interval = setInterval(() => {
      // Small jitter between 18ms and 36ms to simulate realistic network ping
      const simulatedPing = Math.floor(18 + Math.random() * 18);
      setLatency(simulatedPing);
      setLastSyncTime(new Date());
    }, 5000);

    return () => clearInterval(interval);
  }, [status]);

  // Manual reconnect trigger
  const reconnect = useCallback(() => {
    setStatus(ConnectionState.RECONNECTING);
    setReconnectAttempts((prev) => prev + 1);

    if (onNotify) {
      onNotify({
        type: 'info',
        title: 'Reconnecting to collaboration server...',
        message: 'Attempting to re-establish WebSocket session',
      });
    }

    setTimeout(() => {
      setStatus(ConnectionState.CONNECTED);
      setReconnectAttempts(0);
      setLastSyncTime(new Date());
      if (onNotify) {
        onNotify({
          type: 'success',
          title: 'Connection Restored',
          message: 'Synchronized with collaboration server (AST v4)',
        });
      }
    }, 1800);
  }, [onNotify]);

  // Force toggle status for testing & Dev Simulation Bar
  const toggleConnection = useCallback(() => {
    if (status === ConnectionState.CONNECTED) {
      setStatus(ConnectionState.DISCONNECTED);
      if (onNotify) {
        onNotify({
          type: 'error',
          title: 'Disconnected from Server',
          message: 'Real-time sync paused. Local edits will queue.',
        });
      }
    } else {
      reconnect();
    }
  }, [status, reconnect, onNotify]);

  return {
    status,
    latency,
    lastSyncTime,
    reconnectAttempts,
    reconnect,
    toggleConnection,
    isConnected: status === ConnectionState.CONNECTED,
    isReconnecting: status === ConnectionState.RECONNECTING,
    isDisconnected: status === ConnectionState.DISCONNECTED,
  };
};
