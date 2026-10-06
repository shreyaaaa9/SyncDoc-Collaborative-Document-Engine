import { describe, it, expect } from 'vitest';
import { createBlock, generateId } from './utils/blockUtils';

describe('blockUtils', () => {
  it('generates unique ids', () => {
    const ids = new Set(Array.from({ length: 200 }, () => generateId()));
    expect(ids.size).toBe(200);
  });

  it('creates a heading with default level 2', () => {
    const block = createBlock('heading');
    expect(block.type).toBe('heading');
    expect(block.level).toBe(2);
    expect(block.content).toBe('');
  });

  it('creates a list that is unordered by default', () => {
    expect(createBlock('list').ordered).toBe(false);
  });

  it('creates a code block with javascript as default language', () => {
    expect(createBlock('code').language).toBe('javascript');
  });

  it('lets extra values override defaults', () => {
    expect(createBlock('heading', { level: 1 }).level).toBe(1);
    expect(createBlock('list', { ordered: true }).ordered).toBe(true);
  });
});