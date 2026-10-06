import React, { useEffect, useRef } from 'react';

// content = newline diye alada kora items ("a\nb\nc") — backend e string hishebe save hoy
const ListBlock = ({ block, onChange, autoFocus }) => {
  const text = block.content ?? '';
  const items = text === '' ? [''] : text.split('\n');
  const refs = useRef([]);
  const focusNext = useRef(null);

  useEffect(() => {
    if (focusNext.current !== null) {
      refs.current[focusNext.current]?.focus();
      focusNext.current = null;
    }
  });

  const setItems = (arr) => onChange(block.id, { content: arr.join('\n') });

  const handleKeyDown = (e, i) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const next = [...items];
      next.splice(i + 1, 0, '');
      focusNext.current = i + 1;
      setItems(next);
    } else if (e.key === 'Backspace' && items[i] === '' && items.length > 1) {
      e.preventDefault();
      focusNext.current = Math.max(0, i - 1);
      setItems(items.filter((_, k) => k !== i));
    }
  };

  const Tag = block.ordered ? 'ol' : 'ul';
  return (
    <Tag className="block-list">
      {items.map((item, i) => (
        <li key={i}>
          <input
            ref={(el) => (refs.current[i] = el)}
            className="block-input"
            value={item}
            placeholder="List item"
            aria-label={`List item ${i + 1}`}
            autoFocus={autoFocus && i === 0}
            onChange={(e) => {
              const next = [...items];
              next[i] = e.target.value.replace(/\n/g, ' ');
              setItems(next);
            }}
            onKeyDown={(e) => handleKeyDown(e, i)}
          />
        </li>
      ))}
    </Tag>
  );
};

export default ListBlock;