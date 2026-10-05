const { generateAST } = require("../../ast-engine/src/parser");
const { validateAST } = require("./astValidator");

async function runTest() {
  const markdown = `
# SyncDoc

This is a valid document.

- First item
- Second item
`;

  const ast = await generateAST(markdown);

  console.log("\n===== VALID AST TEST =====");

  const validResult = validateAST(ast);

  console.log(validResult);

  if (!validResult.valid) {
    console.error("VALID AST TEST FAILED");
    process.exit(1);
  }

  console.log("VALID AST TEST PASSED");

  console.log("\n===== INVALID AST TEST =====");

  const invalidAST = {
    type: "root",
    children: [
      {
        type: "heading",
        depth: 9,
        children: [
          {
            type: "text",
            value: "Invalid heading"
          }
        ]
      }
    ]
  };

  const invalidResult = validateAST(invalidAST);

  console.log(invalidResult);

  if (invalidResult.valid) {
    console.error("INVALID AST TEST FAILED");
    process.exit(1);
  }

  console.log("INVALID AST TEST PASSED");

  console.log("\n===== UNSUPPORTED NODE TEST =====");

  const unsupportedAST = {
    type: "root",
    children: [
      {
        type: "unknownNode",
        children: []
      }
    ]
  };

  const unsupportedResult = validateAST(unsupportedAST);

  console.log(unsupportedResult);

  if (unsupportedResult.valid) {
    console.error("UNSUPPORTED NODE TEST FAILED");
    process.exit(1);
  }

  console.log("UNSUPPORTED NODE TEST PASSED");

  console.log("\nALL AST VALIDATION TESTS PASSED");
}

runTest().catch((error) => {
  console.error("TEST ERROR:", error);
  process.exit(1);
});