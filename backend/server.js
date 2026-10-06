require("dotenv").config();

// ─── Environment Variable Validation ─────────────────────────────────────────
const REQUIRED_ENV_VARS = ["MONGO_URI"];
const missingVars = REQUIRED_ENV_VARS.filter((v) => !process.env[v]);
if (missingVars.length > 0) {
  console.error(`[Startup] Missing required environment variables: ${missingVars.join(", ")}`);
  console.error("[Startup] Copy backend/.env.example to backend/.env and fill in the values.");
  process.exit(1);
}

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
app.use(express.json({ limit: "10mb" })); // 10MB payload limit
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// CORS middleware
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map((o) => o.trim())
  : ["*"];

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes("*") || allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin || "*");
  }
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("X-Content-Type-Options", "nosniff");
  res.header("X-Frame-Options", "DENY");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

// Health check route — includes DB connection status
app.get("/", (req, res) => {
  const mongoose = require("mongoose");
  const dbState = ["disconnected", "connected", "connecting", "disconnecting"];
  res.json({
    success: true,
    message: "SyncDoc Backend is running!",
    db: dbState[mongoose.connection.readyState] || "unknown",
    env: process.env.NODE_ENV || "development",
    uptime: Math.floor(process.uptime()) + "s",
  });
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
