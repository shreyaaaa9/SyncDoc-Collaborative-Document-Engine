import React from 'react';
import AutoTextarea from './AutoTextarea';

const QuoteBlock = ({ block, onChange, autoFocus }) => (
  <AutoTextarea
    className="block-input block-quote"
    value={block.content ?? ''}
    onChange={(e) => onChange(block.id, { content: e.target.value })}
    placeholder="Quote..."
    aria-label="Quote"
    autoFocus={autoFocus}
  />
);

export default QuoteBlock;