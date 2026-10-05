import React, { useDeferredValue, useMemo } from 'react';
import useDocumentEditor from '../../hooks/useDocumentEditor';
import EditorToolbar from '../editor/EditorToolbar';
import SaveStatus from '../editor/SaveStatus';
import VersionBadge from '../editor/VersionBadge';
import BlockItem from './BlockItem';
import Loader from '../common/Loader';
import ErrorState from '../common/ErrorState';
import { generateTestBlocks, TEST_SIZES } from '../../utils/generateTestBlocks';
import '../../styles/editor.css';

const EMPTY = [];

const BlockEditor = ({ documentId, onBack }) => {
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
    }
    onBack();
  };

  const blocks = doc.blocks;
  const isBusy = saveStatus === 'saving';

  return (
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
    </div>
  );
};

export default BlockEditor;