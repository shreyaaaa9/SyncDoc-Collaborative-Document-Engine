const { generateAST } = require("./parser");

const sampleDocument = `
# SyncDoc

This is a collaborative document.

## Features

- Real-time editing
- Conflict detection
- AST comparison
`;

async function main() {
  const ast = await generateAST(sampleDocument);

  console.log(JSON.stringify(ast, null, 2));
}

main().catch((error) => {
  console.error("AST generation failed:", error);
});

