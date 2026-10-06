import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import {
  fetchDocuments,
  createDocument,
  fetchDocumentById,
} from './api/documentApi';

vi.mock('./api/documentApi', () => ({
  fetchDocuments: vi.fn(),
  createDocument: vi.fn(),
  deleteDocument: vi.fn(),
  fetchDocumentById: vi.fn(),
  updateDocument: vi.fn(),
  getErrorMessage: vi.fn((err, fallback) => fallback || 'error'),
}));

describe('App flow: Dashboard -> Editor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fetchDocuments.mockResolvedValue([{ _id: 'd1', title: 'Doc One' }]);
    fetchDocumentById.mockResolvedValue({
      _id: 'd1',
      title: 'Doc One',
      version: 1,
      blocks: [{ id: 'b1', type: 'paragraph', content: 'Hello' }],
    });
  });

  it('starts on the Dashboard and lists documents', async () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeInTheDocument();
    expect(await screen.findByRole('button', { name: 'Doc One' })).toBeInTheDocument();
  });

  it('opens a document in the editor and comes back to the Dashboard', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(await screen.findByRole('button', { name: 'Doc One' }));
    expect(await screen.findByLabelText('Document title')).toHaveValue('Doc One');
    expect(screen.getByDisplayValue('Hello')).toBeInTheDocument();
    expect(fetchDocumentById).toHaveBeenCalledWith('d1');

    await user.click(screen.getByRole('button', { name: /Back/ }));
    expect(await screen.findByRole('heading', { name: 'Dashboard' })).toBeInTheDocument();
  });

  it('creates a new document and opens it in the editor', async () => {
    const user = userEvent.setup();
    createDocument.mockResolvedValue({ _id: 'new1' });
    fetchDocumentById.mockResolvedValue({
      _id: 'new1',
      title: 'Brand New',
      version: 1,
      blocks: [],
    });

    render(<App />);
    await screen.findByRole('button', { name: 'Doc One' });

    await user.type(screen.getByPlaceholderText('New document title'), 'Brand New');
    await user.click(screen.getByRole('button', { name: '+ New Document' }));

    expect(await screen.findByLabelText('Document title')).toHaveValue('Brand New');
    expect(screen.getByText(/This document is empty/i)).toBeInTheDocument();
    expect(createDocument).toHaveBeenCalledWith('Brand New');
  });

  it('shows an error screen when the document cannot be opened', async () => {
    const user = userEvent.setup();
    fetchDocumentById.mockRejectedValue(new Error('network'));

    render(<App />);
    await user.click(await screen.findByRole('button', { name: 'Doc One' }));

    expect(await screen.findByText('Could not load this document.')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Back to Dashboard/ }));
    expect(await screen.findByRole('heading', { name: 'Dashboard' })).toBeInTheDocument();
  });
});