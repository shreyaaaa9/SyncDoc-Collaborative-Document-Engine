import React from 'react';

const ParagraphBlock = ({ block, onChange, onFocus }) => {
  return (
    <div style={{ width: '100%' }}>
      <textarea
        value={block.content || ''}
        onChange={(e) => onChange(block.id, e.target.value)}
        onFocus={() => onFocus && onFocus(block.id)}
        placeholder="Write a paragraph or Markdown note..."
        rows={Math.max(2, (block.content || '').split('\n').length)}
        style={{
          width: '100%',
          fontSize: '0.95rem',
          lineHeight: '1.6',
          color: 'var(--text-primary)',
          backgroundColor: 'transparent',
          border: '1px solid transparent',
          borderRadius: 'var(--radius-sm)',
          padding: '6px 8px',
          resize: 'vertical',
          outline: 'none',
          transition: 'all var(--transition-fast)',
        }}
        onMouseEnter={(e) => {
          if (document.activeElement !== e.target) {
            e.target.style.borderColor = 'var(--border-subtle)';
          }
        }}
        onMouseLeave={(e) => {
          if (document.activeElement !== e.target) {
            e.target.style.borderColor = 'transparent';
          }
        }}
      />
    </div>
  );
};

export default ParagraphBlock;
