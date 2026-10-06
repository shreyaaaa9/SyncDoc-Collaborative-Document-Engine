let counter = 0;

export const generateId = () =>
  `blk_${Date.now()}_${(counter++).toString(36)}_${Math.random().toString(36).slice(2, 6)}`;

// Supported block types: heading, paragraph, list, quote, code
export const createBlock = (type, extra = {}) => {
  const base = { id: generateId(), type, content: '' };
  if (type === 'heading') return { ...base, level: 2, ...extra };
  if (type === 'code') return { ...base, language: 'javascript', ...extra };
  if (type === 'list') return { ...base, ordered: false, ...extra };
  return { ...base, ...extra };
};