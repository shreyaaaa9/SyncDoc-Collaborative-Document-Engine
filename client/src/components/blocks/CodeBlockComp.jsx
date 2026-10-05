import React from 'react';

const CodeBlockComp = ({ block, onChange }) => {
  return (
    <textarea
      value={block.content}
      onChange={(e) => onChange(block.id, e.target.value)}
      placeholder="// code here"
      rows={5}
      style={{
        width: '100%',
        fontFamily: 'monospace',
        background: '#1e1e1e',
        color: '#d4d4d4',
        padding: 10,
        border: 'none',
        borderRadius: 4,
      }}
    />
  );
};

export default CodeBlockComp;