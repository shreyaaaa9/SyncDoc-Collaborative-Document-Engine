const io = require("socket.io-client");
const Y = require("yjs");

const SERVER_URL = "http://localhost:5001";
const DOCUMENT_ID = "ast-sync-test-document";

const clientA = io(SERVER_URL);
const clientB = io(SERVER_URL);

const docA = new Y.Doc();
const docB = new Y.Doc();

const textA = docA.getText("content");
const textB = docB.getText("content");

// Client A sends Yjs updates to the server
docA.on("update", (update) => {
  clientA.emit("yjs-update", {
    documentId: DOCUMENT_ID,
    update: Array.from(update)
  });
});

// Client B receives Yjs updates
clientB.on("yjs-update", ({ documentId, update }) => {
  Y.applyUpdate(docB, Uint8Array.from(update));

  console.log("\nClient B received Yjs update");
  console.log("Document ID:", documentId);
  console.log("Client B content:");
  console.log(textB.toString());
});

// Client B receives AST updates
clientB.on("ast-update", ({ documentId, markdown, ast }) => {
  console.log("\nAST UPDATE RECEIVED");
  console.log("Document ID:", documentId);
  console.log("Markdown:");
  console.log(markdown);

  console.log("\nAST Root Type:");
  console.log(ast.type);

  console.log("AST Child Count:");
  console.log(ast.children.length);

  if (
    ast.type === "root" &&
    markdown.includes("Hello from Client A")
  ) {
    console.log("\nAST SYNC TEST PASSED");

    clientA.disconnect();
    clientB.disconnect();

    process.exit(0);
  }
});

let connected = 0;

function checkConnections() {
  connected++;

  if (connected === 2) {
    console.log("\nBoth clients connected");

    clientA.emit("join-document", DOCUMENT_ID);
    clientB.emit("join-document", DOCUMENT_ID);

    setTimeout(() => {
      console.log("\nClient A making an edit...");

      textA.insert(
        0,
        "# SyncDoc\n\nHello from Client A\n\n## Features\n\n- Real-time editing"
      );
    }, 500);
  }
}

clientA.on("connect", () => {
  console.log("Client A connected:", clientA.id);
  checkConnections();
});

clientB.on("connect", () => {
  console.log("Client B connected:", clientB.id);
  checkConnections();
});

setTimeout(() => {
  console.error("\nAST SYNC TEST FAILED: timeout");
  clientA.disconnect();
  clientB.disconnect();
  process.exit(1);
}, 10000);
