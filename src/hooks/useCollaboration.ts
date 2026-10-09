import { useState, useEffect, useCallback, useRef } from 'react';
import { collaborationService } from '../collaboration/collaborationService';
import type {
  ConnectionStatus,
  Collaborator,
  CollaborationNotification,
} from '../collaboration/types';
import type { User } from '../types/document';

interface UseCollaborationOptions {
  documentId?: string;
  initialContent?: string;
  user: User;
}

export const useCollaboration = ({
  documentId,
  initialContent,
  user,
}: UseCollaborationOptions) => {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>(
    collaborationService.getStatus()
  );
  const [collaborators, setCollaborators] = useState<Collaborator[]>(
    collaborationService.getCollaborators()
  );
  const [documentContent, setDocumentContent] = useState<string>(initialContent || '');
  const [notifications, setNotifications] = useState<CollaborationNotification[]>([]);

  const initialContentRef = useRef(initialContent);
  const userRef = useRef(user);
  userRef.current = user;

  // Join document room and clean up on unmount or id change
  useEffect(() => {
    if (!documentId) return;

    // Join room with current user and content
    collaborationService.joinDocument(documentId, userRef.current, initialContentRef.current);

    // Subscribe to status changes
    const unsubStatus = collaborationService.onStatusChange((newStatus) => {
      setConnectionStatus(newStatus);
    });

    // Subscribe to collaborator presence changes
    const unsubCollab = collaborationService.onCollaboratorsChange((newList) => {
      setCollaborators(newList);
    });

    // Subscribe to remote content synchronization
    const unsubContent = collaborationService.onContentChange((newHtml) => {
      setDocumentContent(newHtml);
    });

    // Subscribe to notifications
    const unsubNotif = collaborationService.onNotification((notification) => {
      setNotifications((prev) => [notification, ...prev.slice(0, 4)]);
      // Auto-dismiss after 4.5 seconds
      setTimeout(() => {
        setNotifications((prev) => prev.filter((n) => n.id !== notification.id));
      }, 4500);
    });

    return () => {
      unsubStatus();
      unsubCollab();
      unsubContent();
      unsubNotif();
      collaborationService.leaveDocument();
    };
  }, [documentId, user.id]);

  // Send local user edit to collaboration service
  const sendUpdate = useCallback((newHtml: string) => {
    collaborationService.updateContent(newHtml);
  }, []);

  const dismissNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const reconnect = useCallback(() => {
    collaborationService.reconnect();
  }, []);

  const leaveDocument = useCallback(() => {
    collaborationService.leaveDocument();
  }, []);

  return {
    connectionStatus,
    collaborators,
    documentContent,
    notifications,
    currentUser: collaborationService.getCurrentUser(),
    dismissNotification,
    sendUpdate,
    reconnect,
    leaveDocument,
  };
};
