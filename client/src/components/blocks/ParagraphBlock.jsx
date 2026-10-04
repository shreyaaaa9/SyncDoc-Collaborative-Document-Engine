import React from 'react';

const ParagraphBlock = ({ block, onChange }) => {
  return (
    <textarea
      value={block.content}
      onChange={(e) => onChange(block.id, e.target.value)}
      placeholder="Write your paragraph..."
      rows={3}
      style={{ width: '100%', border: '1px solid #eee', padding: 8, resize: 'vertical' }}
    />
  );
};

export default ParagraphBlock;
