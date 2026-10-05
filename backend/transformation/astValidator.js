/**
 * Basic AST validation for SyncDoc.
 *
 * Ensures the AST has the expected root structure
 * before it reaches the transformation engine.
 */

const SUPPORTED_NODE_TYPES = new Set([
  "root",
  "heading",
  "paragraph",
  "text",
  "list",
  "listItem",
  "code",
  "blockquote",
  "thematicBreak",
  "break",
  "inlineCode",
  "emphasis",
  "strong",
  "delete"
]);

function validateAST(ast) {
  const errors = [];

  if (!ast || typeof ast !== "object") {
    return {
      valid: false,
      errors: ["AST must be an object"]
    };
  }

  if (ast.type !== "root") {
    errors.push("AST root node must have type 'root'");
  }

  if (!Array.isArray(ast.children)) {
    errors.push("AST root must contain a children array");
  }

  if (errors.length > 0) {
    return {
      valid: false,
      errors
    };
  }

  validateNodeChildren(ast, errors);

  return {
    valid: errors.length === 0,
    errors
  };
}

function validateNodeChildren(node, errors) {
  if (!node || typeof node !== "object") {
    errors.push("Invalid AST node");
    return;
  }

  if (!SUPPORTED_NODE_TYPES.has(node.type)) {
    errors.push(`Unsupported AST node type: ${node.type}`);
    return;
  }

  if (
    node.type === "heading" &&
    (!Number.isInteger(node.depth) ||
      node.depth < 1 ||
      node.depth > 6)
  ) {
    errors.push("Heading depth must be between 1 and 6");
  }

  if (
    node.type === "text" &&
    typeof node.value !== "string"
  ) {
    errors.push("Text node must contain a string value");
  }

  if (
    node.type === "code" &&
    typeof node.value !== "string"
  ) {
    errors.push("Code node must contain a string value");
  }

  if (node.children !== undefined) {
    if (!Array.isArray(node.children)) {
      errors.push(
        `Children of ${node.type} must be an array`
      );
      return;
    }

    for (const child of node.children) {
      validateNodeChildren(child, errors);
    }
  }
}

module.exports = {
  validateAST,
  SUPPORTED_NODE_TYPES
};