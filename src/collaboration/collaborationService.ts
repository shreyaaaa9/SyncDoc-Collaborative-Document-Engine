import { webSocketService, WebSocketService } from './websocketService';
import { yjsService, YjsService } from './yjsService';
import { presenceService, PresenceService } from './presenceService';
import type {
  Collaborator,
  CollaborationNotification,
  ConnectionStatus,
  CollaborationMessage,
  JoinRoomMessage,
  LeaveRoomMessage,
  PresenceMessage,
  DocUpdateMessage,
  SyncRequestMessage,
  SyncResponseMessage,
} from './types';

type NotificationListener = (notification: CollaborationNotification) => void;
type ContentListener = (content: string, isRemote: boolean) => void;

export class CollaborationService {
  private ws: WebSocketService;
  private yjs: YjsService;
  private presence: PresenceService;

  private currentDocId: string | null = null;
  private currentUser: Collaborator | null = null;
  private heartbeatInterval: ReturnType<typeof setInterval> | null = null;
  private notificationListeners: Set<NotificationListener> = new Set();
  private contentListeners: Set<ContentListener> = new Set();
  private unsubscribers: Array<() => void> = [];
  private previousStatus: ConnectionStatus = 'disconnected';

  constructor(
    wsInstance: WebSocketService = webSocketService,
    yjsInstance: YjsService = yjsService,
    presenceInstance: PresenceService = presenceService
  ) {
    this.ws = wsInstance;
    this.yjs = yjsInstance;
    this.presence = presenceInstance;

    this.setupSocketListeners();
  }

  /**
   * Set up message subscribers and connection watchers
   */
  private setupSocketListeners(): void {
    // Watch status transitions for notifications & auto-rejoin
    const unsubStatus = this.ws.onStatusChange((status) => {
      if (this.previousStatus !== status) {
        if (status === 'connected') {
          if (this.previousStatus === 'reconnecting' || this.previousStatus === 'disconnected') {
            this.pushNotification('Reconnected to collaboration server', 'connection');
            // 7 & 8: When connection restored, rejoin current room & resume sync
            if (this.currentDocId && this.currentUser) {
              this.sendJoinRoom(this.currentDocId, this.currentUser);
            }
          } else {
            this.pushNotification('Connected to collaboration server', 'connection');
          }
        } else if (status === 'disconnected') {
          this.pushNotification('Connection lost. Working offline', 'connection');
        } else if (status === 'reconnecting') {
          this.pushNotification('Reconnecting to collaboration server...', 'connection');
        }
        this.previousStatus = status;
      }
    });
    this.unsubscribers.push(unsubStatus);

    // Subscribe to all incoming room messages
    const unsubMessages = this.ws.subscribe('*', (msg) => {
      this.handleIncomingMessage(msg);
    });
    this.unsubscribers.push(unsubMessages);

    // Subscribe to local Y.Doc updates to broadcast to peers
    const unsubYjs = this.yjs.onUpdate((event) => {
      if (!event.isRemote && this.currentDocId && this.currentUser) {
        // Broadcast local update to WebSocket / peers
        const updateMsg: DocUpdateMessage = {
          type: 'doc-update',
          documentId: this.currentDocId,
          senderId: this.currentUser.id,
          timestamp: Date.now(),
          update: event.updateBase64,
          source: 'yjs',
          content: event.content,
        };
        this.ws.send(updateMsg);
      }

      // Notify content listeners (e.g. editor area)
      this.contentListeners.forEach((listener) => {
        try {
          listener(event.content, event.isRemote);
        } catch (err) {
          console.error('[CollaborationService] Error in content listener:', err);
        }
      });
    });
    this.unsubscribers.push(unsubYjs);
  }

  /**
   * 5. Join a document collaboration room
   */
  public joinDocument(
    documentId: string,
    user: { id: string; name: string; email?: string; avatarUrl?: string },
    initialContent?: string
  ): void {
    if (this.currentDocId === documentId && this.currentUser?.id === user.id) {
      return;
    }

    // Leave any prior document
    if (this.currentDocId && this.currentDocId !== documentId) {
      this.leaveDocument();
    }

    this.currentDocId = documentId;
    this.currentUser = this.presence.setCurrentUser(user);

    // Initialize Yjs shared document
    this.yjs.initializeDocument(documentId, initialContent);

    // Connect WebSocket if not connected
    this.ws.connect();

    // Send room join message
    this.sendJoinRoom(documentId, this.currentUser);

    // Start presence heartbeat (every 8 seconds)
    this.startHeartbeat();

    // Request initial synchronized state from existing peers
    this.sendSyncRequest();
  }

  /**
   * 18. Leave the document room cleanly
   */
  public leaveDocument(): void {
    if (!this.currentDocId) return;

    const docId = this.currentDocId;
    const userId = this.currentUser?.id || 'unknown';

    // Notify peers that user is leaving
    const leaveMsg: LeaveRoomMessage = {
      type: 'leave-room',
      documentId: docId,
      userId,
      senderId: userId,
      timestamp: Date.now(),
    };
    this.ws.send(leaveMsg);

    // Stop heartbeat
    this.stopHeartbeat();

    // Reset presence
    this.presence.reset();

    // Clean up current doc
    this.currentDocId = null;
  }

  /**
   * Send local content edit from editor
   */
  public updateContent(html: string): void {
    this.yjs.setLocalContent(html);
  }

  /**
   * Handle incoming collaboration messages
   */
  private handleIncomingMessage(message: CollaborationMessage): void {
    // Ignore messages intended for different documents
    if (message.documentId !== this.currentDocId) {
      return;
    }

    // Ignore messages sent by ourselves
    if (message.senderId === this.currentUser?.id) {
      return;
    }

    switch (message.type) {
      case 'join-room': {
        const peer = message.user;
        this.presence.handlePeerPresence(peer);
        this.pushNotification(`${peer.name} joined the document`, 'join');

        // Respond with our presence so the joining peer knows we are here
        if (this.currentUser && this.currentDocId) {
          const presenceMsg: PresenceMessage = {
            type: 'presence',
            documentId: this.currentDocId,
            senderId: this.currentUser.id,
            user: this.currentUser,
            timestamp: Date.now(),
          };
          this.ws.send(presenceMsg);

          // Also share current synchronized content if requested or available
          const currentContent = this.yjs.getContent();
          if (currentContent) {
            const syncMsg: SyncResponseMessage = {
              type: 'sync-response',
              documentId: this.currentDocId,
              senderId: this.currentUser.id,
              content: currentContent,
              timestamp: Date.now(),
            };
            this.ws.send(syncMsg);
          }
        }
        break;
      }

      case 'leave-room': {
        const peer = this.presence.handlePeerLeave(message.userId);
        if (peer) {
          this.pushNotification(`${peer.name} left the document`, 'leave');
        }
        break;
      }

      case 'presence': {
        this.presence.handlePeerPresence(message.user);
        break;
      }

      case 'doc-update': {
        // 14. Apply remote update without re-broadcasting
        this.yjs.applyRemoteUpdate(message.update, message.content);
        break;
      }

      case 'sync-request': {
        // Peer requested current document state
        const currentContent = this.yjs.getContent();
        if (currentContent && this.currentUser && this.currentDocId) {
          const syncResp: SyncResponseMessage = {
            type: 'sync-response',
            documentId: this.currentDocId,
            senderId: this.currentUser.id,
            content: currentContent,
            timestamp: Date.now(),
          };
          this.ws.send(syncResp);
        }
        break;
      }

      case 'sync-response': {
        if (message.content) {
          this.yjs.applyRemoteUpdate(message.update, message.content);
          this.pushNotification('Document synchronized', 'sync');
        }
        break;
      }

      case 'notification': {
        this.pushNotification(message.message, 'sync');
        break;
      }
    }
  }

  private sendJoinRoom(documentId: string, user: Collaborator): void {
    // TODO: Connect to backend API - customize payload if backend team defines specific schema
    const joinMsg: JoinRoomMessage = {
      type: 'join-room',
      documentId,
      senderId: user.id,
      user,
      timestamp: Date.now(),
    };
    this.ws.send(joinMsg);
  }

  private sendSyncRequest(): void {
    if (!this.currentDocId || !this.currentUser) return;
    const req: SyncRequestMessage = {
      type: 'sync-request',
      documentId: this.currentDocId,
      senderId: this.currentUser.id,
      timestamp: Date.now(),
    };
    this.ws.send(req);
  }

  private startHeartbeat(): void {
    this.stopHeartbeat();
    this.heartbeatInterval = setInterval(() => {
      if (this.currentDocId && this.currentUser) {
        const presenceMsg: PresenceMessage = {
          type: 'presence',
          documentId: this.currentDocId,
          senderId: this.currentUser.id,
          user: this.currentUser,
          timestamp: Date.now(),
        };
        this.ws.send(presenceMsg);
      }
    }, 8000);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  private pushNotification(message: string, type: CollaborationNotification['type']): void {
    const notification: CollaborationNotification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      message,
      type,
      timestamp: Date.now(),
    };

    this.notificationListeners.forEach((listener) => {
      try {
        listener(notification);
      } catch (err) {
        console.error('[CollaborationService] Error in notification listener:', err);
      }
    });
  }

  // --- Public Subscription Methods ---

  public onContentChange(listener: ContentListener): () => void {
    this.contentListeners.add(listener);
    return () => {
      this.contentListeners.delete(listener);
    };
  }

  public onCollaboratorsChange(listener: (collaborators: Collaborator[]) => void): () => void {
    return this.presence.subscribe(listener);
  }

  public onStatusChange(listener: (status: ConnectionStatus) => void): () => void {
    return this.ws.onStatusChange(listener);
  }

  public onNotification(listener: NotificationListener): () => void {
    this.notificationListeners.add(listener);
    return () => {
      this.notificationListeners.delete(listener);
    };
  }

  public getStatus(): ConnectionStatus {
    return this.ws.getStatus();
  }

  public getCollaborators(): Collaborator[] {
    return this.presence.getCollaborators();
  }

  public getCurrentUser(): Collaborator | null {
    return this.currentUser;
  }

  public reconnect(): void {
    this.ws.reconnect();
  }

  public simulateConnectionToggle(connected: boolean): void {
    this.ws.simulateConnectionToggle(connected);
  }

  public destroy(): void {
    this.leaveDocument();
    this.unsubscribers.forEach((unsub) => unsub());
    this.unsubscribers = [];
    this.notificationListeners.clear();
    this.contentListeners.clear();
  }
}

export const collaborationService = new CollaborationService();
