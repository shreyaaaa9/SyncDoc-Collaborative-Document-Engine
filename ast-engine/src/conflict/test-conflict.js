const { generateAST } = require("../parser");
const { compareAST } = require("../comparator/compare");
const { detectConflicts } = require("./detect");

async function compareVersions(base, versionA, versionB) {
  const baseAST = await generateAST(base);
  const astA = await generateAST(versionA);
  const astB = await generateAST(versionB);

  const changesA = compareAST(baseAST, astA);
  const changesB = compareAST(baseAST, astB);

  return detectConflicts(baseAST, astA, astB);
}

// Case 1: Both users modify the same section
async function sameSectionConflict() {
  const base = `
# SyncDoc

Introduction to the project.

## Features

- Real-time editing
- Conflict detection
`;

  const userA = `
# SyncDoc

Introduction updated by User A.

## Features

- Real-time editing
- Conflict detection
`;

  const userB = `
# SyncDoc

Introduction updated by User B.

## Features

- Real-time editing
- Conflict detection
`;

  return compareVersions(base, userA, userB);
}

// Case 2: Users modify different sections
async function differentSectionsNoConflict() {
  const base = `
# SyncDoc

Introduction to the project.

## Features

- Real-time editing
- Conflict detection
`;

  const userA = `
# SyncDoc

Introduction updated by User A.

## Features

- Real-time editing
- Conflict detection
`;

  const userB = `
# SyncDoc

Introduction to the project.

## Features

- Real-time editing
- AST comparison
`;

  return compareVersions(base, userA, userB);
}

// Case 3: One user deletes a section while another edits it
async function deleteEditConflict() {
  const base = `
# SyncDoc

Introduction to the project.

## Features

- Real-time editing
- Conflict detection
`;

  const userA = `
# SyncDoc

## Features

- Real-time editing
- Conflict detection
`;

  const userB = `
# SyncDoc

Introduction edited by User B.

## Features

- Real-time editing
- Conflict detection
`;

  return compareVersions(base, userA, userB);
}

async function main() {
  console.log("CASE 1: Same section modified");
  console.log(await sameSectionConflict());

  console.log("\nCASE 2: Different sections modified");
  console.log(await differentSectionsNoConflict());

  console.log("\nCASE 3: Delete vs Edit");
  console.log(await deleteEditConflict());
}

main().catch((error) => {
  console.error("Conflict detection test failed:", error);
});