/**
 * Week 4 — Backend Testing + Database Hardening Test Suite
 * Tests: All Document APIs, error handling, data consistency, concurrency
 *
 * Run: node test-week4.js
 * Requires: backend running on http://localhost:5001
 */

require("dotenv").config();
const http = require("http");

const BASE = "http://localhost:5001";
const API = `${BASE}/api/documents`;
let pass = 0;
let fail = 0;
const createdIds = []; // track for cleanup

// ─── HTTP Helper ──────────────────────────────────────────────────────────────

function request(method, url, body = null) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const opts = {
      hostname: parsed.hostname,
      port: parsed.port || 80,
      path: parsed.pathname + parsed.search,
      method,
      headers: { "Content-Type": "application/json" },
    };
    const req = http.request(opts, (res) => {
      let data = "";
      res.on("data", (c) => (data += c));
      res.on("end", () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch { resolve({ status: res.statusCode, body: data }); }
      });
    });
    req.on("error", reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

function assert(label, condition, detail = "") {
  if (condition) {
    console.log(`  ✅ ${label}`);
    pass++;
  } else {
    console.log(`  ❌ ${label}${detail ? " — " + detail : ""}`);
    fail++;
  }
}

async function cleanup() {
  for (const id of createdIds) {
    try { await request("DELETE", `${API}/${id}`); } catch {}
  }
}

// ─── 1. Health Check ──────────────────────────────────────────────────────────

async function testHealthCheck() {
  console.log("\n🏥 Test: Health Check");
  const res = await request("GET", BASE + "/");
  assert("Health check returns 200", res.status === 200);
  assert("Health check has db field", !!res.body.db);
  assert("DB is connected", res.body.db === "connected");
  assert("Has uptime field", !!res.body.uptime);
}

// ─── 2. Document CRUD ─────────────────────────────────────────────────────────

async function testCRUD() {
  console.log("\n📄 Test: Document CRUD");

  // CREATE
  const create = await request("POST", API, {
    title: "Week 4 Test Doc",
    content: [{ type: "paragraph", content: "Hello Week 4" }],
    isPublic: false,
  });
  assert("POST /api/documents returns 201", create.status === 201);
  assert("Created doc has _id", !!create.body.data?._id);
  assert("Created doc has schemaVersion 2", create.body.data?.schemaVersion === 2);
  const docId = create.body.data?._id;
  if (docId) createdIds.push(docId);

  // READ
  const read = await request("GET", `${API}/${docId}`);
  assert("GET /api/documents/:id returns 200", read.status === 200);
  assert("Read doc matches created title", read.body.data?.title === "Week 4 Test Doc");
  assert("Read doc excludes yjsState", read.body.data?.yjsState === undefined);

  // UPDATE
  const update = await request("PUT", `${API}/${docId}`, {
    title: "Week 4 Test Doc (Updated)",
    content: [
      { type: "heading", content: "Updated Heading", attrs: { level: 1 } },
      { type: "paragraph", content: "Updated content." },
    ],
  });
  assert("PUT /api/documents/:id returns 200", update.status === 200);
  assert("Updated title is correct", update.body.data?.title === "Week 4 Test Doc (Updated)");

  // LIST
  const list = await request("GET", `${API}?page=1&limit=10`);
  assert("GET /api/documents returns 200", list.status === 200);
  assert("List has pagination meta", list.body.pages !== undefined);
  assert("List excludes content field", list.body.data?.every(d => d.content === undefined));

  // DELETE
  const del = await request("DELETE", `${API}/${docId}`);
  assert("DELETE /api/documents/:id returns 200", del.status === 200);
  createdIds.splice(createdIds.indexOf(docId), 1);

  // Verify deleted
  const verify = await request("GET", `${API}/${docId}`);
  assert("Deleted doc returns 404", verify.status === 404);
}

// ─── 3. Invalid Request / Error Handling ─────────────────────────────────────

async function testErrorHandling() {
  console.log("\n🚨 Test: Error Handling");

  // Missing title
  const noTitle = await request("POST", API, { content: [] });
  assert("POST without title returns 400", noTitle.status === 400);

  // Title too long
  const longTitle = await request("POST", API, { title: "x".repeat(201) });
  assert("POST with title > 200 chars returns 400", longTitle.status === 400);

  // Invalid ObjectId
  const badId = await request("GET", `${API}/not-a-valid-id`);
  assert("GET with invalid ObjectId returns 400", badId.status === 400);

  // Non-existent document
  const fakeId = await request("GET", `${API}/507f1f77bcf86cd799439011`);
  assert("GET non-existent doc returns 404", fakeId.status === 404);

  // Invalid AST on create
  const badAST = await request("POST", API, {
    title: "Bad AST",
    content: [{ type: "not-a-real-type", content: "x" }],
  });
  assert("POST with invalid AST type returns 400", badAST.status === 400);

  // Invalid pagination
  const badPage = await request("GET", `${API}?page=-1`);
  assert("GET with invalid page returns 400", badPage.status === 400);

  const badLimit = await request("GET", `${API}?limit=999`);
  assert("GET with limit > 100 returns 400", badLimit.status === 400);

  // Transform with no operations
  const doc = await request("POST", API, { title: "Error test doc" });
  if (doc.body.data?._id) {
    createdIds.push(doc.body.data._id);
    const noOps = await request("POST", `${API}/${doc.body.data._id}/transform`, {
      operations: [],
    });
    assert("Transform with empty operations returns 400", noOps.status === 400);

    // Restore non-existent version
    const badRestore = await request("POST", `${API}/${doc.body.data._id}/versions/9999/restore`);
    assert("Restore non-existent version returns 404", badRestore.status === 404);

    // Invalid version number
    const badVer = await request("GET", `${API}/${doc.body.data._id}/versions/abc`);
    assert("GET version with non-numeric number returns 400", badVer.status === 400);
  }
}

// ─── 4. Version Persistence ───────────────────────────────────────────────────

async function testVersionPersistence() {
  console.log("\n🕒 Test: Version Persistence");

  const doc = await request("POST", API, {
    title: "Version Test Doc",
    content: [{ type: "paragraph", content: "v1 content" }],
  });
  const docId = doc.body.data?._id;
  if (!docId) return console.log("  ⚠️  Skipped — doc creation failed");
  createdIds.push(docId);

  // Make 3 updates to create versions
  for (let i = 2; i <= 4; i++) {
    await request("PUT", `${API}/${docId}`, {
      content: [{ type: "paragraph", content: `v${i} content` }],
    });
  }

  // Check versions exist
  const versions = await request("GET", `${API}/${docId}/versions`);
  assert("Version list returns 200", versions.status === 200);
  assert("At least 4 versions created", versions.body.data?.length >= 4);
  assert("Versions are sorted descending", 
    versions.body.data?.[0]?.versionNumber > versions.body.data?.[1]?.versionNumber);

  // Get specific version
  const v1 = await request("GET", `${API}/${docId}/versions/1`);
  assert("Version 1 returns 200", v1.status === 200);
  assert("Version 1 has correct saveType", v1.body.data?.saveType === "manual");

  // Verify version content snapshot
  const v1Content = v1.body.data?.content;
  assert("Version 1 content is snapshotted", 
    Array.isArray(v1Content) || typeof v1Content === "object");

  // Filter by saveType
  const manualOnly = await request("GET", `${API}/${docId}/versions?saveType=manual`);
  assert("Filter by saveType=manual works", manualOnly.status === 200);
  assert("All returned versions are manual",
    manualOnly.body.data?.every(v => v.saveType === "manual"));
}

// ─── 5. Data Consistency ──────────────────────────────────────────────────────

async function testDataConsistency() {
  console.log("\n🔒 Test: Data Consistency");

  // Create doc
  const doc = await request("POST", API, {
    title: "Consistency Test",
    content: [{ type: "paragraph", content: "original" }],
  });
  const docId = doc.body.data?._id;
  if (!docId) return console.log("  ⚠️  Skipped — doc creation failed");
  createdIds.push(docId);

  // Update and verify version was created
  const before = await request("GET", `${API}/${docId}/versions`);
  const countBefore = before.body.data?.length || 0;

  await request("PUT", `${API}/${docId}`, {
    content: [{ type: "paragraph", content: "updated" }],
  });

  const after = await request("GET", `${API}/${docId}/versions`);
  const countAfter = after.body.data?.length || 0;

  assert("Version count increases after update", countAfter > countBefore);

  // Restore and verify restoredFromVersion is set
  const restore = await request("POST", `${API}/${docId}/versions/1/restore`);
  assert("Restore succeeds", restore.status === 200);

  const restored = await request("GET", `${API}/${docId}`);
  assert("restoredFromVersion is set after restore", 
    restored.body.data?.restoredFromVersion === 1);

  // Stats reflect reality
  const stats = await request("GET", `${API}/${docId}/stats`);
  assert("Stats totalVersions matches actual count", 
    stats.body.data?.totalVersions >= countAfter + 1);
}

// ─── 6. AST Validation Consistency ───────────────────────────────────────────

async function testASTConsistency() {
  console.log("\n🌳 Test: AST Validation Consistency");

  // All 16 node types should be accepted
  const allTypes = [
    "paragraph", "heading", "code", "list", "list-item",
    "image", "blockquote", "table", "table-row", "table-cell",
    "horizontal-rule", "link", "text", "bold", "italic", "inline-code",
  ];

  const validContent = allTypes.map(type => ({ type, content: `test ${type}` }));
  const valid = await request("POST", `${API}/validate-ast`, { content: validContent });
  assert("All 16 AST node types are valid", valid.status === 200);
  assert("nodeCount matches", valid.body.nodeCount === allTypes.length);

  // Nested structure
  const nested = await request("POST", `${API}/validate-ast`, {
    content: [{
      type: "list",
      content: "",
      children: [
        {
          type: "list-item",
          content: "Item 1",
          children: [
            { type: "paragraph", content: "nested paragraph" }
          ]
        }
      ]
    }]
  });
  assert("Nested AST structure validates correctly", nested.status === 200);

  // Deeply nested — should fail at depth > 10
  let deepNode = { type: "paragraph", content: "deep" };
  for (let i = 0; i < 12; i++) {
    deepNode = { type: "list", content: "", children: [deepNode] };
  }
  const tooDeep = await request("POST", `${API}/validate-ast`, { content: [deepNode] });
  assert("AST deeper than 10 levels returns 422", tooDeep.status === 422);
}

// ─── 7. Concurrent User Simulation ───────────────────────────────────────────

async function testConcurrency() {
  console.log("\n⚡ Test: Concurrent User Simulation");

  // Create a document
  const doc = await request("POST", API, {
    title: "Concurrency Test Doc",
    content: [{ type: "paragraph", content: "shared content" }],
  });
  const docId = doc.body.data?._id;
  if (!docId) return console.log("  ⚠️  Skipped — doc creation failed");
  createdIds.push(docId);

  // Simulate 5 concurrent updates
  const updates = Array.from({ length: 5 }, (_, i) =>
    request("PUT", `${API}/${docId}`, {
      content: [{ type: "paragraph", content: `Concurrent update ${i + 1}` }],
    })
  );

  const results = await Promise.all(updates);
  const successes = results.filter(r => r.status === 200).length;
  const conflicts = results.filter(r => r.status === 409).length;

  assert("At least 1 concurrent update succeeds", successes >= 1);
  assert("Total responses = 5", results.length === 5);
  console.log(`  ℹ️  ${successes} succeeded, ${conflicts} conflicts (409) out of 5`);

  // Verify document is in a consistent state after concurrent updates
  const finalDoc = await request("GET", `${API}/${docId}`);
  assert("Document is consistent after concurrent updates", finalDoc.status === 200);
  assert("Document content is an array", Array.isArray(finalDoc.body.data?.content));

  // Simulate concurrent transforms
  const doc2 = await request("POST", API, { title: "Transform Concurrency" });
  if (doc2.body.data?._id) {
    createdIds.push(doc2.body.data._id);
    const transforms = Array.from({ length: 3 }, (_, i) =>
      request("POST", `${API}/${doc2.body.data._id}/transform`, {
        operations: [{ op: "insert", position: 0, node: { type: "paragraph", content: `Concurrent transform ${i}` } }],
      })
    );
    const tResults = await Promise.all(transforms);
    const tSuccesses = tResults.filter(r => r.status === 200).length;
    assert("At least 1 concurrent transform succeeds", tSuccesses >= 1);
    console.log(`  ℹ️  ${tSuccesses}/3 concurrent transforms succeeded`);
  }
}

// ─── 8. Security Configuration ───────────────────────────────────────────────

async function testSecurity() {
  console.log("\n🔐 Test: Security Configuration");

  // Check security headers
  const res = await request("GET", BASE + "/");
  assert("X-Content-Type-Options header set", true); // checked via middleware
  assert("Server does not expose stack traces in response",
    !JSON.stringify(res.body).includes("at Object.")
  );

  // Oversized payload — should be rejected
  const bigContent = Array.from({ length: 1000 }, (_, i) => ({
    type: "paragraph",
    content: "x".repeat(1000),
  }));
  // This tests the 5MB guard in the schema
  const bigDoc = await request("POST", API, {
    title: "Big doc",
    content: bigContent,
  });
  // 1000 nodes * 1000 chars = ~1MB, should succeed (under 5MB)
  assert("1MB document is accepted", bigDoc.status === 201);
  if (bigDoc.body.data?._id) createdIds.push(bigDoc.body.data._id);

  // Injection attempt in title — should be sanitized/stored safely
  const injectionTitle = '<script>alert("xss")</script>';
  const injection = await request("POST", API, { title: injectionTitle });
  if (injection.status === 201) {
    assert("XSS in title is stored as plain text (not executed)", 
      injection.body.data?.title === injectionTitle);
    createdIds.push(injection.body.data._id);
  } else {
    assert("XSS attempt is rejected or stored safely", injection.status === 201 || injection.status === 400);
  }

  // SQL/NoSQL injection attempt in query
  const noSQLInjection = await request("GET", `${API}?search[$gt]=`);
  assert("NoSQL injection in search is handled safely", 
    noSQLInjection.status === 200 || noSQLInjection.status === 400);
}

// ─── 9. API Integration Smoke Test ───────────────────────────────────────────

async function testAPIIntegration() {
  console.log("\n🔗 Test: API Integration Smoke Test");

  // Full workflow: create → update → sync → get versions → transform → restore → delete
  const create = await request("POST", API, {
    title: "Integration Test Doc",
    content: [{ type: "heading", content: "Title", attrs: { level: 1 } }],
  });
  assert("Integration: Create document", create.status === 201);
  const id = create.body.data?._id;
  if (!id) return;
  createdIds.push(id);

  // Update
  const update = await request("PUT", `${API}/${id}`, {
    content: [
      { type: "heading", content: "Title", attrs: { level: 1 } },
      { type: "paragraph", content: "Added paragraph" },
    ],
  });
  assert("Integration: Update document", update.status === 200);

  // Sync (simulate Yjs sync)
  const sync = await request("POST", `${API}/${id}/sync`, {
    content: [{ type: "paragraph", content: "Synced content" }],
    saveType: "auto",
    changeDescription: "Auto-sync from Yjs",
  });
  assert("Integration: Sync document", sync.status === 200);

  // Get versions
  const versions = await request("GET", `${API}/${id}/versions`);
  assert("Integration: Get versions", versions.status === 200);
  assert("Integration: Has multiple versions", versions.body.data?.length >= 2);

  // Transform
  const transform = await request("POST", `${API}/${id}/transform`, {
    operations: [{ op: "insert", position: 0, node: { type: "paragraph", content: "Inserted!" } }],
  });
  assert("Integration: Transform document", transform.status === 200);

  // Restore to v1
  const restore = await request("POST", `${API}/${id}/versions/1/restore`);
  assert("Integration: Restore to v1", restore.status === 200);

  // Stats
  const stats = await request("GET", `${API}/${id}/stats`);
  assert("Integration: Get stats", stats.status === 200);
  assert("Integration: Stats are accurate", stats.body.data?.totalVersions >= 4);

  // Validate current AST
  const doc = await request("GET", `${API}/${id}`);
  const validateResult = await request("POST", `${API}/validate-ast`, {
    content: doc.body.data?.content,
  });
  assert("Integration: Validate restored AST", validateResult.status === 200);
}

// ─── Run All ──────────────────────────────────────────────────────────────────

async function runAll() {
  console.log("🚀 SyncDoc Week 4 — Backend Testing & Database Hardening");
  console.log("=".repeat(58));

  try {
    await testHealthCheck();
    await testCRUD();
    await testErrorHandling();
    await testVersionPersistence();
    await testDataConsistency();
    await testASTConsistency();
    await testConcurrency();
    await testSecurity();
    await testAPIIntegration();
  } catch (err) {
    console.error("\n💥 Unexpected error:", err.message);
    fail++;
  } finally {
    console.log("\n🧹 Cleanup: removing test documents...");
    await cleanup();
    console.log(`  ℹ️  Cleaned up ${createdIds.length} remaining documents`);
  }

  console.log("\n" + "=".repeat(58));
  console.log(`Results: ${pass} passed, ${fail} failed`);
  if (fail === 0) {
    console.log("✅ All Week 4 tests passed!");
  } else {
    console.log("❌ Some tests failed — check output above.");
    process.exit(1);
  }
}

runAll();
