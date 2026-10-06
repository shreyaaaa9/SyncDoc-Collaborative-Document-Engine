import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EditorToolbar from './EditorToolbar';

describe('EditorToolbar', () => {
  it('adds a heading with the right level', async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();
    render(<EditorToolbar onAdd={onAdd} />);

    await user.click(screen.getByTitle('Heading 2'));
    expect(onAdd).toHaveBeenCalledWith('heading', { level: 2 });
  });

  it('adds paragraph, quote and code blocks', async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();
    render(<EditorToolbar onAdd={onAdd} />);

    await user.click(screen.getByTitle('Paragraph'));
    await user.click(screen.getByTitle('Quote'));
    await user.click(screen.getByTitle('Code block'));

    expect(onAdd).toHaveBeenNthCalledWith(1, 'paragraph', undefined);
    expect(onAdd).toHaveBeenNthCalledWith(2, 'quote', undefined);
    expect(onAdd).toHaveBeenNthCalledWith(3, 'code', undefined);
  });

  it('adds bulleted and numbered lists', async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();
    render(<EditorToolbar onAdd={onAdd} />);

    await user.click(screen.getByTitle('Bulleted list'));
    await user.click(screen.getByTitle('Numbered list'));

    expect(onAdd).toHaveBeenNthCalledWith(1, 'list', { ordered: false });
    expect(onAdd).toHaveBeenNthCalledWith(2, 'list', { ordered: true });
  });
});