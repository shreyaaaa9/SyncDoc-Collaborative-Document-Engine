import { useState, useCallback, useEffect } from 'react';
import {
  INITIAL_COLLABORATORS,
  COLLABORATOR_COLORS,
  PresenceStatus,
  UserRoles,
} from '../types/collaboration';

export const useCollaboration = (onNotify) => {
  const [collaborators, setCollaborators] = useState(INITIAL_COLLABORATORS);
  const [currentUser, setCurrentUser] = useState(INITIAL_COLLABORATORS[0]);

  // Derive active collaborators
  const activeUsers = collaborators.filter((u) => u.status === PresenceStatus.ACTIVE);

  // Update current user's active block focus
  const setCurrentUserBlock = useCallback((blockId) => {
    setCollaborators((prev) =>
      prev.map((user) => (user.id === currentUser.id ? { ...user, currentBlockId: blockId } : user))
    );
  }, [currentUser.id]);

  // Simulate remote user typing / moving between blocks periodically
  useEffect(() => {
    const timer = setInterval(() => {
      setCollaborators((prev) => {
        return prev.map((user) => {
          if (user.isSelf) return user;

          // Occasionally toggle between Active and Idle
          const shouldToggle = Math.random() > 0.75;
          if (shouldToggle) {
            const nextStatus =
              user.status === PresenceStatus.ACTIVE
                ? PresenceStatus.IDLE
                : PresenceStatus.ACTIVE;
            return { ...user, status: nextStatus };
          }
          return user;
        });
      });
    }, 8000);

    return () => clearInterval(timer);
  }, []);

  // Simulation method: Add a new collaborator
  const simulateUserJoin = useCallback(() => {
    const mockNames = ['David Miller', 'Elena Rostova', 'Kavitha Patel', 'Marcus Aurelius'];
    const randomName = mockNames[Math.floor(Math.random() * mockNames.length)];
    const id = `user_${Date.now()}`;
    const color = COLLABORATOR_COLORS[Math.floor(Math.random() * COLLABORATOR_COLORS.length)];

    const newUser = {
      id,
      name: randomName,
      email: `${randomName.toLowerCase().replace(' ', '.')}@syncdoc.dev`,
      role: UserRoles.EDITOR,
      status: PresenceStatus.ACTIVE,
      color,
      currentBlockId: 'blk_demo_2',
      lastActive: new Date().toISOString(),
      isSelf: false,
    };

    setCollaborators((prev) => [...prev, newUser]);

    if (onNotify) {
      onNotify({
        type: 'user',
        title: `${randomName} joined the document`,
        message: 'Granted Editor access to active session',
      });
    }
  }, [onNotify]);

  // Simulation method: Remove last collaborator
  const simulateUserLeave = useCallback(() => {
    setCollaborators((prev) => {
      const nonSelf = prev.filter((u) => !u.isSelf);
      if (nonSelf.length === 0) return prev;

      const leavingUser = nonSelf[nonSelf.length - 1];
      if (onNotify) {
        onNotify({
          type: 'info',
          title: `${leavingUser.name} left the document`,
          message: 'Disconnected from collaborative session',
        });
      }
      return prev.filter((u) => u.id !== leavingUser.id);
    });
  }, [onNotify]);

  return {
    collaborators,
    activeUsers,
    currentUser,
    setCurrentUserBlock,
    simulateUserJoin,
    simulateUserLeave,
  };
};
