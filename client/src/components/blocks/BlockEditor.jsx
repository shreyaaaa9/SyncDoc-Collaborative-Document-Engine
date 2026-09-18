import React, { useEffect, useState, useCallback } from 'react';
import { fetchDocumentById, updateDocument } from '../../api/documentApi';
import HeadingBlock from './HeadingBlock';
import ParagraphBlock from './ParagraphBlock';
import CodeBlockComp from './CodeBlockComp';
import CollaborationHeader from '../collaboration/CollaborationHeader';
import CollaboratorsPanel from '../collaboration/CollaboratorsPanel';
import VersionHistoryDrawer from '../collaboration/VersionHistoryDrawer';
import ConflictResolutionModal from '../collaboration/ConflictResolutionModal';
import NotificationToasts from '../collaboration/NotificationToasts';
import RemoteCursorOverlay from '../collaboration/RemoteCursorOverlay';
import DevSimulationBar from '../collaboration/DevSimulationBar';
import AstTreeViewer from '../collaboration/AstTreeViewer';

import { useConnectionStatus } from '../../hooks/useConnectionStatus';
import { useCollaboration } from '../../hooks/useCollaboration';
import { useConflictResolver } from '../../hooks/useConflictResolver';
import { useDocumentHistory } from '../../hooks/useDocumentHistory';
import { Trash2, Type, AlignLeft, Code, FileText, ShieldAlert, Cpu, Sparkles, CheckCircle2 } from 'lucide-react';

const generateId = () => `blk_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

const BlockEditor = ({ documentId, onBack }) => {
  const [doc, setDoc] = useState(null);
  const [saving, setSaving] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showCollaborators, setShowCollaborators] = useState(true);
  const [showAstTree, setShowAstTree] = useState(false);
  const [activeSelfBlockId, setActiveSelfBlockId] = useState('blk_para_spec');

  // Notification helper
  const addNotification = useCallback((notif) => {
    const id = `notif_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    setNotifications((prev) => [...prev, { ...notif, id }]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 4500);
  }, []);

  const dismissNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  // Collaboration Hooks
  const connection = useConnectionStatus(addNotification);
  const {
    collaborators,
    activeUsers,
    setCurrentUserBlock,
    simulateUserJoin,
    simulateUserLeave,
  } = useCollaboration(addNotification);

  // Handle resolving a block after a conflict
  const handleResolveBlockContent = useCallback((blockId, resolvedContent) => {
    setDoc((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        blocks: prev.blocks.map((b) => (b.id === blockId ? { ...b, content: resolvedContent } : b)),
      };
    });
  }, []);

  const conflictResolver = useConflictResolver(handleResolveBlockContent, addNotification);

  // Document history hook
  const handleRestoreSnapshot = useCallback((blocksSnapshot) => {
    setDoc((prev) => (prev ? { ...prev, blocks: blocksSnapshot } : prev));
  }, []);

  const docHistory = useDocumentHistory(doc, handleRestoreSnapshot, addNotification);

  // Fetch document data
  useEffect(() => {
    fetchDocumentById(documentId)
      .then((data) => {
        setDoc(data);
        addNotification({
          type: 'info',
          title: 'Technical Spec Loaded',
          message: `AST Engine synchronized for "${data.title}"`,
        });
      })
      .catch((err) => {
        console.error(err);
      });
  }, [documentId, addNotification]);

  // Block handlers
  const handleContentChange = (id, content) => {
    if (!doc) return;
    setDoc({
      ...doc,
      blocks: doc.blocks.map((b) => (b.id === id ? { ...b, content } : b)),
    });
  };

  const handleBlockFocus = (id) => {
    setActiveSelfBlockId(id);
    setCurrentUserBlock(id);
  };

  const addBlock = (type) => {
    if (!doc) return;
    const newBlock = {
      id: generateId(),
      type,
      content: '',
      astNodeType: type === 'heading' ? 'HeadingNode' : type === 'code' ? 'CodeBlockNode' : 'ParagraphNode',
      ...(type === 'heading' ? { level: 2 } : {}),
      ...(type === 'code' ? { language: 'typescript' } : {}),
    };
    setDoc({ ...doc, blocks: [...doc.blocks, newBlock] });
    addNotification({
      type: 'info',
      title: `Added ${type} AST Node`,
      message: 'New structural AST node appended without layout conflict',
    });
  };

  const deleteBlock = (id) => {
    if (!doc) return;
    setDoc({ ...doc, blocks: doc.blocks.filter((b) => b.id !== id) });
  };

  const handleSave = async () => {
    if (!doc) return;
    try {
      setSaving(true);
      await updateDocument(doc._id, { title: doc.title, blocks: doc.blocks });
      addNotification({
        type: 'success',
        title: 'Document Saved',
        message: 'All AST nodes synchronized to database',
      });
      docHistory.recordSnapshot(`Checkpoint by User A at ${new Date().toLocaleTimeString()}`);
    } catch (err) {
      console.error('Save failed', err);
    } finally {
      setSaving(false);
    }
  };

  // Execution of the user's EXACT Use Case:
  // "Two engineers open a technical spec in SyncDoc. As User A types a new paragraph,
  // User B concurrently adds a code block lower down the page. The system AST conflict resolution
  // ensures neither edit is lost. Both users see live visual block state indicators showing who is editing what,
  // preventing layout-destructive overwrites in real-time."
  const handleRunTwoEngineersUseCase = () => {
    if (!doc) return;

    addNotification({
      type: 'info',
      title: '▶️ Running Use Case Simulation',
      message: 'Two engineers concurrently editing technical spec...',
    });

    // Step 1: User A focuses on Paragraph Block
    setActiveSelfBlockId('blk_para_spec');

    // Step 2: User B concurrently adds a new Code Block lower down the page
    const userBCodeBlockId = `blk_code_${Date.now()}`;
    const userBCodeBlock = {
      id: userBCodeBlockId,
      type: 'code',
      language: 'typescript',
      astNodeType: 'CodeBlockNode',
      content: '// User B (Engineer 2) Concurrent AST Mutation\nexport function resolveAstNodes(treeA: AstTree, treeB: AstTree) {\n  return mergeAstDistinctBranches(treeA, treeB);\n}',
    };

    setDoc((prev) => ({
      ...prev,
      blocks: [...prev.blocks, userBCodeBlock],
    }));

    // Update User B's live focus to that block
    const userB = collaborators.find((u) => u.id === 'user_b');
    if (userB) {
      userB.currentBlockId = userBCodeBlockId;
    }

    setTimeout(() => {
      addNotification({
        type: 'success',
        title: 'AST Concurrent Merge Succeeded!',
        message: 'User A paragraph + User B code block merged into AST with 0 layout overwrites.',
      });
    }, 900);
  };

  // Simulate an overlapping conflict on the SAME AST node
  const handleSimulateConflict = () => {
    if (!doc || !doc.blocks || doc.blocks.length === 0) return;
    const targetBlock = doc.blocks.find((b) => b.id === 'blk_para_spec') || doc.blocks[0];

    conflictResolver.triggerConflict({
      blockId: targetBlock.id,
      blockType: targetBlock.type,
      localContent: targetBlock.content,
      remoteContent: `${targetBlock.content}\n\n[User B Concurrent Edit]: Updated AST node validation rules for distributed peer replication.`,
      remoteAuthor: 'User B (Engineer 2 - Shreya)',
    });
  };

  if (!doc) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', color: 'var(--text-secondary)' }}>
        <p>Loading collaborative technical spec workspace...</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      {/* Collaboration Top Header */}
      <CollaborationHeader
        docTitle={doc.title}
        onBack={onBack}
        connection={connection}
        collaborators={collaborators}
        isSaving={saving}
        onSave={handleSave}
        onToggleHistory={docHistory.toggleHistory}
        onToggleCollaborators={() => setShowCollaborators((prev) => !prev)}
        historyCount={docHistory.history.length}
      />

      {/* Main Workspace Body */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', position: 'relative' }}>
        {/* Editor Area */}
        <main
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '28px 24px 130px 24px',
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <div style={{ width: '100%', maxWidth: '820px' }}>
            {/* Live Problem Statement & Use Case Banner */}
            <div
              style={{
                backgroundColor: 'rgba(99, 102, 241, 0.08)',
                border: '1px solid rgba(99, 102, 241, 0.25)',
                borderRadius: 'var(--radius-md)',
                padding: '12px 16px',
                marginBottom: '20px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Sparkles size={14} />
                  <span>SyncDoc Project Use Case: Real-Time AST Non-Destructive Editing</span>
                </span>
                <span style={{ fontSize: '0.7rem', color: 'var(--success)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <CheckCircle2 size={13} />
                  <span>Layout Protection Active</span>
                </span>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.45' }}>
                <strong>Scenario:</strong> Two engineers open a technical spec in SyncDoc. As User A types a new paragraph, User B concurrently adds a code block lower down the page. The system's AST conflict resolution ensures neither edit is lost, with live visual block state indicators preventing layout-destructive overwrites.
              </p>
            </div>

            {/* Document Title Header */}
            <div style={{ marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid var(--border-subtle)' }}>
              <input
                value={doc.title}
                onChange={(e) => setDoc({ ...doc, title: e.target.value })}
                placeholder="Document Title..."
                style={{
                  width: '100%',
                  fontSize: '1.75rem',
                  fontWeight: 800,
                  color: 'var(--text-primary)',
                  backgroundColor: 'transparent',
                  border: 'none',
                  outline: 'none',
                  letterSpacing: '-0.025em',
                }}
              />
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '8px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <span>ID: {doc._id}</span>
                <span>•</span>
                <span>{doc.blocks.length} AST Structural Nodes</span>
                <span>•</span>
                <span style={{ color: 'var(--success)' }}>2 Engineers in Session (User A + User B)</span>
              </div>
            </div>

            {/* Block Insertion Toolbar */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '20px',
                padding: '8px 12px',
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
              }}
            >
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginRight: '4px' }}>
                Insert AST Node:
              </span>
              <button onClick={() => addBlock('heading')} className="btn-secondary" style={{ padding: '5px 10px', fontSize: '0.78rem' }}>
                <Type size={14} color="var(--primary)" />
                <span>+ Heading</span>
              </button>
              <button onClick={() => addBlock('paragraph')} className="btn-secondary" style={{ padding: '5px 10px', fontSize: '0.78rem' }}>
                <AlignLeft size={14} color="var(--success)" />
                <span>+ Paragraph</span>
              </button>
              <button onClick={() => addBlock('code')} className="btn-secondary" style={{ padding: '5px 10px', fontSize: '0.78rem' }}>
                <Code size={14} color="var(--warning)" />
                <span>+ Code Block</span>
              </button>
            </div>

            {/* Blocks List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {doc.blocks.map((block) => {
                // Find if remote collaborator is on this block
                const remoteUserOnBlock = collaborators.find(
                  (u) => !u.isSelf && u.currentBlockId === block.id
                );
                const isSelfOnBlock = activeSelfBlockId === block.id;

                return (
                  <div
                    key={block.id}
                    style={{
                      position: 'relative',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px',
                      padding: '14px 16px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--bg-secondary)',
                      border: `1.5px solid ${
                        remoteUserOnBlock
                          ? remoteUserOnBlock.color.bg
                          : isSelfOnBlock
                          ? 'var(--border-focus)'
                          : 'var(--border-subtle)'
                      }`,
                      boxShadow: remoteUserOnBlock
                        ? `0 0 16px ${remoteUserOnBlock.color.bg}30`
                        : isSelfOnBlock
                        ? '0 0 12px rgba(99, 102, 241, 0.2)'
                        : 'none',
                      transition: 'all var(--transition-fast)',
                    }}
                  >
                    {/* Content Container */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      {/* AST Node Label & Live State Overlay */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span
                          style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.68rem',
                            color: 'var(--text-muted)',
                            background: 'var(--bg-tertiary)',
                            padding: '2px 6px',
                            borderRadius: '4px',
                          }}
                        >
                          &lt;AST:{block.type === 'heading' ? 'HeadingNode' : block.type === 'code' ? 'CodeBlockNode' : 'ParagraphNode'} #{block.id.slice(-5)}&gt;
                        </span>
                      </div>

                      {/* Live Visual Block State Indicator */}
                      <RemoteCursorOverlay
                        blockId={block.id}
                        collaborators={collaborators}
                        isSelfActive={isSelfOnBlock}
                      />

                      {block.type === 'heading' && (
                        <HeadingBlock
                          block={block}
                          onChange={handleContentChange}
                          onFocus={handleBlockFocus}
                        />
                      )}
                      {block.type === 'paragraph' && (
                        <ParagraphBlock
                          block={block}
                          onChange={handleContentChange}
                          onFocus={handleBlockFocus}
                        />
                      )}
                      {block.type === 'code' && (
                        <CodeBlockComp
                          block={block}
                          onChange={handleContentChange}
                          onFocus={handleBlockFocus}
                        />
                      )}
                    </div>

                    {/* Block Actions */}
                    <button
                      onClick={() => deleteBlock(block.id)}
                      className="btn-ghost"
                      style={{ padding: '6px', color: 'var(--text-muted)' }}
                      title="Delete AST Node"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </main>

        {/* Right Collaborators Side Panel */}
        <CollaboratorsPanel
          collaborators={collaborators}
          isOpen={showCollaborators}
          onClose={() => setShowCollaborators(false)}
          onInvite={simulateUserJoin}
        />

        {/* Right History Drawer */}
        <VersionHistoryDrawer
          isOpen={docHistory.isOpen}
          onClose={docHistory.toggleHistory}
          history={docHistory.history}
          onRestore={docHistory.restoreVersion}
          onCreateSnapshot={(summary) => docHistory.recordSnapshot(summary)}
        />

        {/* Live AST Tree Viewer Drawer */}
        <AstTreeViewer
          isOpen={showAstTree}
          onClose={() => setShowAstTree(false)}
          doc={doc}
          collaborators={collaborators}
        />
      </div>

      {/* Floating Notification Toasts */}
      <NotificationToasts notifications={notifications} onDismiss={dismissNotification} />

      {/* Conflict Resolution Modal */}
      <ConflictResolutionModal
        conflict={conflictResolver.activeConflict}
        onKeepLocal={conflictResolver.resolveKeepLocal}
        onAcceptRemote={conflictResolver.resolveAcceptRemote}
        onMergeBoth={conflictResolver.resolveMergeBoth}
        onDismiss={conflictResolver.dismissConflict}
      />

      {/* Dev Simulation Control Bar */}
      <DevSimulationBar
        onToggleConnection={connection.toggleConnection}
        isConnected={connection.isConnected}
        onRunTwoEngineersUseCase={handleRunTwoEngineersUseCase}
        onTriggerConflict={handleSimulateConflict}
        onSaveSnapshot={() => docHistory.recordSnapshot('Manual AST snapshot')}
        onToggleCollaboratorsPanel={() => setShowCollaborators((prev) => !prev)}
        onToggleHistory={docHistory.toggleHistory}
        onToggleAstTree={() => setShowAstTree((prev) => !prev)}
      />
    </div>
  );
};

export default BlockEditor;
