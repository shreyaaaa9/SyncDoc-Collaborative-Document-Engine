export const TEST_SIZES = { Small: 20, Medium: 200, Large: 500 };

const SENTENCE = 'SyncDoc keeps every block of the document structured so changes can be merged safely. ';

export const generateTestBlocks = (count) => {
  const stamp = Date.now();
  const blocks = [];
  for (let i = 0; i < count; i += 1) {
    const id = `blk_test_${stamp}_${i}`;
    const kind = i % 10;
    if (kind === 0) {
      blocks.push({ id, type: 'heading', level: i % 30 === 0 ? 1 : 2, content: `Section ${i / 10 + 1}` });
    } else if (kind === 6) {
      blocks.push({ id, type: 'list', ordered: i % 20 === 6, content: 'First item\nSecond item\nThird item' });
    } else if (kind === 7) {
      blocks.push({ id, type: 'quote', content: `Quote number ${i}: ${SENTENCE}` });
    } else if (kind === 9) {
      blocks.push({ id, type: 'code', language: 'javascript', content: `const value${i} = ${i};\nconsole.log(value${i});` });
    } else {
      blocks.push({ id, type: 'paragraph', content: `Paragraph ${i}. ${SENTENCE.repeat(1 + (i % 3))}` });
    }
  }
  return blocks;
};