import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import BlockItem from './BlockItem';

const setup = (block, overrides = {}) => {
  const props = {
    block,
    isFirst: false,
    isLast: false,
    isActive: false,
    autoFocus: false,
    onChange: vi.fn(),
    onDelete: vi.fn(),
    onMove: vi.fn(),
    onFocusBlock: vi.fn(),
    onAddParagraphBelow: vi.fn(),
    ...overrides,
  };
  render(<BlockItem {...props} />);
  return props;
};

describe('BlockItem', () => {
  it('shows paragraph content', () => {
    setup({ id: 'b1', type: 'paragraph', content: 'Hello' });
    expect(screen.getByDisplayValue('Hello')).toBeInTheDocument();
  });

  it('calls onChange when the text changes', () => {
    const props = setup({ id: 'b1', type: 'paragraph', content: '' });
    fireEvent.change(screen.getByLabelText('Paragraph'), { target: { value: 'New text' } });
    expect(props.onChange).toHaveBeenCalledWith('b1', { content: 'New text' });
  });

  it('adds a paragraph below when Enter is pressed', () => {
    const props = setup({ id: 'b1', type: 'paragraph', content: 'Hi' });
    fireEvent.keyDown(screen.getByLabelText('Paragraph'), { key: 'Enter' });
    expect(props.onAddParagraphBelow).toHaveBeenCalledWith('b1');
  });

  it('renders a heading and changes its level', () => {
    const props = setup({ id: 'h1', type: 'heading', level: 1, content: 'Title' });
    expect(screen.getByLabelText('Heading')).toHaveValue('Title');

    fireEvent.change(screen.getByLabelText('Heading level'), { target: { value: '3' } });
    expect(props.onChange).toHaveBeenCalledWith('h1', { level: 3 });
  });

  it('changes the code language', () => {
    const props = setup({ id: 'c1', type: 'code', language: 'javascript', content: 'let a = 1;' });
    fireEvent.change(screen.getByLabelText('Code language'), { target: { value: 'python' } });
    expect(props.onChange).toHaveBeenCalledWith('c1', { language: 'python' });
  });

  it('toggles a list between bulleted and numbered', async () => {
    const user = userEvent.setup();
    const props = setup({ id: 'l1', type: 'list', ordered: false, content: 'a\nb' });
    await user.click(screen.getByTitle('Switch bullet / numbered'));
    expect(props.onChange).toHaveBeenCalledWith('l1', { ordered: true });
  });

  it('calls onDelete and onMove', async () => {
    const user = userEvent.setup();
    const props = setup({ id: 'b1', type: 'paragraph', content: 'Hi' });

    await user.click(screen.getByRole('button', { name: 'Delete block' }));
    await user.click(screen.getByRole('button', { name: 'Move up' }));
    await user.click(screen.getByRole('button', { name: 'Move down' }));

    expect(props.onDelete).toHaveBeenCalledWith('b1');
    expect(props.onMove).toHaveBeenNthCalledWith(1, 'b1', -1);
    expect(props.onMove).toHaveBeenNthCalledWith(2, 'b1', 1);
  });

  it('disables Move up for the first block and Move down for the last', () => {
    setup({ id: 'b1', type: 'paragraph', content: 'Hi' }, { isFirst: true, isLast: true });
    expect(screen.getByRole('button', { name: 'Move up' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Move down' })).toBeDisabled();
  });
});