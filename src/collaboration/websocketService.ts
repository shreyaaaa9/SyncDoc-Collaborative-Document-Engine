import type { ConnectionStatus, CollaborationMessage } from './types';

type MessageHandler = (message: CollaborationMessage) => void;
type StatusHandler = (status: ConnectionStatus) => void;

export class WebSocketService {
  private ws: WebSocket | null = null;
  private url: string;
  private status: ConnectionStatus = 'disconnected';
  private subscribers: Map<string, Set<MessageHandler>> = new Map();
  private statusSubscribers: Set<StatusHandler> = new Set();
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private baseReconnectDelay = 1000;
  private maxReconnectDelay = 10000;
  private intentionalClose = false;
  private broadcastChannel: BroadcastChannel | null = null;
  private isTestingDisconnected = false;

  constructor(customUrl?: string) {
    // 4. WebSocket URL from environment configuration with fallback
    const envUrl = typeof import.meta !== 'undefined' && import.meta.env?.VITE_WS_URL;
    this.url = customUrl || envUrl || 'ws://localhost:3001';

    // Cross-tab broadcast channel for local peer synchronization & multi-window testing
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.broadcastChannel = new BroadcastChannel('syncdoc_collaboration_bus');
        this.broadcastChannel.onmessage = (event) => {
          if (event.data && typeof event.data === 'object') {
            this.dispatchMessage(event.data as CollaborationMessage);
          }
        };
      } catch (err) {
        console.warn('[WebSocketService] BroadcastChannel unavailable:', err);
      }
    }
  }

  /**
   * Connect to the WebSocket collaboration server
   */
  public connect(customUrl?: string): void {
    if (customUrl) {
      this.url = customUrl;
    }

    if (this.isTestingDisconnected) {
      return;
    }

    // Check if WebSocket is available in the current runtime environment
    if (typeof WebSocket === 'undefined') {
      console.warn('[WebSocketService] Native WebSocket not available in this environment');
      this.setStatus('disconnected');
      return;
    }

    // Avoid creating multiple concurrent WebSocket connections
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    this.intentionalClose = false;
    this.setStatus(this.reconnectAttempts > 0 ? 'reconnecting' : 'connecting');

    try {
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        console.info(`[WebSocketService] Connected to ${this.url}`);
        this.reconnectAttempts = 0;
        this.clearReconnectTimer();
        this.setStatus('connected');
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.dispatchMessage(data);
        } catch (err) {
          console.error('[WebSocketService] Failed to parse message:', err);
        }
      };

      this.ws.onerror = (error) => {
        // Log for development debugging without breaking UI
        console.warn('[WebSocketService] WebSocket error (normal if backend server is not running):', error);
      };

      this.ws.onclose = (event) => {
        console.info(`[WebSocketService] Closed (code: ${event.code})`);
        this.ws = null;
        if (!this.intentionalClose && !this.isTestingDisconnected) {
          this.handleConnectionLoss();
        } else {
          this.setStatus('disconnected');
        }
      };
    } catch (err) {
      console.warn('[WebSocketService] Failed to initialize WebSocket:', err);
      this.handleConnectionLoss();
    }
  }

  /**
   * Disconnect cleanly
   */
  public disconnect(): void {
    this.intentionalClose = true;
    this.clearReconnectTimer();

    if (this.ws) {
      try {
        this.ws.close(1000, 'Client disconnected');
      } catch {
        // ignore
      }
      this.ws = null;
    }

    this.setStatus('disconnected');
  }

  /**
   * Manually trigger reconnect
   */
  public reconnect(): void {
    this.isTestingDisconnected = false;
    this.disconnect();
    this.reconnectAttempts = 0;
    this.connect();
  }

  /**
   * For testing connection loss/restore
   */
  public simulateConnectionToggle(connected: boolean): void {
    this.isTestingDisconnected = !connected;
    if (!connected) {
      this.disconnect();
    } else {
      this.reconnect();
    }
  }

  /**
   * Send a collaboration message
   */
  public send(message: CollaborationMessage): void {
    const payload = JSON.stringify(message);

    // 1. Send over WebSocket if open
    if (this.ws && typeof WebSocket !== 'undefined' && this.ws.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(payload);
      } catch (err) {
        console.error('[WebSocketService] Error sending to WebSocket:', err);
      }
    }

    // 2. Broadcast to other browser windows/tabs for real-time multi-tab synchronization
    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage(message);
      } catch (err) {
        console.error('[WebSocketService] Error broadcasting to peer tabs:', err);
      }
    }
  }

  /**
   * Subscribe to specific message types (or '*' for all)
   */
  public subscribe(eventType: string, handler: MessageHandler): () => void {
    if (!this.subscribers.has(eventType)) {
      this.subscribers.set(eventType, new Set());
    }
    this.subscribers.get(eventType)!.add(handler);

    return () => this.unsubscribe(eventType, handler);
  }

  /**
   * Unsubscribe a handler
   */
  public unsubscribe(eventType: string, handler: MessageHandler): void {
    const handlers = this.subscribers.get(eventType);
    if (handlers) {
      handlers.delete(handler);
      if (handlers.size === 0) {
        this.subscribers.delete(eventType);
      }
    }
  }

  /**
   * Subscribe to connection status changes
   */
  public onStatusChange(handler: StatusHandler): () => void {
    this.statusSubscribers.add(handler);
    handler(this.status);
    return () => {
      this.statusSubscribers.delete(handler);
    };
  }

  /**
   * Get current connection status
   */
  public getStatus(): ConnectionStatus {
    return this.status;
  }

  /**
   * Get configured WebSocket URL
   */
  public getUrl(): string {
    return this.url;
  }

  /**
   * Handle connection drop with exponential backoff
   */
  private handleConnectionLoss(): void {
    this.clearReconnectTimer();

    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.setStatus('disconnected');
      return;
    }

    this.setStatus('reconnecting');
    this.reconnectAttempts++;

    const delay = Math.min(
      this.baseReconnectDelay * Math.pow(1.5, this.reconnectAttempts - 1),
      this.maxReconnectDelay
    );

    console.info(`[WebSocketService] Reconnecting in ${Math.round(delay)}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, delay);
  }

  private clearReconnectTimer(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  private setStatus(newStatus: ConnectionStatus): void {
    if (this.status !== newStatus) {
      this.status = newStatus;
      this.statusSubscribers.forEach((handler) => {
        try {
          handler(newStatus);
        } catch (err) {
          console.error('[WebSocketService] Status handler error:', err);
        }
      });
    }
  }

  private dispatchMessage(message: CollaborationMessage): void {
    // Specific event subscribers
    const handlers = this.subscribers.get(message.type);
    if (handlers) {
      handlers.forEach((handler) => {
        try {
          handler(message);
        } catch (err) {
          console.error(`[WebSocketService] Error in ${message.type} handler:`, err);
        }
      });
    }

    // Wildcard subscribers
    const wildcardHandlers = this.subscribers.get('*');
    if (wildcardHandlers) {
      wildcardHandlers.forEach((handler) => {
        try {
          handler(message);
        } catch (err) {
          console.error('[WebSocketService] Error in wildcard handler:', err);
        }
      });
    }
  }

  /**
   * Cleanup everything
   */
  public destroy(): void {
    this.disconnect();
    this.subscribers.clear();
    this.statusSubscribers.clear();
    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.close();
      } catch {
        // ignore
      }
      this.broadcastChannel = null;
    }
  }
}

// Singleton instance for global collaboration management
export const webSocketService = new WebSocketService();
