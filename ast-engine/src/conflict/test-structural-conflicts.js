const assert = require("assert");
const { detectConflicts } = require("./detect");

console.log("===== STRUCTURAL CONFLICT TESTS =====");

// Base document
const baseAST = {
  type: "root",
  children: [
    {
      type: "heading",
      depth: 1,
      children: [
        {
          type: "text",
          value: "SyncDoc"
        }
      ]
    },
    {
      type: "paragraph",
      children: [
        {
          type: "text",
          value: "Collaborative editing"
        }
      ]
    }
  ]
};

// User A adds a new paragraph
const userA = {
  type: "root",
  children: [
    {
      type: "heading",
      depth: 1,
      children: [
        {
          type: "text",
          value: "SyncDoc"
        }
      ]
    },
    {
      type: "paragraph",
      children: [
        {
          type: "text",
          value: "Collaborative editing"
        }
      ]
    },
    {
      type: "paragraph",
      children: [
        {
          type: "text",
          value: "New section added by User A"
        }
      ]
    }
  ]
};

// User B modifies the existing heading
const userB = {
  type: "root",
  children: [
    {
      type: "heading",
      depth: 1,
      children: [
        {
          type: "text",
          value: "Updated SyncDoc"
        }
      ]
    },
    {
      type: "paragraph",
      children: [
        {
          type: "text",
          value: "Collaborative editing"
        }
      ]
    }
  ]
};

const conflicts = detectConflicts(
  baseAST,
  userA,
  userB
);

console.log("Detected conflicts:");
console.log(conflicts);

assert.strictEqual(conflicts.length, 0);

console.log(
  "Concurrent add + modify on different sections: PASSED"
);

console.log("\nALL STRUCTURAL CONFLICT TESTS PASSED");
