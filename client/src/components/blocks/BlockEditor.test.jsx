import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import BlockEditor from './BlockEditor';
import { fetchDocumentById, updateDocument } from '../../api/documentApi';

vi.mock('../../api/documentApi', () => ({
  fetchDocumentById: vi.fn(),
  updateDocument: vi.fn(),
  getErrorMessage: vi.fn((err, fallback) => fallback || 'error'),
}));

const sampleDoc = () => ({
  _id: 'd1',
  title: 'My Doc',
  version: 1,
  blocks: [{ id: 'b1', type: 'paragraph', content: 'Hello world' }],
});

describe('BlockEditor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fetchDocumentById.mockResolvedValue(sampleDoc());
    updateDocument.mockResolvedValue({ version: 2 });
  });

  it('shows a loader and then the document', async () => {
    render(<BlockEditor documentId="d1" onBack={vi.fn()} />);
    expect(screen.getByText('Opening document...')).toBeInTheDocument();

    expect(await screen.findByDisplayValue('My Doc')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Hello world')).toBeInTheDocument();
    expect(screen.getByText('v1')).toBeInTheDocument();
    expect(await screen.findByText('2 words')).toBeInTheDocument();
  });

  it('shows an error screen and retries loading', async () => {
    const user = userEvent.setup();
    fetchDocumentById.mockRejectedValueOnce(new Error('network'));

    render(<BlockEditor documentId="d1" onBack={vi.fn()} />);
    expect(await screen.findByText('Could not load this document.')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Try again' }));
    expect(await screen.findByDisplayValue('My Doc')).toBeInTheDocument();
    expect(fetchDocumentById).toHaveBeenCalledTimes(2);
  });

  it('shows an empty note for a document with no blocks', async () => {
    fetchDocumentById.mockResolvedValue({ ...sampleDoc(), blocks: [] });
    render(<BlockEditor documentId="d1" onBack={vi.fn()} />);
    expect(await screen.findByText(/This document is empty/i)).toBeInTheDocument();
  });

  it('has the Save button disabled until something changes', async () => {
    render(<BlockEditor documentId="d1" onBack={vi.fn()} />);
    await screen.findByDisplayValue('My Doc');
    expect(screen.getByText('All changes saved')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save Document' })).toBeDisabled();
  });

  it('marks the document unsaved and saves it', async () => {
    const user = userEvent.setup();
    render(<BlockEditor documentId="d1" onBack={vi.fn()} />);

    const title = await screen.findByLabelText('Document title');
    await user.type(title, ' Updated');
    expect(screen.getByText('Unsaved changes')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Save Document' }));

    await waitFor(() =>
      expect(updateDocument).toHaveBeenCalledWith(
        'd1',
        expect.objectContaining({ title: 'My Doc Updated' })
      )
    );
    expect(await screen.findByText(/All changes saved/)).toBeInTheDocument();
    expect(screen.getByText('v2')).toBeInTheDocument();
  });

  it('saves with Ctrl+S', async () => {
    const user = userEvent.setup();
    render(<BlockEditor documentId="d1" onBack={vi.fn()} />);

    await user.type(await screen.findByLabelText('Document title'), '!');
    await user.keyboard('{Control>}s{/Control}');

    await waitFor(() => expect(updateDocument).toHaveBeenCalledTimes(1));
  });

  it('shows an error banner when saving fails and allows retry', async () => {
    const user = userEvent.setup();
    updateDocument.mockRejectedValueOnce(new Error('fail'));

    render(<BlockEditor documentId="d1" onBack={vi.fn()} />);
    await user.type(await screen.findByLabelText('Document title'), '!');
    await user.click(screen.getByRole('button', { name: 'Save Document' }));

    const retry = await screen.findByRole('button', { name: 'Retry save' });
    await user.click(retry);

    await waitFor(() => expect(updateDocument).toHaveBeenCalledTimes(2));
    expect(await screen.findByText(/All changes saved/)).toBeInTheDocument();
  });

  it('adds a block from the toolbar', async () => {
    const user = userEvent.setup();
    render(<BlockEditor documentId="d1" onBack={vi.fn()} />);
    await screen.findByDisplayValue('My Doc');

    await user.click(screen.getByTitle('Heading 1'));
    expect(screen.getByLabelText('Heading')).toBeInTheDocument();
    expect(screen.getByText('2 blocks')).toBeInTheDocument();
  });

  it('goes back without saving when there are no changes', async () => {
    const user = userEvent.setup();
    const onBack = vi.fn();
    render(<BlockEditor documentId="d1" onBack={onBack} />);
    await screen.findByDisplayValue('My Doc');

    await user.click(screen.getByRole('button', { name: /Back/ }));
    await waitFor(() => expect(onBack).toHaveBeenCalledTimes(1));
    expect(updateDocument).not.toHaveBeenCalled();
  });

  it('saves automatically before going back when there are unsaved changes', async () => {
    const user = userEvent.setup();
    const onBack = vi.fn();
    render(<BlockEditor documentId="d1" onBack={onBack} />);

    await user.type(await screen.findByLabelText('Document title'), '!');
    await user.click(screen.getByRole('button', { name: /Back/ }));

    await waitFor(() => expect(onBack).toHaveBeenCalledTimes(1));
    expect(updateDocument).toHaveBeenCalledTimes(1);
  });
});