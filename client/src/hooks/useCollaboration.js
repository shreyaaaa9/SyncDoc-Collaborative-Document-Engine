import { useState, useCallback, useEffect } from 'react';
import {
  mockCollaborators,
  mockConnectionInfo,
  mockNotifications,
  mockActiveConflict,
  mockVersionHistory,
  PresenceStatus,
} from '../data/mockCollaborationData';

/**
 * useCollaboration
 * Core hook managing collaboration UI state for Week 1:
 * - Collaborators list & presence states
 * - Connection status (connected / connecting / disconnected)
 * - Collaboration notifications queue
 * - Conflict detection state & resolution handling
 * - Document version history
 */
export const useCollaboration = (onDocumentUpdate) => {
  const [collaborators, setCollaborators] = useState(mockCollaborators);
  const [currentUser] = useState(mockCollaborators[0]); // Kirubakar (You)
  const [connectionStatus, setConnectionStatus] = useState(mockConnectionInfo.status);
  const [lastSynchronized, setLastSynchronized] = useState(mockConnectionInfo.lastSynchronized);
  const [latencyMs, setLatencyMs] = useState(mockConnectionInfo.latencyMs);

  const [notifications, setNotifications] = useState(mockNotifications);
  const [activeConflict, setActiveConflict] = useState(mockActiveConflict);
  const [isConflictModalOpen, setIsConflictModalOpen] = useState(false);
  const [versionHistory, setVersionHistory] = useState(mockVersionHistory);

  // Derived: Active users
  const activeUsers = collaborators.filter((u) => u.status !== PresenceStatus.OFFLINE);

  // Add toast notification
  const addNotification = useCallback((notification) => {
    const id = `notif_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const newNotif = {
      ...notification,
      id,
      timestamp: notification.timestamp || 'Just now',
    };
    setNotifications((prev) => [newNotif, ...prev.slice(0, 4)]);

    // Auto dismiss after 5 seconds
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 5000);
  }, []);

  // Dismiss toast
  const dismissNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  // Set user active block
  const setCurrentUserBlock = useCallback((blockId) => {
    setCollaborators((prev) =>
      prev.map((u) => (u.isSelf ? { ...u, currentBlockId: blockId } : u))
    );
  }, []);

  // Handle conflict resolution
  const resolveConflict = useCallback((blockId, resolutionChoice) => {
    let resolvedContent = '';
    if (resolutionChoice === 'mine') {
      resolvedContent = activeConflict?.yourVersion || '';
    } else if (resolutionChoice === 'latest') {
      resolvedContent = activeConflict?.latestVersion || '';
    } else {
      // Review later — just close modal
      setIsConflictModalOpen(false);
      return;
    }

    // If a document updater was provided, update the actual block content in the editor
    if (onDocumentUpdate && blockId && resolvedContent) {
      onDocumentUpdate(blockId, resolvedContent);
    }

    // Clear active conflict
    setActiveConflict(null);
    setIsConflictModalOpen(false);

    // Show required feedback message
    addNotification({
      type: 'success',
      title: 'Resolved',
      message: 'Conflict marked as resolved.',
    });
  }, [activeConflict, onDocumentUpdate, addNotification]);

  // Simulate user joined event
  const simulateUserJoin = useCallback(() => {
    const mockGuest = {
      id: `user_guest_${Date.now()}`,
      name: 'Sneha Rao',
      avatar: 'S',
      role: 'Collaborator',
      status: PresenceStatus.ONLINE,
      activity: 'Viewing',
      currentBlockId: null,
      color: '#ec4899', // Pink
      isSelf: false,
    };

    setCollaborators((prev) => [...prev, mockGuest]);
    addNotification({
      type: 'success',
      title: 'User joined',
      message: `${mockGuest.name} joined the document`,
    });
  }, [addNotification]);

  // Simulate user left event
  const simulateUserLeave = useCallback((userId) => {
    setCollaborators((prev) => {
      const user = prev.find((u) => u.id === userId && !u.isSelf);
      if (user) {
        addNotification({
          type: 'info',
          title: 'User left',
          message: `${user.name} left the document`,
        });
        return prev.filter((u) => u.id !== userId);
      }
      return prev;
    });
  }, [addNotification]);

  // Simulate conflict trigger for testing
  const triggerConflict = useCallback(() => {
    setActiveConflict(mockActiveConflict);
    addNotification({
      type: 'conflict',
      title: 'Conflict',
      message: 'A possible editing conflict was detected',
    });
  }, [addNotification]);

  // Handle restoring a version
  const restoreVersion = useCallback((version) => {
    if (onDocumentUpdate && version.previewContent) {
      onDocumentUpdate('__FULL_RESTORE__', version.previewContent);
    }
    addNotification({
      type: 'success',
      title: 'Version Restored',
      message: `Document restored to snapshot ${version.versionNumber}`,
    });
  }, [onDocumentUpdate, addNotification]);

  return {
    collaborators,
    activeUsers,
    currentUser,
    connectionStatus,
    lastSynchronized,
    latencyMs,
    setConnectionStatus,
    notifications,
    addNotification,
    dismissNotification,
    activeConflict,
    isConflictModalOpen,
    setIsConflictModalOpen,
    resolveConflict,
    versionHistory,
    restoreVersion,
    simulateUserJoin,
    simulateUserLeave,
    triggerConflict,
    setCurrentUserBlock,
  };
};

export default useCollaboration;
