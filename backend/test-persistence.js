/**
 * Week 3 — Persistence & Transformation Test Script
 * Tests: AST validation, versioning, restore, transform pipeline, large docs
 *
 * Run: node test-persistence.js
 * Requires: backend running on http://localhost:5001
 */

require("dotenv").config();
const http = require("http");

const BASE_URL = "http://localhost:5001/api/documents";
let createdDocId = null;
let pass = 0;
let fail = 0;

// ─── HTTP Helpers ─────────────────────────────────────────────────────────────

function request(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(BASE_URL + path);
    const options = {
      hostname: url.hostname,
      port: url.port || 5001,
      path: url.pathname + url.search,
      method,
      headers: { "Content-Type": "application/json" },
    };
    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });
    req.on("error", reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

function assert(label, condition, detail = "") {
  if (condition) {
    console.log(`  ✅ PASS: ${label}`);
    pass++;
  } else {
    console.log(`  ❌ FAIL: ${label}${detail ? " — " + detail : ""}`);
    fail++;
  }
}

// ─── Tests ────────────────────────────────────────────────────────────────────

async function testASTValidation() {
  console.log("\n📋 Test: AST Validation Endpoint");

  // Valid AST
  const valid = await request("POST", "/validate-ast", {
    content: [
      { type: "heading", content: "Hello World", attrs: { level: 1 } },
      { type: "paragraph", content: "Some text here." },
      { type: "code", content: "console.log('hi')", attrs: { language: "javascript" } },
    ],
  });
  assert("Valid AST returns 200", valid.status === 200);
  assert("Valid AST success=true", valid.body.success === true);
  assert("Valid AST nodeCount=3", valid.body.nodeCount === 3);

  // Invalid type
  const invalid = await request("POST", "/validate-ast", {
    content: [{ type: "unknown-type", content: "test" }],
  });
  assert("Invalid AST type returns 422", invalid.status === 422);
  assert("Invalid AST has errors array", Array.isArray(invalid.body.errors));

  // Empty content
  const empty = await request("POST", "/validate-ast", { content: [] });
  assert("Empty AST returns 200", empty.status === 200);
}

async function testDocumentCreation() {
  console.log("\n📄 Test: Document Creation with AST Content");

  const res = await request("POST", "/", {
    title: "Week 3 Test Document",
    content: [
      { type: "heading", content: "Introduction", attrs: { level: 1 }, children: [] },
      { type: "paragraph", content: "This is a test paragraph for Week 3 persistence testing." },
      {
        type: "list",
        content: "",
        children: [
          { type: "list-item", content: "Item 1" },
          { type: "list-item", content: "Item 2" },
        ],
      },
    ],
  });

  assert("Create document returns 201", res.status === 201);
  if (res.status !== 201) {
    console.log(`  ⚠️  Create failed with status ${res.status}:`, JSON.stringify(res.body));
  }
  assert("Create document success=true", res.body.success === true);
  assert("Document has _id", !!(res.body.data && res.body.data._id));
  assert("Document has content array", !!(res.body.data && Array.isArray(res.body.data.content)));

  if (res.status === 201 && res.body.data?._id) {
    createdDocId = res.body.data._id;
    console.log(`  ℹ️  Created document ID: ${createdDocId}`);
  } else {
    console.log(`  ⚠️  Document creation failed — subsequent tests will be skipped`);
  }

  // Try creating with invalid AST
  const invalid = await request("POST", "/", {
    title: "Invalid AST Doc",
    content: [{ type: "invalid-block-type", content: "bad" }],
  });
  assert("Invalid AST on create returns 400", invalid.status === 400);
}

async function testVersioning() {
  console.log("\n🕒 Test: Document Versioning");

  if (!createdDocId) return console.log("  ⚠️  Skipped (no document created)");

  // Update document to create a new version
  const update1 = await request("PUT", `/${createdDocId}`, {
    title: "Week 3 Test Document (Updated)",
    content: [
      { type: "heading", content: "Updated Introduction", attrs: { level: 1 } },
      { type: "paragraph", content: "Updated paragraph content." },
    ],
  });
  assert("Update document returns 200", update1.status === 200);

  // Update again
  await request("PUT", `/${createdDocId}`, {
    content: [
      { type: "heading", content: "Final Introduction", attrs: { level: 1 } },
    ],
  });

  // Check version history
  const versions = await request("GET", `/${createdDocId}/versions`);
  assert("Get versions returns 200", versions.status === 200);
  assert("Version history has entries", versions.body.data.length >= 2);
  assert("Versions have versionNumber", versions.body.data[0].versionNumber > 0);
  assert("Versions exclude yjsState", versions.body.data[0].yjsState === undefined);

  // Get specific version
  const v1 = await request("GET", `/${createdDocId}/versions/1`);
  assert("Get version 1 returns 200", v1.status === 200);
  assert("Version 1 has content", !!v1.body.data.content);

  // Get non-existent version
  const vNone = await request("GET", `/${createdDocId}/versions/9999`);
  assert("Non-existent version returns 404", vNone.status === 404);

  // Paginated versions
  const paged = await request("GET", `/${createdDocId}/versions?page=1&limit=2`);
  assert("Paginated versions returns 200", paged.status === 200);
  assert("Paginated versions has pagination meta", paged.body.pages !== undefined);
}

async function testRestore() {
  console.log("\n🔄 Test: Document Version Restore");

  if (!createdDocId) return console.log("  ⚠️  Skipped (no document created)");

  // Restore to version 1
  const restore = await request("POST", `/${createdDocId}/versions/1/restore`);
  assert("Restore returns 200", restore.status === 200);
  assert("Restore success=true", restore.body.success === true);
  assert("Restore reports restoredFromVersion", restore.body.data.restoredFromVersion === 1);

  // Verify document content changed
  const doc = await request("GET", `/${createdDocId}`);
  assert("Document restoredFromVersion set", doc.body.data.restoredFromVersion === 1);

  // Restore to non-existent version
  const badRestore = await request("POST", `/${createdDocId}/versions/9999/restore`);
  assert("Restore non-existent version returns 404", badRestore.status === 404);
}

async function testTransformPipeline() {
  console.log("\n⚙️  Test: AST Transformation Pipeline");

  if (!createdDocId) return console.log("  ⚠️  Skipped (no document created)");

  // Get current document to find a node ID
  const doc = await request("GET", `/${createdDocId}`);
  const firstNodeId = doc.body.data.content[0]?._id;

  // Insert operation
  const insert = await request("POST", `/${createdDocId}/transform`, {
    operations: [
      {
        op: "insert",
        position: 0,
        node: { type: "paragraph", content: "Inserted paragraph at top." },
      },
    ],
    changeDescription: "Test insert operation",
  });
  assert("Transform insert returns 200", insert.status === 200);
  assert("Transform reports operationsApplied", insert.body.data.operationsApplied === 1);

  // Update operation
  if (firstNodeId) {
    const update = await request("POST", `/${createdDocId}/transform`, {
      operations: [
        {
          op: "update",
          nodeId: firstNodeId,
          node: { content: "Updated content via transform" },
        },
      ],
    });
    assert("Transform update returns 200", update.status === 200);
  }

  // Invalid operation type
  const badOp = await request("POST", `/${createdDocId}/transform`, {
    operations: [{ op: "unknown-op", nodeId: "abc" }],
  });
  assert("Invalid op type returns 400", badOp.status === 400);

  // Empty operations
  const emptyOps = await request("POST", `/${createdDocId}/transform`, {
    operations: [],
  });
  assert("Empty operations returns 400", emptyOps.status === 400);
}

async function testLargeDocument() {
  console.log("\n📦 Test: Large/Complex Document Handling");

  // Create a document with many nodes
  const nodes = Array.from({ length: 50 }, (_, i) => ({
    type: i % 3 === 0 ? "heading" : i % 3 === 1 ? "code" : "paragraph",
    content: `Node ${i + 1}: ${"x".repeat(200)}`,
    attrs: i % 3 === 0 ? { level: 2 } : i % 3 === 1 ? { language: "javascript" } : {},
  }));

  const res = await request("POST", "/", {
    title: "Large Document Test",
    content: nodes,
  });
  assert("Large document (50 nodes) creates successfully", res.status === 201);

  if (res.body.data._id) {
    const stats = await request("GET", `/${res.body.data._id}/stats`);
    assert("Stats endpoint returns 200", stats.status === 200);
    assert("Stats has currentContentNodes", stats.body.data.currentContentNodes === 50);
    assert("Stats has currentContentSize", stats.body.data.currentContentSize > 0);

    // Cleanup
    await request("DELETE", `/${res.body.data._id}`);
  }
}

async function testPagination() {
  console.log("\n📑 Test: Pagination");

  const res = await request("GET", "/?page=1&limit=5");
  assert("Paginated list returns 200", res.status === 200);
  assert("Paginated list has total", res.body.total !== undefined);
  assert("Paginated list has pages", res.body.pages !== undefined);
  assert("Paginated list respects limit", res.body.data.length <= 5);
  assert("List excludes yjsState", res.body.data.every((d) => d.yjsState === undefined));
  assert("List excludes content", res.body.data.every((d) => d.content === undefined));

  // Invalid pagination
  const bad = await request("GET", "/?page=0&limit=200");
  assert("Invalid pagination params returns 400", bad.status === 400);
}

async function testStats() {
  console.log("\n📊 Test: Document Stats");

  if (!createdDocId) return console.log("  ⚠️  Skipped (no document created)");

  const stats = await request("GET", `/${createdDocId}/stats`);
  assert("Stats returns 200", stats.status === 200);
  assert("Stats has totalVersions", stats.body.data.totalVersions > 0);
  assert("Stats has manualVersions", stats.body.data.manualVersions !== undefined);
  assert("Stats has schemaVersion", stats.body.data.schemaVersion === 2);
}

async function cleanup() {
  console.log("\n🧹 Cleanup: Deleting test document");
  if (createdDocId) {
    await request("DELETE", `/${createdDocId}`);
    console.log(`  ℹ️  Deleted document ${createdDocId}`);
  }
}

// ─── Run All Tests ────────────────────────────────────────────────────────────

async function runAll() {
  console.log("🚀 SyncDoc Week 3 — Persistence & Transformation Tests");
  console.log("=".repeat(55));

  try {
    await testASTValidation();
    await testDocumentCreation();
    await testVersioning();
    await testRestore();
    await testTransformPipeline();
    await testLargeDocument();
    await testPagination();
    await testStats();
  } catch (err) {
    console.error("\n💥 Unexpected error:", err.message);
    fail++;
  } finally {
    await cleanup();
  }

  console.log("\n" + "=".repeat(55));
  console.log(`Results: ${pass} passed, ${fail} failed`);
  if (fail === 0) {
    console.log("✅ All tests passed!");
  } else {
    console.log("❌ Some tests failed — check output above.");
    process.exit(1);
  }
}

runAll();
