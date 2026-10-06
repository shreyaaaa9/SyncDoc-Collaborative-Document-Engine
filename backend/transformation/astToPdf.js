const PDFDocument = require("pdfkit");
const fs = require("fs");
const { validateAST } = require("./astValidator");

function normalizeAst(ast) {
  return Array.isArray(ast)
    ? {
        type: "root",
        children: ast,
      }
    : ast;
}

function writeChildren(doc, children = []) {
  children.forEach((node) => {
    writeNode(doc, node);
  });
}

function writeNode(doc, node) {
  if (!node || typeof node !== "object") {
    return;
  }

  switch (node.type) {
    case "root":
      writeChildren(doc, node.children);
      break;

    case "heading": {
      const depth = Math.min(Math.max(node.depth || 1, 1), 6);
      const fontSize = Math.max(12, 24 - (depth - 1) * 2);

      doc
        .fontSize(fontSize)
        .font("Helvetica-Bold")
        .text(getTextContent(node))
        .moveDown(0.5);

      break;
    }

    case "paragraph":
      doc
        .fontSize(12)
        .font("Helvetica")
        .text(getTextContent(node))
        .moveDown(0.5);
      break;

    case "list":
      (node.children || []).forEach((item) => {
        const prefix = node.ordered ? "1. " : "• ";

        doc
          .fontSize(12)
          .font("Helvetica")
          .text(`${prefix}${getTextContent(item)}`, {
            indent: 20,
          })
          .moveDown(0.2);
      });

      doc.moveDown(0.3);
      break;

    case "listItem":
      writeChildren(doc, node.children);
      break;

    case "code":
      doc
        .fontSize(10)
        .font("Courier")
        .text(node.value || "")
        .moveDown(0.5);
      break;

    case "blockquote":
      doc
        .fontSize(12)
        .font("Helvetica-Oblique")
        .text(getTextContent(node), {
          indent: 20,
        })
        .moveDown(0.5);
      break;

    case "thematicBreak":
      doc
        .moveTo(50, doc.y)
        .lineTo(550, doc.y)
        .stroke()
        .moveDown(0.5);
      break;

    case "break":
      doc.moveDown(0.5);
      break;

    case "inlineCode":
    case "emphasis":
    case "strong":
    case "delete":
    case "text":
      doc.font("Helvetica").text(getTextContent(node));
      break;

    default:
      // Unsupported nodes are safely ignored.
      break;
  }
}

function getTextContent(node) {
  if (!node || typeof node !== "object") {
    return "";
  }

  if (typeof node.value === "string") {
    return node.value;
  }

  if (Array.isArray(node.children)) {
    return node.children.map(getTextContent).join("");
  }

  return "";
}

function astToPdf(ast, outputPath) {
  const normalizedAst = normalizeAst(ast);

  const validation = validateAST(normalizedAst);

  if (!validation.valid) {
    throw new Error(
      `Invalid AST: ${validation.errors.join(", ")}`
    );
  }

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      margin: 50,
    });

    const stream = fs.createWriteStream(outputPath);

    stream.on("finish", () => {
      resolve(outputPath);
    });

    stream.on("error", reject);

    doc.pipe(stream);

    writeNode(doc, normalizedAst);

    doc.end();
  });
}

module.exports = {
  astToPdf,
};
