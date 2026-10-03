require("dotenv").config();

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const connectDB = require("./config/db");
const documentRoutes = require("./routes/documentRoutes");

const {
  getYDoc,
  getDocumentState,
  applyUpdate
} = require("./collaboration/yjsManager");

const {
  getMarkdownFromYDoc,
  generateDocumentAST
} = require("./collaboration/astSync");

const app = express();
const server = http.createServer(app);

const PORT = 5001;

// Connect to MongoDB
connectDB();

app.use(express.json());
app.use("/api/documents", documentRoutes);

// Basic HTTP route
app.get("/", (req, res) => {
  res.json({
    message: "SyncDoc backend is running!"
  });
});

// Socket.io server
const io = new Server(server, {
  cors: {
    origin: "*"
  }
});

// Socket.io connection
io.on("connection", (socket) => {
  console.log(`Client connected: ${socket.id}`);

  // Join a document room
  socket.on("join-document", (documentId) => {
    socket.join(documentId);

    console.log(
      `Client ${socket.id} joined document: ${documentId}`
    );

    socket.emit("document-joined", {
      documentId,
      message: "Successfully joined document"
    });
  });

  // Leave a document room
  socket.on("leave-document", (documentId) => {
    socket.leave(documentId);

    console.log(
      `Client ${socket.id} left document: ${documentId}`
    );
  });

  // Send the current Yjs document state to a newly joined client
  socket.on("request-document-state", (documentId) => {
    const state = getDocumentState(documentId);

    socket.emit("document-state", state);

    console.log(
      `Sent Yjs state for document: ${documentId} to ${socket.id}`
    );
  });

  // Receive Yjs updates from a client
  socket.on("yjs-update", async ({ documentId, update }) => {
    try {
      const updateBuffer = Buffer.from(update);

      // Apply update to the server-side Yjs document
      applyUpdate(documentId, updateBuffer);

      // Get the current Yjs document
      const ydoc = getYDoc(documentId);

      // Convert current Yjs content to Markdown
      const markdown = getMarkdownFromYDoc(ydoc);

      // Generate AST from the current Markdown
      const ast = await generateDocumentAST(markdown);

      // Broadcast Yjs update to other clients in the document room
      socket.to(documentId).emit("yjs-update", {
        documentId,
        update: Array.from(updateBuffer)
      });

      // Broadcast AST update to other clients
      socket.to(documentId).emit("ast-update", {
        documentId,
        markdown,
        ast
      });

      console.log(
        `Yjs update received and AST generated for document: ${documentId}`
      );
    } catch (error) {
      console.error(
        "Yjs/AST synchronization error:",
        error.message
      );
    }
  });

  // Client disconnected
  socket.on("disconnect", () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

server.listen(PORT, () => {
  console.log(
    `SyncDoc server running on http://localhost:${PORT}`
  );
});
