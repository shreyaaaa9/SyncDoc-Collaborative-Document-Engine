import { useState, useCallback } from 'react';

export const useConflictResolver = (onResolveBlock, onNotify) => {
  const [activeConflict, setActiveConflict] = useState(null);

  // Trigger a conflict (simulated or via incoming WebSocket message in Week 2)
  const triggerConflict = useCallback(
    ({ blockId, blockType, localContent, remoteContent, remoteAuthor }) => {
      const conflict = {
        id: `conf_${Date.now()}`,
        blockId,
        blockType: blockType || 'paragraph',
        localContent: localContent || '',
        remoteContent: remoteContent || '',
        remoteAuthor: remoteAuthor || 'Shreya Sharma',
        timestamp: new Date().toLocaleTimeString(),
      };
      setActiveConflict(conflict);

      if (onNotify) {
        onNotify({
          type: 'warning',
          title: 'Concurrent Edit Conflict Detected',
          message: `Conflict on block with edits from ${conflict.remoteAuthor}`,
        });
      }
    },
    [onNotify]
  );

  // Resolution 1: Keep local changes
  const resolveKeepLocal = useCallback(() => {
    if (!activeConflict) return;
    if (onResolveBlock) {
      onResolveBlock(activeConflict.blockId, activeConflict.localContent);
    }
    if (onNotify) {
      onNotify({
        type: 'success',
        title: 'Conflict Resolved',
        message: 'Kept local version and broadcasted AST update',
      });
    }
    setActiveConflict(null);
  }, [activeConflict, onResolveBlock, onNotify]);

  // Resolution 2: Accept incoming remote version
  const resolveAcceptRemote = useCallback(() => {
    if (!activeConflict) return;
    if (onResolveBlock) {
      onResolveBlock(activeConflict.blockId, activeConflict.remoteContent);
    }
    if (onNotify) {
      onNotify({
        type: 'success',
        title: 'Conflict Resolved',
        message: `Accepted remote version from ${activeConflict.remoteAuthor}`,
      });
    }
    setActiveConflict(null);
  }, [activeConflict, onResolveBlock, onNotify]);

  // Resolution 3: Smart merge both versions
  const resolveMergeBoth = useCallback(() => {
    if (!activeConflict) return;
    const mergedContent = `${activeConflict.localContent}\n\n[Merged Remote Edit by ${activeConflict.remoteAuthor}]:\n${activeConflict.remoteContent}`;
    if (onResolveBlock) {
      onResolveBlock(activeConflict.blockId, mergedContent);
    }
    if (onNotify) {
      onNotify({
        type: 'success',
        title: 'Conflict Resolved',
        message: 'Merged local and remote changes successfully',
      });
    }
    setActiveConflict(null);
  }, [activeConflict, onResolveBlock, onNotify]);

  const dismissConflict = useCallback(() => {
    setActiveConflict(null);
  }, []);

  return {
    activeConflict,
    triggerConflict,
    resolveKeepLocal,
    resolveAcceptRemote,
    resolveMergeBoth,
    dismissConflict,
    hasConflict: !!activeConflict,
  };
};
