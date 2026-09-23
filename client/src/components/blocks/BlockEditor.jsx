import React, { useEffect, useState } from 'react';
import { fetchDocumentById, updateDocument } from '../../api/documentApi';
import HeadingBlock from './HeadingBlock';
import ParagraphBlock from './ParagraphBlock';
import CodeBlockComp from './CodeBlockComp';

const generateId = () => `blk_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

const BlockEditor = ({ documentId, onBack }) => {
  const [doc, setDoc] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchDocumentById(documentId).then(setDoc).catch(console.error);
  }, [documentId]);

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
  };

  const deleteBlock = (id) => {
    if (!doc) return;
    setDoc({ ...doc, blocks: doc.blocks.filter((b) => b.id !== id) });
  };

  const handleSave = async () => {
    if (!doc || !doc._id) return;
    try {
      setSaving(true);
      await updateDocument(doc._id, { title: doc.title, blocks: doc.blocks });
    } catch (err) {
      console.error('Save failed', err);
    } finally {
      setSaving(false);
    }
  };

  if (!doc) return <p>Loading document...</p>;

  return (
    <div>
      <button onClick={onBack}>← Back to Dashboard</button>
      <h2>{doc.title}</h2>

      <div className="toolbar">
        <button onClick={() => addBlock('heading')}>+ Heading</button>
        <button onClick={() => addBlock('paragraph')}>+ Paragraph</button>
        <button onClick={() => addBlock('code')}>+ Code Block</button>
        <button onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save Document'}
        </button>
      </div>

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