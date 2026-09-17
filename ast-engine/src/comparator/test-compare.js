const { generateAST } = require("../parser");
const { compareAST } = require("./compare");

const versionA = `
# SyncDoc

Introduction to the project.

## Features

- Real-time editing
- Conflict detection
`;

const versionB = `
# SyncDoc

Introduction to the project updated.

## Features

- Real-time editing
- AST comparison
`;

async function main() {
  const astA = await generateAST(versionA);
  const astB = await generateAST(versionB);

  const changes = compareAST(astA, astB);

  console.log("Detected changes:");
  console.log(JSON.stringify(changes, null, 2));
}

main().catch((error) => {
  console.error("Comparison failed:", error);
});
