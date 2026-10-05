import React from 'react';

const CodeBlockComp = ({ block, onChange, onFocus }) => {
  return (
    <div
      style={{
        backgroundColor: '#0d1117',
        border: '1px solid var(--border-medium)',
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          padding: '4px 12px',
          backgroundColor: '#161b22',
          borderBottom: '1px solid #30363d',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.72rem',
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
          }}
        >
          {block.language || 'javascript'}
        </span>
        <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>AST Code Block</span>
      </div>
      <textarea
        value={block.content || ''}
        onChange={(e) => onChange(block.id, e.target.value)}
        onFocus={() => onFocus && onFocus(block.id)}
        placeholder="// Code here..."
        rows={Math.max(3, (block.content || '').split('\n').length + 1)}
        style={{
          width: '100%',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.85rem',
          lineHeight: '1.5',
          backgroundColor: 'transparent',
          color: '#e6edf3',
          padding: '12px',
          border: 'none',
          outline: 'none',
          resize: 'vertical',
          display: 'block',
        }}
      />
    </div>
  );
};

export default CodeBlockComp;
