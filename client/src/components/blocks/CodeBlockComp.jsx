import React from 'react';
import AutoTextarea from './AutoTextarea';

const LANGUAGES = ['javascript', 'typescript', 'python', 'java', 'html', 'css', 'json', 'bash', 'sql'];

const CodeBlockComp = ({ block, onChange, autoFocus }) => (
  <div className="block-code">
    <select
      className="block-code__lang"
      value={block.language || 'javascript'}
      onChange={(e) => onChange(block.id, { language: e.target.value })}
      aria-label="Code language"
    >
      {LANGUAGES.map((l) => (
        <option key={l} value={l}>{l}</option>
      ))}
    </select>
    <AutoTextarea
      className="block-input block-code__input"
      value={block.content ?? ''}
      onChange={(e) => onChange(block.id, { content: e.target.value })}
      placeholder="// code here"
      aria-label="Code"
      spellCheck={false}
      autoFocus={autoFocus}
    />
  </div>
);

export default CodeBlockComp;