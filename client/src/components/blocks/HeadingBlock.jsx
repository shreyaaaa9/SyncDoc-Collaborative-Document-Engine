import React from 'react';

const HeadingBlock = ({ block, onChange }) => {
  const Tag = `h${block.level || 2}`;
  return (
    <Tag>
      <input
        value={block.content}
        onChange={(e) => onChange(block.id, e.target.value)}
        placeholder="Heading text..."
        style={{ fontSize: 'inherit', fontWeight: 'bold', width: '100%', border: 'none', outline: 'none' }}
      />
    </Tag>
  );
};

export default HeadingBlock;