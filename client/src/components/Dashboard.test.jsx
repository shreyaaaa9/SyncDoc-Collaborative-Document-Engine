import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Dashboard from './Dashboard';
import { fetchDocuments, createDocument, deleteDocument } from '../api/documentApi';

vi.mock('../api/documentApi', () => ({
  fetchDocuments: vi.fn(),
  createDocument: vi.fn(),
  deleteDocument: vi.fn(),
  getErrorMessage: vi.fn((err, fallback) => fallback || 'error'),
}));

describe('Dashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fetchDocuments.mockResolvedValue([]);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('shows documents returned by the API', async () => {
    fetchDocuments.mockResolvedValue([
      { _id: '1', title: 'Doc One' },
      { _id: '2', title: 'Doc Two' },
    ]);
    render(<Dashboard onOpenDocument={vi.fn()} />);
    expect(await screen.findByText('Doc One')).toBeInTheDocument();
    expect(screen.getByText('Doc Two')).toBeInTheDocument();
  });

  it('shows an empty message when there are no documents', async () => {
    render(<Dashboard onOpenDocument={vi.fn()} />);
    expect(await screen.findByText(/No documents yet/i)).toBeInTheDocument();
  });

  it('shows an error and retries loading', async () => {
    const user = userEvent.setup();
    fetchDocuments
      .mockRejectedValueOnce(new Error('network'))
      .mockResolvedValueOnce([{ _id: '1', title: 'Doc One' }]);

    render(<Dashboard onOpenDocument={vi.fn()} />);
    expect(await screen.findByText('Failed to load documents.')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Retry' }));
    expect(await screen.findByText('Doc One')).toBeInTheDocument();
  });

  it('does not create a document with an empty title', async () => {
    const user = userEvent.setup();
    render(<Dashboard onOpenDocument={vi.fn()} />);
    await screen.findByText(/No documents yet/i);

    await user.click(screen.getByRole('button', { name: '+ New Document' }));
    expect(screen.getByText('Please enter a document title.')).toBeInTheDocument();
    expect(createDocument).not.toHaveBeenCalled();
  });

  it('creates a document and opens it', async () => {
    const user = userEvent.setup();
    const onOpen = vi.fn();
    createDocument.mockResolvedValue({ _id: 'new1' });

    render(<Dashboard onOpenDocument={onOpen} />);
    await screen.findByText(/No documents yet/i);

    await user.type(screen.getByPlaceholderText('New document title'), 'My Doc');
    await user.click(screen.getByRole('button', { name: '+ New Document' }));

    await waitFor(() => expect(onOpen).toHaveBeenCalledWith('new1'));
    expect(createDocument).toHaveBeenCalledWith('My Doc');
  });

  it('opens a document when its title is clicked', async () => {
    const user = userEvent.setup();
    const onOpen = vi.fn();
    fetchDocuments.mockResolvedValue([{ _id: 'x1', title: 'Doc One' }]);

    render(<Dashboard onOpenDocument={onOpen} />);
    await user.click(await screen.findByRole('button', { name: 'Doc One' }));
    expect(onOpen).toHaveBeenCalledWith('x1');
  });

  it('does not delete when the user cancels the confirmation', async () => {
    const user = userEvent.setup();
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    fetchDocuments.mockResolvedValue([{ _id: '1', title: 'Doc One' }]);

    render(<Dashboard onOpenDocument={vi.fn()} />);
    await user.click(await screen.findByRole('button', { name: 'Delete' }));
    expect(deleteDocument).not.toHaveBeenCalled();
  });

  it('deletes a document after confirmation', async () => {
    const user = userEvent.setup();
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    deleteDocument.mockResolvedValue();
    fetchDocuments.mockResolvedValue([{ _id: '1', title: 'Doc One' }]);

    render(<Dashboard onOpenDocument={vi.fn()} />);
    await user.click(await screen.findByRole('button', { name: 'Delete' }));

    await waitFor(() => expect(deleteDocument).toHaveBeenCalledWith('1'));
    await waitFor(() => expect(screen.queryByText('Doc One')).not.toBeInTheDocument());
  });
});