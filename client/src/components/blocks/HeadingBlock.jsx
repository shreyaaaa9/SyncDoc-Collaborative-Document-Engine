import React from 'react';

const HeadingBlock = ({ block, onChange, onEnter, autoFocus }) => {
  const level = [1, 2, 3].includes(block.level) ? block.level : 2;
  return (
    <input
      className={`block-input block-heading block-heading--h${level}`}
      value={block.content ?? ''}
      onChange={(e) => onChange(block.id, { content: e.target.value })}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          onEnter(block.id); // heading er por paragraph
        }
      }}
      placeholder={`Heading ${level}`}
      aria-label={`Heading level ${level}`}
      autoFocus={autoFocus}
    />
  );
};

export default HeadingBlock;