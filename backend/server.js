require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const connectDB = require("./config/db");
const documentRoutes = require("./routes/documentRoutes");
const errorHandler = require("./middleware/errorHandler");

const {
  getYDoc,
  getDocumentState,
  applyUpdate,
} = require("./collaboration/yjsManager");

const {
  getMarkdownFromYDoc,
  generateDocumentAST,
} = require("./collaboration/astSync");

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5001;

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());

// Health check route
app.get("/", (req, res) => {
  res.json({ success: true, message: "SyncDoc Backend is running!" });
});

// API Routes
app.use("/api/documents", documentRoutes);

// Global error handler
app.use(errorHandler);

// Socket.io server
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

// Socket.io connection
io.on("connection", (socket) => {
  console.log(`Client connected: ${socket.id}`);

  socket.on("join-document", (documentId) => {
    socket.join(documentId);
    console.log(`Client ${socket.id} joined document: ${documentId}`);
    socket.emit("document-joined", {
      documentId,
      message: "Successfully joined document",
    });
  });

  socket.on("leave-document", (documentId) => {
    socket.leave(documentId);
    console.log(`Client ${socket.id} left document: ${documentId}`);
  });

  socket.on("request-document-state", (documentId) => {
    const state = getDocumentState(documentId);
    socket.emit("document-state", state);
    console.log(`Sent Yjs state for document: ${documentId} to ${socket.id}`);
  });

  socket.on("yjs-update", async ({ documentId, update }) => {
    try {
      const updateBuffer = Buffer.from(update);
      applyUpdate(documentId, updateBuffer);

      const ydoc = getYDoc(documentId);
      const markdown = getMarkdownFromYDoc(ydoc);
      const ast = await generateDocumentAST(markdown);

      socket.to(documentId).emit("yjs-update", {
        documentId,
        update: Array.from(updateBuffer),
      });

      socket.to(documentId).emit("ast-update", {
        documentId,
        markdown,
        ast,
      });

      console.log(`Yjs update received and AST generated for document: ${documentId}`);
    } catch (error) {
      console.error("Yjs/AST synchronization error:", error.message);
    }
  });

  socket.on("disconnect", () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

server.listen(PORT, () => {
  console.log(`SyncDoc server running on http://localhost:${PORT}`);
});
