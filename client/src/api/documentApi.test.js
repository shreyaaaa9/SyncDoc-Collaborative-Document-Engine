import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockApi = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
}));

vi.mock('axios', () => ({ default: { create: () => mockApi } }));

import {
  fetchDocuments,
  fetchDocumentById,
  createDocument,
  updateDocument,
  deleteDocument,
  getErrorMessage,
} from './documentApi';

describe('documentApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetchDocuments returns an array', async () => {
    mockApi.get.mockResolvedValue({ data: [{ _id: '1', title: 'A' }] });
    expect(await fetchDocuments()).toEqual([{ _id: '1', title: 'A' }]);
  });

  it('fetchDocuments supports { documents: [] } response', async () => {
    mockApi.get.mockResolvedValue({ data: { documents: [{ _id: '2' }] } });
    expect(await fetchDocuments()).toEqual([{ _id: '2' }]);
  });

  it('fetchDocuments returns [] for unexpected data', async () => {
    mockApi.get.mockResolvedValue({ data: null });
    expect(await fetchDocuments()).toEqual([]);
  });

  it('fetchDocumentById calls the right endpoint', async () => {
    mockApi.get.mockResolvedValue({ data: { _id: 'abc' } });
    expect(await fetchDocumentById('abc')).toEqual({ _id: 'abc' });
    expect(mockApi.get).toHaveBeenCalledWith('/abc');
  });

  it('createDocument sends title and empty blocks', async () => {
    mockApi.post.mockResolvedValue({ data: { _id: 'new' } });
    await createDocument('My Doc');
    expect(mockApi.post).toHaveBeenCalledWith('/', { title: 'My Doc', blocks: [] });
  });

  it('updateDocument sends data with PUT', async () => {
    mockApi.put.mockResolvedValue({ data: { version: 2 } });
    const res = await updateDocument('abc', { title: 'T', blocks: [] });
    expect(mockApi.put).toHaveBeenCalledWith('/abc', { title: 'T', blocks: [] });
    expect(res).toEqual({ version: 2 });
  });

  it('deleteDocument calls DELETE', async () => {
    mockApi.delete.mockResolvedValue({});
    await deleteDocument('abc');
    expect(mockApi.delete).toHaveBeenCalledWith('/abc');
  });
});

describe('getErrorMessage', () => {
  it('handles timeout', () => {
    expect(getErrorMessage({ code: 'ECONNABORTED' })).toMatch(/too long/i);
  });

  it('handles no connection', () => {
    expect(getErrorMessage({})).toMatch(/cannot reach the server/i);
  });

  it('handles 404', () => {
    expect(getErrorMessage({ response: { status: 404 } })).toBe('Document not found.');
  });

  it('handles 500', () => {
    expect(getErrorMessage({ response: { status: 500 } })).toMatch(/server error/i);
  });

  it('uses the message sent by the server', () => {
    const err = { response: { status: 400, data: { message: 'Title is required' } } };
    expect(getErrorMessage(err)).toBe('Title is required');
  });

  it('uses the fallback when the server sends no message', () => {
    const err = { response: { status: 400, data: {} } };
    expect(getErrorMessage(err, 'Custom fallback')).toBe('Custom fallback');
  });
});