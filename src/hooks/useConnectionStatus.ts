import { useState, useEffect } from 'react';
import { collaborationService } from '../collaboration/collaborationService';
import type { ConnectionStatus } from '../collaboration/types';

export const useConnectionStatus = () => {
  const [status, setStatus] = useState<ConnectionStatus>(collaborationService.getStatus());

  useEffect(() => {
    const unsubscribe = collaborationService.onStatusChange((newStatus) => {
      setStatus(newStatus);
    });
    return unsubscribe;
  }, []);

  const reconnect = () => {
    collaborationService.reconnect();
  };

  const simulateToggle = (connected: boolean) => {
    collaborationService.simulateConnectionToggle(connected);
  };

  return {
    status,
    reconnect,
    simulateToggle,
    isConnected: status === 'connected',
    isConnecting: status === 'connecting',
    isReconnecting: status === 'reconnecting',
    isDisconnected: status === 'disconnected',
  };
};
