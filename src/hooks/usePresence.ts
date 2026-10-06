import { useState, useEffect } from 'react';
import { collaborationService } from '../collaboration/collaborationService';
import type { Collaborator } from '../collaboration/types';

export const usePresence = () => {
  const [collaborators, setCollaborators] = useState<Collaborator[]>(
    collaborationService.getCollaborators()
  );

  useEffect(() => {
    const unsubscribe = collaborationService.onCollaboratorsChange((updatedList) => {
      setCollaborators(updatedList);
    });
    return unsubscribe;
  }, []);

  const currentUser = collaborationService.getCurrentUser();

  return {
    collaborators,
    currentUser,
    count: collaborators.length,
  };
};
