import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import useDocumentEditor from './useDocumentEditor';
import { fetchDocumentById, updateDocument } from '../api/documentApi';

vi.mock('../api/documentApi', () => ({
  fetchDocumentById: vi.fn(),
  updateDocument: vi.fn(),
  getErrorMessage: vi.fn((err, fallback) => fallback || 'error'),
}));

const sampleDoc = () => ({
  _id: 'd1',
  title: 'Test',
  version: 1,
  blocks: [{ id: 'b1', type: 'paragraph', content: 'Hello' }],
});

const setup = async () => {
  const hook = renderHook(() => useDocumentEditor('d1'));
  await waitFor(() => expect(hook.result.current.loading).toBe(false));
  return hook;
};

describe('useDocumentEditor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fetchDocumentById.mockResolvedValue(sampleDoc());
    updateDocument.mockResolvedValue({ version: 2 });
  });

  it('loads a document', async () => {
    const { result } = await setup();
    expect(result.current.doc.title).toBe('Test');
    expect(result.current.doc.blocks).toHaveLength(1);
    expect(result.current.saveStatus).toBe('saved');
    expect(result.current.meta.version).toBe(1);
  });

  it('shows a load error when the API fails', async () => {
    fetchDocumentById.mockRejectedValue(new Error('boom'));
    const { result } = await setup();
    expect(result.current.loadError).toBeTruthy();
    expect(result.current.doc).toBeNull();
  });

  it('marks the document unsaved after an edit', async () => {
    const { result } = await setup();
    act(() => {
      result.current.updateBlock('b1', { content: 'Changed' });
    });
    expect(result.current.saveStatus).toBe('unsaved');
    expect(result.current.doc.blocks[0].content).toBe('Changed');
  });

  it('saves successfully and updates the version', async () => {
    const { result } = await setup();
    act(() => {
      result.current.setTitle('New title');
    });
    await act(async () => {
      await result.current.save();
    });
    expect(updateDocument).toHaveBeenCalledWith('d1', expect.objectContaining({ title: 'New title' }));
    expect(result.current.saveStatus).toBe('saved');
    expect(result.current.meta.version).toBe(2);
  });

  it('shows an error status when saving fails', async () => {
    updateDocument.mockRejectedValue(new Error('fail'));
    const { result } = await setup();
    act(() => {
      result.current.updateBlock('b1', { content: 'Changed' });
    });
    await act(async () => {
      await result.current.save();
    });
    expect(result.current.saveStatus).toBe('error');
    expect(result.current.saveError).toBeTruthy();
  });

  it('adds and deletes a block', async () => {
    const { result } = await setup();
    act(() => {
      result.current.addBlock('heading', { level: 1 });
    });
    expect(result.current.doc.blocks).toHaveLength(2);
    expect(result.current.doc.blocks[1].type).toBe('heading');
    expect(result.current.doc.blocks[1].level).toBe(1);

    const newId = result.current.doc.blocks[1].id;
    act(() => {
      result.current.deleteBlock(newId);
    });
    expect(result.current.doc.blocks).toHaveLength(1);
  });
});