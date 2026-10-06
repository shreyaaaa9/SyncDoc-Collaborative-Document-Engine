import React, { memo, useEffect, useLayoutEffect, useRef } from 'react';

const LANGUAGES = ['javascript', 'python', 'java', 'cpp', 'html', 'css', 'json', 'bash'];

const BlockItem = ({
  block, isFirst, isLast, isActive, autoFocus,
  onChange, onDelete, onMove, onFocusBlock, onAddParagraphBelow,
}) => {
  const ref = useRef(null);
  const content = block.content || '';
  const level = [1, 2, 3].includes(block.level) ? block.level : 2;

  useEffect(() => {
    if (autoFocus && ref.current) ref.current.focus();
  }, [autoFocus]);

  // textarea auto height
  useLayoutEffect(() => {
    const el = ref.current;
    if (el && el.tagName === 'TEXTAREA') {
      el.style.height = 'auto';
      el.style.height = `${el.scrollHeight}px`;
    }
  }, [content, block.type]);

  const handleText = (e) => onChange(block.id, { content: e.target.value });
  const handleFocus = () => onFocusBlock(block.id);
  const handleEnter = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      onAddParagraphBelow(block.id);
    }
  };

  let body;
  if (block.type === 'heading') {
    body = (
      <input
        ref={ref}
        className={`block-input block-heading block-heading--h${level}`}
        value={content}
        onChange={handleText}
        onKeyDown={handleEnter}
        onFocus={handleFocus}
        placeholder="Heading"
        aria-label="Heading"
      />
    );
  } else if (block.type === 'quote') {
    body = (
      <textarea
        ref={ref}
        rows={1}
        className="block-input block-quote"
        value={content}
        onChange={handleText}
        onKeyDown={handleEnter}
        onFocus={handleFocus}
        placeholder="Quote"
        aria-label="Quote"
      />
    );
  } else if (block.type === 'list') {
    body = (
      <>
        <div style={{ fontSize: '0.75rem', color: '#666', padding: '0 8px' }}>
          {block.ordered ? 'Numbered list' : 'Bulleted list'} · one item per line
        </div>
        <textarea
          ref={ref}
          rows={2}
          className="block-input"
          value={content}
          onChange={handleText}
          onFocus={handleFocus}
          placeholder="First item&#10;Second item"
          aria-label="List items"
        />
      </>
    );
  } else if (block.type === 'code') {
    body = (
      <div className="block-code">
        <select
          className="block-code__lang"
          value={block.language || 'javascript'}
          onChange={(e) => onChange(block.id, { language: e.target.value })}
          aria-label="Code language"
        >
          {LANGUAGES.map((l) => (
            <option key={l} value={l}>{l}</option>
          ))}
        </select>
        <textarea
          ref={ref}
          rows={4}
          spellCheck={false}
          className="block-input block-code__input"
          value={content}
          onChange={handleText}
          onFocus={handleFocus}
          placeholder="// code here"
          aria-label="Code"
        />
      </div>
    );
  } else {
    body = (
      <textarea
        ref={ref}
        rows={1}
        className="block-input block-paragraph"
        value={content}
        onChange={handleText}
        onKeyDown={handleEnter}
        onFocus={handleFocus}
        placeholder="Write something..."
        aria-label="Paragraph"
      />
    );
  }

  return (
    <div className={`block-row${isActive ? ' is-active' : ''}`}>
      <div className="block-body">{body}</div>
      <div className="block-controls">
        {block.type === 'heading' && (
          <select
            value={level}
            onChange={(e) => onChange(block.id, { level: Number(e.target.value) })}
            aria-label="Heading level"
          >
            {[1, 2, 3].map((l) => (
              <option key={l} value={l}>H{l}</option>
            ))}
          </select>
        )}
        {block.type === 'list' && (
          <button
            type="button"
            title="Switch bullet / numbered"
            onClick={() => onChange(block.id, { ordered: !block.ordered })}
          >
            {block.ordered ? '1.' : '•'}
          </button>
        )}
        <button type="button" title="Move up" aria-label="Move up" disabled={isFirst} onClick={() => onMove(block.id, -1)}>↑</button>
        <button type="button" title="Move down" aria-label="Move down" disabled={isLast} onClick={() => onMove(block.id, 1)}>↓</button>
        <button type="button" title="Delete block" aria-label="Delete block" onClick={() => onDelete(block.id)}>🗑</button>
      </div>
    </div>
  );
};

export default memo(BlockItem);