/**
 * SyncDoc Collaboration Service (Frontend Abstraction Layer)
 *
 * Week 1: Provides static & simulated collaboration data.
 * Future (Weeks 2-3): Will connect to WebSocket server (e.g. Socket.io)
 * and AST Conflict Resolution engine.
 */

import {
  mockCollaborators,
  mockConnectionInfo,
  mockNotifications,
  mockActiveConflict,
  mockVersionHistory,
} from '../data/mockCollaborationData';

class CollaborationService {
  constructor() {
    this.listeners = new Map();
  }

  // Get initial static / mock state
  getInitialState() {
    return {
      collaborators: [...mockCollaborators],
      connectionInfo: { ...mockConnectionInfo },
      notifications: [...mockNotifications],
      activeConflict: { ...mockActiveConflict },
      versionHistory: [...mockVersionHistory],
    };
  }

  // Event subscription for future WebSocket events
  subscribe(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);

    return () => {
      if (this.listeners.has(event)) {
        this.listeners.get(event).delete(callback);
      }
    };
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach((cb) => cb(data));
    }
  }

  // Mock method: Simulate incoming user presence update from WebSocket
  simulateUserPresence(userId, status, currentBlockId) {
    this.emit('presence_change', { userId, status, currentBlockId });
  }

  // Mock method: Simulate conflict event from backend AST comparison engine
  simulateConflictDetected(conflictData) {
    this.emit('conflict_detected', conflictData);
  }
}

export const collaborationService = new CollaborationService();
export default collaborationService;
