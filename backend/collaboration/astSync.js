const { generateAST } = require("../../ast-engine/src/parser");
const { compareAST } = require("../../ast-engine/src/comparator/compare");
const { detectConflicts } = require("../../ast-engine/src/conflict/detect");

/**
 * Convert Yjs document content into Markdown text.
 */
function getMarkdownFromYDoc(ydoc) {
  const text = ydoc.getText("content");

  return text.toString();
}

/**
 * Generate an AST from Markdown content.
 */
async function generateDocumentAST(markdown) {
  return generateAST(markdown);
}

/**
 * Compare two Markdown document versions.
 */
async function compareDocumentVersions(base, versionA, versionB) {
  const baseAST = await generateAST(base);
  const astA = await generateAST(versionA);
  const astB = await generateAST(versionB);

  const changesA = compareAST(baseAST, astA);
  const changesB = compareAST(baseAST, astB);

  const conflicts = detectConflicts(
    baseAST,
    astA,
    astB
  );

  return {
    changesA,
    changesB,
    conflicts
  };
}

module.exports = {
  getMarkdownFromYDoc,
  generateDocumentAST,
  compareDocumentVersions
};
