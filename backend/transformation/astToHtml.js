const { validateAST } = require("./astValidator");
const { sanitizeHtml } = require("./htmlSanitizer");

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function transformText(node) {
  return escapeHtml(node.value || "");
}

function transformChildren(children = []) {
  return children.map(transformNode).join("");
}

function transformNode(node) {
  if (!node || typeof node !== "object") {
    return "";
  }

  switch (node.type) {
    case "root":
      return transformChildren(node.children);

    case "heading": {
      const depth = Math.min(Math.max(node.depth || 1, 1), 6);
      return `<h${depth}>${transformChildren(node.children)}</h${depth}>`;
    }

    case "paragraph":
      return `<p>${transformChildren(node.children)}</p>`;

    case "list": {
      const tag = node.ordered ? "ol" : "ul";
      return `<${tag}>${transformChildren(node.children)}</${tag}>`;
    }

    case "listItem":
      return `<li>${transformChildren(node.children)}</li>`;

    case "code": {
      const language = node.lang
        ? ` class="language-${escapeHtml(node.lang)}"`
        : "";

      return `<pre><code${language}>${escapeHtml(
        node.value || ""
      )}</code></pre>`;
    }

    case "blockquote":
      return `<blockquote>${transformChildren(node.children)}</blockquote>`;

    case "thematicBreak":
      return "<hr>";

    case "break":
      return "<br>";

    case "text":
      return transformText(node);

    case "inlineCode":
      return `<code>${escapeHtml(node.value || "")}</code>`;

    case "emphasis":
      return `<em>${transformChildren(node.children)}</em>`;

    case "strong":
      return `<strong>${transformChildren(node.children)}</strong>`;

    case "delete":
      return `<del>${transformChildren(node.children)}</del>`;

    default:
      return "";
  }
}

function astToHtml(ast) {
  // Stored document versions contain an array of AST nodes.
  // Convert the array into the root structure expected by the validator.
  const normalizedAst = Array.isArray(ast)
    ? {
        type: "root",
        children: ast,
      }
    : ast;

  const validation = validateAST(normalizedAst);

  if (!validation.valid) {
    throw new Error(
      `Invalid AST: ${validation.errors.join(", ")}`
    );
  }

  const html = transformNode(normalizedAst);

  return sanitizeHtml(html);
}

module.exports = {
  astToHtml,
  transformNode,
  escapeHtml,
};
