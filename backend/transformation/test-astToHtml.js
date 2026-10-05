const { generateAST } = require("../../ast-engine/src/parser");
const { astToHtml } = require("./astToHtml");

async function runTest() {
  const markdown = `
# SyncDoc

This is a collaborative document.

## Features

- Real-time editing
- Conflict detection
- AST comparison

\`\`\`javascript
const message = "Hello SyncDoc";
console.log(message);
\`\`\`
`;

  const ast = await generateAST(markdown);

  const html = astToHtml(ast);

  console.log("\n===== AST → HTML OUTPUT =====\n");
  console.log(html);

  if (
    html.includes("<h1>SyncDoc</h1>") &&
    html.includes("<p>This is a collaborative document.</p>") &&
    html.includes("<h2>Features</h2>") &&
    html.includes("<ul>") &&
    html.includes("<li>") &&
    html.includes("<pre><code")
  ) {
    console.log("\nAST → HTML TEST PASSED");
  } else {
    console.error("\nAST → HTML TEST FAILED");
    process.exit(1);
  }
}

runTest().catch((error) => {
  console.error("\nTEST ERROR:", error);
  process.exit(1);
});