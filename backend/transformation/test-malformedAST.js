const assert = require("assert");
const { astToHtml } = require("./astToHtml");

console.log("===== MALFORMED AST SECURITY TEST =====");

const testCases = [
  {
    name: "Null AST",
    ast: null
  },
  {
    name: "Non-object AST",
    ast: "invalid"
  },
  {
    name: "Missing root type",
    ast: {
      children: []
    }
  },
  {
    name: "Invalid heading depth",
    ast: {
      type: "root",
      children: [
        {
          type: "heading",
          depth: 9,
          children: [
            {
              type: "text",
              value: "Invalid Heading"
            }
          ]
        }
      ]
    }
  },
  {
    name: "Unsupported node type",
    ast: {
      type: "root",
      children: [
        {
          type: "unknownNode",
          value: "Invalid"
        }
      ]
    }
  }
];

for (const testCase of testCases) {
  assert.throws(
    () => astToHtml(testCase.ast),
    Error
  );

  console.log(`${testCase.name}: PASSED`);
}

console.log("\nALL MALFORMED AST TESTS PASSED");
