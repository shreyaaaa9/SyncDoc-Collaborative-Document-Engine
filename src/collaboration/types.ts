/**
 * Collaboration and Real-Time Synchronization Types
 */

export type ConnectionStatus =
  | 'connecting'
  | 'connected'
  | 'disconnected'
  | 'reconnecting';

export interface Collaborator {
  id: string;
  name: string;
  avatar?: string;
  email?: string;
  color: string;
  status: 'online' | 'offline' | 'idle';
  lastActive: number;
  currentSection?: string;
}

export interface CollaborationNotification {
  id: string;
  message: string;
  type: 'join' | 'leave' | 'connection' | 'sync';
  timestamp: number;
}

export type CollaborationMessageType =
  | 'join-room'
  | 'leave-room'
  | 'presence'
  | 'doc-update'
  | 'sync-request'
  | 'sync-response'
  | 'notification';

export interface BaseCollaborationMessage {
  type: CollaborationMessageType;
  documentId: string;
  senderId: string;
  timestamp: number;
}

export interface JoinRoomMessage extends BaseCollaborationMessage {
  type: 'join-room';
  user: Collaborator;
}

export interface LeaveRoomMessage extends BaseCollaborationMessage {
  type: 'leave-room';
  userId: string;
}

export interface PresenceMessage extends BaseCollaborationMessage {
  type: 'presence';
  user: Collaborator;
}

export interface DocUpdateMessage extends BaseCollaborationMessage {
  type: 'doc-update';
  update: string; // Base64 or serialized JSON delta
  source?: 'yjs' | 'html';
  content?: string;
}

export interface SyncRequestMessage extends BaseCollaborationMessage {
  type: 'sync-request';
}

export interface SyncResponseMessage extends BaseCollaborationMessage {
  type: 'sync-response';
  content: string;
  update?: string;
}

export interface NotificationMessage extends BaseCollaborationMessage {
  type: 'notification';
  message: string;
  level?: 'info' | 'success' | 'warning';
}

export type CollaborationMessage =
  | JoinRoomMessage
  | LeaveRoomMessage
  | PresenceMessage
  | DocUpdateMessage
  | SyncRequestMessage
  | SyncResponseMessage
  | NotificationMessage;
