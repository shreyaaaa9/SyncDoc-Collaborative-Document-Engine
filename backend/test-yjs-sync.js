const io = require("socket.io-client");
const Y = require("yjs");

const SERVER_URL = "http://localhost:5001";
const DOCUMENT_ID = "yjs-test-document";

const clientA = io(SERVER_URL);
const clientB = io(SERVER_URL);

const docA = new Y.Doc();
const docB = new Y.Doc();

const textA = docA.getText("content");
const textB = docB.getText("content");

// Client A sends local Yjs changes to the server
docA.on("update", (update) => {
  clientA.emit("yjs-update", {
    documentId: DOCUMENT_ID,
    update: Array.from(update)
  });
});

// Client B receives changes from the server
clientB.on("yjs-update", ({ update }) => {
  Y.applyUpdate(docB, Uint8Array.from(update));

  console.log("Client B received content:", textB.toString());

  if (textB.toString() === "Hello from Client A") {
    console.log("YJS SYNC TEST PASSED");
    clientA.disconnect();
    clientB.disconnect();
  }
});

let connected = 0;

function checkConnections() {
  connected++;

  if (connected === 2) {
    clientA.emit("join-document", DOCUMENT_ID);
    clientB.emit("join-document", DOCUMENT_ID);

    setTimeout(() => {
      textA.insert(0, "Hello from Client A");
    }, 500);
  }
}

clientA.on("connect", () => {
  console.log("Client A connected");
  checkConnections();
});

clientB.on("connect", () => {
  console.log("Client B connected");
  checkConnections();
});
