import React, { useEffect, useState } from 'react';
import { fetchDocumentById, updateDocument } from '../../api/documentApi';
import HeadingBlock from './HeadingBlock';
import ParagraphBlock from './ParagraphBlock';
import CodeBlockComp from './CodeBlockComp';
import StatusMessage from '../common/StatusMessage';

const generateId = () => `blk_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

const BlockEditor = ({ documentId, onBack }) => {
  const [doc, setDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const loadDocument = () => {
    setLoading(true);
    setLoadError(null);
    fetchDocumentById(documentId)
      .then((data) => {
        setDoc(data);
        setHasUnsavedChanges(false);
      })
      .catch(() => setLoadError('Failed to load this document.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadDocument();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [documentId]);

  const markChanged = () => {
    setHasUnsavedChanges(true);
    setSaveSuccess(false);
  };

  const handleTitleChange = (title) => {
    if (!doc) return;
    setDoc({ ...doc, title });
    markChanged();
  };

  const handleContentChange = (id, content) => {
    if (!doc) return;
    setDoc({
      ...doc,
      blocks: doc.blocks.map((b) => (b.id === id ? { ...b, content } : b)),
    });
    markChanged();
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
    markChanged();
  };

  const deleteBlock = (id) => {
    if (!doc) return;
    setDoc({ ...doc, blocks: doc.blocks.filter((b) => b.id !== id) });
    markChanged();
  };

  const handleSave = async () => {
    if (!doc || !doc._id) return;
    try {
      setSaving(true);
      setSaveError(null);
      await updateDocument(doc._id, { title: doc.title, blocks: doc.blocks });
      setHasUnsavedChanges(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setSaveError('Failed to save document.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p>Loading document...</p>;

  if (loadError) {
    return (
      <div>
        <button onClick={onBack}>← Back to Dashboard</button>
        <StatusMessage type="error" message={loadError} onRetry={loadDocument} />
      </div>
    );
  }

  return (
    <div>
      <button onClick={onBack}>← Back to Dashboard</button>

      <input
        value={doc.title}
        onChange={(e) => handleTitleChange(e.target.value)}
        placeholder="Document title"
        style={{ fontSize: 20, fontWeight: 'bold', width: '100%', border: 'none', outline: 'none', margin: '12px 0' }}
      />

      <div className="toolbar">
        <button onClick={() => addBlock('heading')}>+ Heading</button>
        <button onClick={() => addBlock('paragraph')}>+ Paragraph</button>
        <button onClick={() => addBlock('code')}>+ Code Block</button>
        <button onClick={handleSave} disabled={saving || !hasUnsavedChanges}>
          {saving ? 'Saving...' : 'Save Document'}
        </button>
        {hasUnsavedChanges && !saving && <span style={{ color: '#b45309', fontSize: 13 }}>Unsaved changes</span>}
        {saveSuccess && <span style={{ color: '#15803d', fontSize: 13 }}>Saved</span>}
      </div>

      <StatusMessage type="error" message={saveError} onRetry={handleSave} />

      {doc.blocks.length === 0 && <p>No blocks yet. Add one above.</p>}

      {doc.blocks.map((block) => (
        <div key={block.id} className="block-row">
          <div style={{ flex: 1 }}>
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
          <button onClick={() => deleteBlock(block.id)} title="Delete block">
            🗑
          </button>
        </div>
      ))}
    </div>
  );
};

export default BlockEditor;