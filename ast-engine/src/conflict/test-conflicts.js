const assert = require("assert");
const { detectConflicts } = require("./detect");

console.log("===== CONFLICT RESOLUTION TESTS =====");

// Base document
const baseAST = {
  type: "root",
  children: [
    {
      type: "paragraph",
      children: [
        {
          type: "text",
          value: "Hello World"
        }
      ]
    },
    {
      type: "paragraph",
      children: [
        {
          type: "text",
          value: "SyncDoc is collaborative"
        }
      ]
    }
  ]
};

// Test 1: Both users modify the same section
const userA_same = {
  type: "root",
  children: [
    {
      type: "paragraph",
      children: [
        {
          type: "text",
          value: "Hello from User A"
        }
      ]
    },
    {
      type: "paragraph",
      children: [
        {
          type: "text",
          value: "SyncDoc is collaborative"
        }
      ]
    }
  ]
};

const userB_same = {
  type: "root",
  children: [
    {
      type: "paragraph",
      children: [
        {
          type: "text",
          value: "Hello from User B"
        }
      ]
    },
    {
      type: "paragraph",
      children: [
        {
          type: "text",
          value: "SyncDoc is collaborative"
        }
      ]
    }
  ]
};

const sameSectionConflicts = detectConflicts(
  baseAST,
  userA_same,
  userB_same
);

assert.strictEqual(sameSectionConflicts.length, 1);
assert.strictEqual(
  sameSectionConflicts[0].reason,
  "Both users modified the same section"
);

console.log("Same-section modification: PASSED");

// Test 2: User A deletes, User B edits
const userA_deleted = {
  type: "root",
  children: [
    {
      type: "paragraph",
      children: [
        {
          type: "text",
          value: "SyncDoc is collaborative"
        }
      ]
    }
  ]
};

const userB_edited = {
  type: "root",
  children: [
    {
      type: "paragraph",
      children: [
        {
          type: "text",
          value: "Hello World"
        }
      ]
    },
    {
      type: "paragraph",
      children: [
        {
          type: "text",
          value: "SyncDoc is edited by User B"
        }
      ]
    }
  ]
};

const deleteEditConflicts = detectConflicts(
  baseAST,
  userA_deleted,
  userB_edited
);

assert.strictEqual(deleteEditConflicts.length, 1);
assert.strictEqual(
  deleteEditConflicts[0].reason,
  "One user deleted a section while another edited it"
);

console.log("Delete-vs-edit conflict: PASSED");

// Test 3: Different sections modified
const userA_different = {
  type: "root",
  children: [
    {
      type: "paragraph",
      children: [
        {
          type: "text",
          value: "Hello from User A"
        }
      ]
    },
    {
      type: "paragraph",
      children: [
        {
          type: "text",
          value: "SyncDoc is collaborative"
        }
      ]
    }
  ]
};

const userB_different = {
  type: "root",
  children: [
    {
      type: "paragraph",
      children: [
        {
          type: "text",
          value: "Hello World"
        }
      ]
    },
    {
      type: "paragraph",
      children: [
        {
          type: "text",
          value: "Edited by User B"
        }
      ]
    }
  ]
};

const differentSectionConflicts = detectConflicts(
  baseAST,
  userA_different,
  userB_different
);

assert.strictEqual(differentSectionConflicts.length, 0);

console.log("Different-section modifications: PASSED");

console.log("\nALL CONFLICT TESTS PASSED");
