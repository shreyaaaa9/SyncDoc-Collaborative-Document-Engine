import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchDocumentById, updateDocument, getErrorMessage } from '../api/documentApi';
import { generateId, createBlock } from '../utils/blockUtils';

const useDocumentEditor = (documentId) => {
  const [doc, setDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [saveStatus, setSaveStatus] = useState('saved'); // saved | unsaved | saving | error
  const [saveError, setSaveError] = useState(null);
  const [lastSavedAt, setLastSavedAt] = useState(null);
  const [meta, setMeta] = useState({ version: null, updatedAt: null });
  const [activeBlockId, setActiveBlockId] = useState(null);
  const [focusBlockId, setFocusBlockId] = useState(null);

  const docRef = useRef(null);
  docRef.current = doc;
  const editCounter = useRef(0);

  const markUnsaved = useCallback(() => {
    editCounter.current += 1;
    setSaveStatus((s) => (s === 'saving' ? s : 'unsaved'));
  }, []);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setLoadError(null);
      const data = await fetchDocumentById(documentId);
      const rawBlocks = data?.content || data?.blocks || [];
      const normalizedBlocks = Array.isArray(rawBlocks)
        ? rawBlocks.map((b) => (b.id ? b : { ...b, id: generateId() }))
        : [];
      setDoc({
        ...data,
        title: data?.title || '',
        content: normalizedBlocks,
        blocks: normalizedBlocks,
      });
      setMeta({ version: data.version ?? data.__v ?? null, updatedAt: data.updatedAt ?? null });
      setSaveStatus('saved');
      setSaveError(null);
      setActiveBlockId(null);
      setFocusBlockId(null);
    } catch (err) {
      setLoadError(getErrorMessage(err, 'Could not load this document.'));
    } finally {
      setLoading(false);
    }
  }, [documentId]);

  useEffect(() => {
    load();
  }, [load]);

  // Browser tab close/refresh korle unsaved warning
  useEffect(() => {
    if (saveStatus !== 'unsaved' && saveStatus !== 'error') return undefined;
    const handler = (e) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [saveStatus]);

  const save = useCallback(async () => {
    const current = docRef.current;
    if (!current) return false;
    const id = current._id || documentId;
    const startedAt = editCounter.current;
    setSaveStatus('saving');
    setSaveError(null);
    try {
      const res = await updateDocument(id, { title: current.title, blocks: current.blocks });
      setMeta((prev) => ({
        version: res?.version ?? res?.__v ?? prev.version,
        updatedAt: res?.updatedAt ?? new Date().toISOString(),
      }));
      setLastSavedAt(new Date());
      setSaveStatus(editCounter.current === startedAt ? 'saved' : 'unsaved');
      return true;
    } catch (err) {
      setSaveStatus('error');
      setSaveError(getErrorMessage(err, 'Save failed. Check your connection and try again.'));
      return false;
    }
  }, [documentId]);

  const setTitle = useCallback((title) => {
    setDoc((prev) => (prev ? { ...prev, title } : prev));
    markUnsaved();
  }, [markUnsaved]);

  const updateBlock = useCallback((id, patch) => {
    setDoc((prev) =>
      prev ? { ...prev, blocks: prev.blocks.map((b) => (b.id === id ? { ...b, ...patch } : b)) } : prev
    );
    markUnsaved();
  }, [markUnsaved]);

  const addBlock = useCallback((type, extra, afterId) => {
    const block = createBlock(type, extra);
    setDoc((prev) => {
      if (!prev) return prev;
      const idx = afterId ? prev.blocks.findIndex((b) => b.id === afterId) : -1;
      const blocks = [...prev.blocks];
      if (idx === -1) blocks.push(block);
      else blocks.splice(idx + 1, 0, block);
      return { ...prev, blocks };
    });
    setActiveBlockId(block.id);
    setFocusBlockId(block.id);
    markUnsaved();
  }, [markUnsaved]);

  const addParagraphBelow = useCallback((id) => {
    addBlock('paragraph', undefined, id);
  }, [addBlock]);

  const deleteBlock = useCallback((id) => {
    setDoc((prev) => (prev ? { ...prev, blocks: prev.blocks.filter((b) => b.id !== id) } : prev));
    setActiveBlockId((cur) => (cur === id ? null : cur));
    markUnsaved();
  }, [markUnsaved]);

  const moveBlock = useCallback((id, direction) => {
    setDoc((prev) => {
      if (!prev) return prev;
      const i = prev.blocks.findIndex((b) => b.id === id);
      const j = i + direction;
      if (i === -1 || j < 0 || j >= prev.blocks.length) return prev;
      const blocks = [...prev.blocks];
      [blocks[i], blocks[j]] = [blocks[j], blocks[i]];
      return { ...prev, blocks };
    });
    markUnsaved();
  }, [markUnsaved]);

  const replaceBlocks = useCallback((blocks) => {
    setDoc((prev) => (prev ? { ...prev, blocks } : prev));
    setActiveBlockId(null);
    markUnsaved();
  }, [markUnsaved]);

  return {
    doc, loading, loadError, load,
    saveStatus, saveError, lastSavedAt, meta,
    activeBlockId, setActiveBlockId, focusBlockId,
    save, setTitle, updateBlock, addBlock, addParagraphBelow, deleteBlock, moveBlock, replaceBlocks,
  };
};

export default useDocumentEditor;