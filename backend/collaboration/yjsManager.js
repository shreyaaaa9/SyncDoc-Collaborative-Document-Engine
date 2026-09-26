const Y = require("yjs");

// Stores Yjs documents by document ID
const documents = new Map();

// Get an existing Yjs document or create a new one
const getYDoc = (documentId) => {
  if (!documents.has(documentId)) {
    const ydoc = new Y.Doc();

    documents.set(documentId, ydoc);

    console.log(`Yjs document created: ${documentId}`);
  }

  return documents.get(documentId);
};

// Get the current document state as a binary update
const getDocumentState = (documentId) => {
  const ydoc = getYDoc(documentId);

  return Y.encodeStateAsUpdate(ydoc);
};

// Apply a Yjs update received from a client
const applyUpdate = (documentId, update) => {
  const ydoc = getYDoc(documentId);

  Y.applyUpdate(ydoc, update);
};

module.exports = {
  getYDoc,
  getDocumentState,
  applyUpdate
};
