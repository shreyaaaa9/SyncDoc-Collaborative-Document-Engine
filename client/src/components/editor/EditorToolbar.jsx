import React from 'react';

const GROUPS = [
  [
    { label: 'H1', title: 'Heading 1', type: 'heading', extra: { level: 1 } },
    { label: 'H2', title: 'Heading 2', type: 'heading', extra: { level: 2 } },
    { label: 'H3', title: 'Heading 3', type: 'heading', extra: { level: 3 } },
  ],
  [
    { label: '¶', title: 'Paragraph', type: 'paragraph' },
    { label: '❝', title: 'Quote', type: 'quote' },
  ],
  [
    { label: '• List', title: 'Bulleted list', type: 'list', extra: { ordered: false } },
    { label: '1. List', title: 'Numbered list', type: 'list', extra: { ordered: true } },
  ],
  [{ label: '</>', title: 'Code block', type: 'code' }],
];

const EditorToolbar = ({ onAdd }) => (
  <div className="editor-toolbar" role="toolbar" aria-label="Add block">
    <span className="editor-toolbar__label">Add block:</span>
    {GROUPS.map((group, i) => (
      <div className="editor-toolbar__group" key={i}>
        {group.map((btn) => (
          <button
            key={btn.title}
            type="button"
            className="tool-btn"
            title={btn.title}
            onClick={() => onAdd(btn.type, btn.extra)}
          >
            {btn.label}
          </button>
        ))}
      </div>
    ))}
  </div>
);

export default EditorToolbar;