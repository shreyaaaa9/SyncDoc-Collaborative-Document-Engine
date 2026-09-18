import { useState, useCallback } from 'react';
import { INITIAL_HISTORY } from '../types/collaboration';

export const useDocumentHistory = (currentDoc, onRestoreSnapshot, onNotify) => {
  const [history, setHistory] = useState(INITIAL_HISTORY);
  const [isOpen, setIsOpen] = useState(false);
  const [previewVersion, setPreviewVersion] = useState(null);

  const toggleHistory = useCallback(() => {
    setIsOpen((prev) => !prev);
    setPreviewVersion(null);
  }, []);

  // Save a new revision snapshot point
  const recordSnapshot = useCallback(
    (summaryText, author = 'Kirub (You)') => {
      if (!currentDoc) return;
      const newVersionNumber = `v1.${history.length}`;
      const newSnapshot = {
        versionId: `v_${Date.now()}`,
        versionNumber: newVersionNumber,
        timestamp: 'Just now',
        author,
        summary: summaryText || 'Automatic AST checkpoint snapshot',
        blocksCount: currentDoc.blocks ? currentDoc.blocks.length : 0,
        blocksSnapshot: JSON.parse(JSON.stringify(currentDoc.blocks || [])),
        isCurrent: true,
      };

      setHistory((prev) => [
        newSnapshot,
        ...prev.map((item) => ({ ...item, isCurrent: false })),
      ]);

      if (onNotify) {
        onNotify({
          type: 'success',
          title: `Snapshot ${newVersionNumber} Created`,
          message: newSnapshot.summary,
        });
      }
    },
    [currentDoc, history.length, onNotify]
  );

  // Restore revision to active editor
  const restoreVersion = useCallback(
    (versionItem) => {
      if (onRestoreSnapshot && versionItem.blocksSnapshot) {
        onRestoreSnapshot(versionItem.blocksSnapshot);
      }
      setHistory((prev) =>
        prev.map((item) => ({
          ...item,
          isCurrent: item.versionId === versionItem.versionId,
        }))
      );
      setPreviewVersion(null);

      if (onNotify) {
        onNotify({
          type: 'info',
          title: `Restored ${versionItem.versionNumber}`,
          message: `Document state reverted to snapshot by ${versionItem.author}`,
        });
      }
    },
    [onRestoreSnapshot, onNotify]
  );

  return {
    history,
    isOpen,
    toggleHistory,
    previewVersion,
    setPreviewVersion,
    recordSnapshot,
    restoreVersion,
  };
};
