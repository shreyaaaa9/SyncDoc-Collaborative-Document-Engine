require("dotenv").config();

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const connectDB = require("./config/db");

const app = express();
const server = http.createServer(app);

const PORT = 5001;

// Connect to MongoDB
connectDB();

app.use(express.json());

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

  // Client disconnected
  socket.on("disconnect", () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

server.listen(PORT, () => {
  console.log(`SyncDoc server running on http://localhost:${PORT}`);
});
