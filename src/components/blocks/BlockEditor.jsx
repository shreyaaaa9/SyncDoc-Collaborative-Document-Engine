<<<<<<< HEAD
import React, { useDeferredValue, useEffect, useMemo } from 'react';
import useDocumentEditor from '../../hooks/useDocumentEditor';
import EditorToolbar from '../editor/EditorToolbar';
import SaveStatus from '../editor/SaveStatus';
import VersionBadge from '../editor/VersionBadge';
import BlockItem from './BlockItem';
import Loader from '../common/Loader';
import ErrorState from '../common/ErrorState';
import { generateTestBlocks, TEST_SIZES } from '../../utils/generateTestBlocks';
import '../../styles/editor.css';
=======
﻿import React, { useEffect, useState, useCallback } from 'react';
import { fetchDocumentById, updateDocument, getInitialDocument } from '../../api/documentApi';
import HeadingBlock from './HeadingBlock';
import ParagraphBlock from './ParagraphBlock';
import CodeBlockComp from './CodeBlockComp';

// Collaboration Components (Member 2 — Week 1)
import ConnectionStatus from '../collaboration/ConnectionStatus';
import CollaborationSidebar from '../collaboration/CollaborationSidebar';
import ConflictNotification from '../collaboration/ConflictNotification';
import ConflictResolutionModal from '../collaboration/ConflictResolutionModal';
import NotificationList from '../collaboration/NotificationList';
import PresenceIndicator from '../collaboration/PresenceIndicator';

import { useCollaboration } from '../../hooks/useCollaboration';
import {
  Trash2,
  Plus,
  ArrowLeft,
  Save,
  Users,
  AlertTriangle,
  History,
  CheckCircle2,
  Sparkles,
  Layers,
  HelpCircle,
  Menu,
} from 'lucide-react';
>>>>>>> origin/main

const EMPTY = [];

const BlockEditor = ({ documentId, onBack }) => {
<<<<<<< HEAD
  const {
    doc, loading, loadError, load,
    saveStatus, saveError, lastSavedAt, meta,
    activeBlockId, setActiveBlockId, focusBlockId,
    save, setTitle, updateBlock, addBlock, addParagraphBelow, deleteBlock, moveBlock, replaceBlocks,
  } = useDocumentEditor(documentId);

  // Word count: typing slow na korar jonno deferred
  const deferredBlocks = useDeferredValue(doc?.blocks ?? EMPTY);
  const wordCount = useMemo(
    () =>
      deferredBlocks.reduce((sum, b) => {
        const t = (b.content || '').trim();
        return sum + (t ? t.split(/\s+/).length : 0);
      }, 0),
    [deferredBlocks]
  );
    // Ctrl+S / Cmd+S to save
  useEffect(() => {
    const onKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        if (saveStatus === 'unsaved' || saveStatus === 'error') save();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [save, saveStatus]);

  if (loading) return <Loader text="Opening document..." />;
  if (loadError) return <ErrorState message={loadError} onRetry={load} onBack={onBack} />;
  if (!doc) return null;

  const handleBack = async () => {
    if (saveStatus === 'saving') return;
    if (saveStatus === 'unsaved') {
      const ok = await save();
      if (!ok && !window.confirm('Your latest changes could not be saved. Leave anyway?')) return;
    } else if (saveStatus === 'error' && !window.confirm('Your changes are not saved. Leave anyway?')) {
      return;
=======
  const [doc, setDoc] = useState(() => getInitialDocument(documentId));
  const [saving, setSaving] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [focusedBlockId, setFocusedBlockId] = useState('blk_para_2');

  // Callback to update block content from conflict resolution or history restore
  const handleDocumentUpdate = useCallback((target, newContent) => {
    setDoc((prev) => {
      if (!prev) return prev;
      if (target === '__FULL_RESTORE__') {
        return { ...prev, blocks: newContent };
      }
      return {
        ...prev,
        blocks: prev.blocks.map((b) => (b.id === target ? { ...b, content: newContent } : b)),
      };
    });
  }, []);

  // Hook for collaboration state & mock actions
  const {
    collaborators,
    activeUsers,
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
  } = useCollaboration(handleDocumentUpdate);

  // Sync document data if changed
  useEffect(() => {
    fetchDocumentById(documentId)
      .then((data) => {
        if (data) setDoc(data);
      })
      .catch((err) => {
        console.error('Failed to load document', err);
      });
  }, [documentId]);

  // Block handlers from Member 1
  const handleContentChange = (id, content) => {
    if (!doc) return;
    setDoc({
      ...doc,
      blocks: doc.blocks.map((b) => (b.id === id ? { ...b, content } : b)),
    });
  };

  const addBlock = (type) => {
    if (!doc) return;
    const newBlock = {
      id: generateId(),
      type,
      content: '',
      ...(type === 'heading' ? { level: 2 } : {}),
      ...(type === 'code' ? { language: 'javascript' } : {}),
    };
    setDoc({ ...doc, blocks: [...doc.blocks, newBlock] });
    addNotification({
      type: 'info',
      title: 'Block Added',
      message: `Added new ${type} block to document.`,
    });
  };

  const deleteBlock = (id) => {
    if (!doc) return;
    setDoc({ ...doc, blocks: doc.blocks.filter((b) => b.id !== id) });
    addNotification({
      type: 'info',
      title: 'Block Removed',
      message: 'Block deleted from document.',
    });
  };

  const handleSave = async () => {
    if (!doc) return;
    try {
      setSaving(true);
      await updateDocument(doc._id, { title: doc.title, blocks: doc.blocks });
      addNotification({
        type: 'success',
        title: 'Saved',
        message: 'Document saved successfully.',
      });
    } catch (err) {
      console.error('Save failed', err);
    } finally {
      setSaving(false);
>>>>>>> origin/main
    }
    onBack();
  };

<<<<<<< HEAD
  const blocks = doc.blocks;
  const isBusy = saveStatus === 'saving';
=======
  const handleBlockFocus = (id) => {
    setFocusedBlockId(id);
    setCurrentUserBlock(id);
  };

  if (!doc) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: '#a1a1aa' }}>
        <p>Loading document...</p>
      </div>
    );
  }
>>>>>>> origin/main

  // Active online collaborator count
  const onlineCollaboratorsCount = collaborators.filter((c) => c.status !== 'offline').length;

  return (
<<<<<<< HEAD
    <div className="editor-page">
      <div className="editor-sticky">
        <div className="editor-header">
          <button type="button" onClick={handleBack} disabled={isBusy}>← Back</button>
          <input
            className="title-input"
            value={doc.title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Untitled document"
            aria-label="Document title"
            maxLength={150}
          />
          <div className="editor-header__right">
            <VersionBadge version={meta.version} updatedAt={meta.updatedAt} />
            <SaveStatus status={saveStatus} lastSavedAt={lastSavedAt} error={saveError} />
            <button type="button" onClick={save} disabled={isBusy || saveStatus === 'saved'}>
              {isBusy ? 'Saving...' : 'Save Document'}
            </button>
          </div>
        </div>
        <EditorToolbar onAdd={(type, extra) => addBlock(type, extra, activeBlockId)} />
      </div>

      {saveStatus === 'error' && (
        <div className="banner banner--error" role="alert">
          <span>{saveError}</span>
          <button type="button" onClick={save}>Retry save</button>
        </div>
      )}

      <div className="blocks">
        {blocks.length === 0 && (
          <p className="empty-note">This document is empty. Add a heading or paragraph from the toolbar above.</p>
        )}
        {blocks.map((block, i) => (
          <BlockItem
            key={block.id || i}
            block={block}
            isFirst={i === 0}
            isLast={i === blocks.length - 1}
            isActive={block.id === activeBlockId}
            autoFocus={block.id === focusBlockId}
            onChange={updateBlock}
            onDelete={deleteBlock}
            onMove={moveBlock}
            onFocusBlock={setActiveBlockId}
            onAddParagraphBelow={addParagraphBelow}
          />
        ))}
      </div>

      <div className="editor-footer">
        <span>{blocks.length} blocks</span>
        <span>{wordCount} words</span>
        {import.meta.env.DEV && (
          <select
            defaultValue=""
            onChange={(e) => {
              if (!e.target.value) return;
              replaceBlocks(generateTestBlocks(Number(e.target.value)));
              e.target.value = '';
            }}
            aria-label="Load test content (dev only)"
            style={{ marginLeft: 'auto' }}
          >
            <option value="">Load test content (dev)</option>
            {Object.entries(TEST_SIZES).map(([k, v]) => (
              <option key={k} value={v}>{k} ({v} blocks)</option>
            ))}
          </select>
        )}
      </div>
=======
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#09090b', color: '#f4f4f5', overflow: 'hidden' }}>
      {/* Top Navigation / Collaboration Toolbar */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 20px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          backgroundColor: '#18181b',
          zIndex: 30,
        }}
      >
        {/* Left: Back & Doc Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button
            onClick={onBack}
            style={{
              padding: '6px 12px',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '8px',
              color: '#f4f4f5',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.8125rem',
            }}
            title="Return to Dashboard"
          >
            <ArrowLeft size={15} /> Dashboard
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                fontWeight: 700,
                fontSize: '0.95rem',
                color: '#f4f4f5',
                maxWidth: '280px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
              title={doc.title}
            >
              {doc.title}
            </span>
            <span
              style={{
                fontSize: '0.7rem',
                padding: '2px 6px',
                borderRadius: '4px',
                backgroundColor: 'rgba(99, 102, 241, 0.15)',
                color: '#a5b4fc',
                fontWeight: 600,
              }}
            >
              SyncDoc v1.0
            </span>
          </div>
        </div>

        {/* Center/Right: Action Buttons & Collaboration Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Quick Simulation Trigger for Testing Conflict */}
          <button
            onClick={triggerConflict}
            style={{
              padding: '6px 10px',
              fontSize: '0.75rem',
              backgroundColor: activeConflict ? 'rgba(249, 115, 22, 0.2)' : 'rgba(255, 255, 255, 0.04)',
              border: `1px solid ${activeConflict ? 'rgba(249, 115, 22, 0.5)' : 'rgba(255, 255, 255, 0.1)'}`,
              color: activeConflict ? '#fdba74' : '#a1a1aa',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
            }}
            title="Simulate / Trigger an incoming editing conflict"
          >
            <AlertTriangle size={13} color={activeConflict ? '#f97316' : '#a1a1aa'} />
            <span>{activeConflict ? 'Conflict Active' : 'Simulate Conflict'}</span>
          </button>

          {/* Connection Status Component (Top-right area of document editor toolbar) */}
          <ConnectionStatus
            status={connectionStatus}
            lastSynchronized={lastSynchronized}
            latencyMs={latencyMs}
            onChangeStatus={setConnectionStatus}
          />

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              padding: '6px 14px',
              backgroundColor: '#6366f1',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '0.8125rem',
              cursor: saving ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 8px rgba(99, 102, 241, 0.3)',
            }}
          >
            <Save size={14} /> {saving ? 'Saving...' : 'Save'}
          </button>

          {/* Sidebar Toggle Button */}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            style={{
              padding: '6px 12px',
              backgroundColor: isSidebarOpen ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255, 255, 255, 0.05)',
              border: `1px solid ${isSidebarOpen ? 'rgba(99, 102, 241, 0.3)' : 'rgba(255, 255, 255, 0.12)'}`,
              borderRadius: '8px',
              color: isSidebarOpen ? '#a5b4fc' : '#f4f4f5',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.8125rem',
              fontWeight: 600,
            }}
            title="Toggle Collaboration Panel"
            aria-label="Toggle Collaboration Panel"
          >
            <Users size={15} />
            <span className="sidebar-btn-text">Collaborators</span>
            <span
              style={{
                fontSize: '0.675rem',
                padding: '1px 6px',
                borderRadius: '999px',
                backgroundColor: 'rgba(16, 185, 129, 0.2)',
                color: '#34d399',
              }}
            >
              {onlineCollaboratorsCount}
            </span>
          </button>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', position: 'relative' }}>
        {/* Editor Main Content Area */}
        <main
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '30px 24px 80px 24px',
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <div style={{ width: '100%', maxWidth: '760px' }}>
            {/* Conflict Notification Banner (Section 5) */}
            {activeConflict && (
              <ConflictNotification
                conflict={activeConflict}
                onReviewChanges={() => setIsConflictModalOpen(true)}
                onKeepMine={() => resolveConflict(activeConflict.blockId, 'mine')}
                onUseLatest={() => resolveConflict(activeConflict.blockId, 'latest')}
                onResolveLater={() => resolveConflict(activeConflict.blockId, 'later')}
              />
            )}

            {/* Document Title Header */}
            <div style={{ marginBottom: '24px' }}>
              <input
                value={doc.title}
                onChange={(e) => setDoc({ ...doc, title: e.target.value })}
                placeholder="Document Title"
                style={{
                  fontSize: '1.75rem',
                  fontWeight: 800,
                  width: '100%',
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: '#f4f4f5',
                  padding: '4px 0',
                }}
              />
            </div>

            {/* Add Block Toolbar (Preserving Member 1 Functionality) */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '24px',
                padding: '8px 12px',
                backgroundColor: '#18181b',
                borderRadius: '10px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                flexWrap: 'wrap',
              }}
            >
              <span style={{ fontSize: '0.75rem', color: '#a1a1aa', marginRight: '6px', fontWeight: 600 }}>
                + Add Block:
              </span>
              <button
                onClick={() => addBlock('heading')}
                style={{
                  padding: '5px 10px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '6px',
                  color: '#f4f4f5',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                }}
              >
                + Heading
              </button>
              <button
                onClick={() => addBlock('paragraph')}
                style={{
                  padding: '5px 10px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '6px',
                  color: '#f4f4f5',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                }}
              >
                + Paragraph
              </button>
              <button
                onClick={() => addBlock('code')}
                style={{
                  padding: '5px 10px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '6px',
                  color: '#f4f4f5',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                }}
              >
                + Code Block
              </button>
            </div>

            {/* Empty State */}
            {doc.blocks.length === 0 && (
              <div
                style={{
                  padding: '40px 20px',
                  textAlign: 'center',
                  border: '2px dashed rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                  color: '#71717a',
                }}
              >
                No blocks yet. Use the buttons above to add structured blocks.
              </div>
            )}

            {/* Document Blocks List with Live Presence Indicators (Section 2) */}
            {doc.blocks.map((block, index) => {
              // Check collaborators on this block
              const isArjunEditing = block.id === 'blk_para_2' || (block.type === 'paragraph' && index === 2);
              const isPriyaEditing = block.id === 'blk_code_1' || block.type === 'code';
              const isSelfActive = focusedBlockId === block.id;

              return (
                <div
                  key={block.id}
                  onClick={() => handleBlockFocus(block.id)}
                  style={{
                    position: 'relative',
                    marginBottom: '16px',
                    borderRadius: '12px',
                    backgroundColor: isArjunEditing
                      ? 'rgba(16, 185, 129, 0.03)'
                      : isPriyaEditing
                      ? 'rgba(245, 158, 11, 0.03)'
                      : isSelfActive
                      ? 'rgba(99, 102, 241, 0.03)'
                      : '#18181b',
                    border: `1px solid ${
                      isArjunEditing
                        ? 'rgba(16, 185, 129, 0.4)'
                        : isPriyaEditing
                        ? 'rgba(245, 158, 11, 0.4)'
                        : isSelfActive
                        ? 'rgba(99, 102, 241, 0.4)'
                        : 'rgba(255, 255, 255, 0.08)'
                    }`,
                    padding: '16px',
                    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                    boxShadow: isArjunEditing
                      ? '0 0 15px -3px rgba(16, 185, 129, 0.15)'
                      : isPriyaEditing
                      ? '0 0 15px -3px rgba(245, 158, 11, 0.15)'
                      : 'none',
                  }}
                  className="document-block-container"
                >
                  {/* Top Block Header: Block type & Live Presence Indicators (Section 2) */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '10px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span
                        style={{
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          color: '#a1a1aa',
                        }}
                      >
                        {block.type === 'heading' ? `Heading ${block.level || 2}` : block.type === 'paragraph' ? `Paragraph ${index}` : 'Code Block'}
                      </span>

                      {/* Presence Indicator Concept from Section 2 */}
                      {isArjunEditing && (
                        <div
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            backgroundColor: 'rgba(16, 185, 129, 0.15)',
                            border: '1px solid rgba(16, 185, 129, 0.3)',
                            padding: '2px 8px',
                            borderRadius: '999px',
                            fontSize: '0.725rem',
                            color: '#34d399',
                            fontWeight: 600,
                          }}
                        >
                          <PresenceIndicator status="online" size="sm" pulse={true} />
                          <span>Arjun is editing this block</span>
                        </div>
                      )}

                      {isPriyaEditing && (
                        <div
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            backgroundColor: 'rgba(245, 158, 11, 0.15)',
                            border: '1px solid rgba(245, 158, 11, 0.3)',
                            padding: '2px 8px',
                            borderRadius: '999px',
                            fontSize: '0.725rem',
                            color: '#fbbf24',
                            fontWeight: 600,
                          }}
                        >
                          <PresenceIndicator status="viewing" size="sm" pulse={false} />
                          <span>🟢 Priya is editing</span>
                        </div>
                      )}

                      {!isArjunEditing && !isPriyaEditing && isSelfActive && (
                        <div
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            backgroundColor: 'rgba(99, 102, 241, 0.12)',
                            border: '1px solid rgba(99, 102, 241, 0.25)',
                            padding: '2px 8px',
                            borderRadius: '999px',
                            fontSize: '0.725rem',
                            color: '#a5b4fc',
                          }}
                        >
                          <span>Editing (You)</span>
                        </div>
                      )}
                    </div>

                    {/* Delete Block Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteBlock(block.id);
                      }}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#71717a',
                        cursor: 'pointer',
                        padding: '4px',
                        borderRadius: '4px',
                      }}
                      title="Delete block"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>

                  {/* Render Editor Block Component (Preserved from Member 1) */}
                  <div>
                    {block.type === 'heading' && (
                      <HeadingBlock block={block} onChange={handleContentChange} />
                    )}
                    {block.type === 'paragraph' && (
                      <ParagraphBlock block={block} onChange={handleContentChange} />
                    )}
                    {block.type === 'code' && (
                      <CodeBlockComp block={block} onChange={handleContentChange} />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </main>

        {/* Responsive Collaboration Sidebar (Section 8 & 9) */}
        <CollaborationSidebar
          isOpen={isSidebarOpen}
          onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
          collaborators={collaborators}
          versionHistory={versionHistory}
          connectionStatus={connectionStatus}
          lastSynchronized={lastSynchronized}
          latencyMs={latencyMs}
          onChangeConnectionStatus={setConnectionStatus}
          onSimulateJoin={simulateUserJoin}
          onRestoreVersion={restoreVersion}
        />
      </div>

      {/* Conflict Resolution Modal (Section 6) */}
      <ConflictResolutionModal
        isOpen={isConflictModalOpen}
        conflict={activeConflict}
        onClose={() => setIsConflictModalOpen(false)}
        onResolve={(blockId, choice) => resolveConflict(blockId, choice)}
      />

      {/* Floating Collaboration Toasts (Section 4) */}
      <NotificationList
        notifications={notifications}
        onDismiss={dismissNotification}
      />
>>>>>>> origin/main
    </div>
  );
};

export default BlockEditor;
