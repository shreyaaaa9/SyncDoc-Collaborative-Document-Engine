import React from 'react';

const HeadingBlock = ({ block, onChange, onFocus }) => {
  const level = block.level || 2;

  const fontSizes = {
    1: '1.75rem',
    2: '1.4rem',
    3: '1.15rem',
  };

  return (
    <div style={{ width: '100%' }}>
      <input
        value={block.content || ''}
        onChange={(e) => onChange(block.id, e.target.value)}
        onFocus={() => onFocus && onFocus(block.id)}
        placeholder="Heading text..."
        style={{
          width: '100%',
          fontSize: fontSizes[level] || '1.4rem',
          fontWeight: 700,
          color: 'var(--text-primary)',
          backgroundColor: 'transparent',
          border: 'none',
          borderBottom: '1px dashed transparent',
          borderRadius: 0,
          padding: '4px 0',
          outline: 'none',
          transition: 'border-color var(--transition-fast)',
        }}
        onMouseEnter={(e) => (e.target.style.borderBottomColor = 'var(--border-medium)')}
        onMouseLeave={(e) => {
          if (document.activeElement !== e.target) {
            e.target.style.borderBottomColor = 'transparent';
          }
        }}
      />
    </div>
  );
};

export default HeadingBlock;
