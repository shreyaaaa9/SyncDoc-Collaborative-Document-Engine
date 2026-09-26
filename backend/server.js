require("dotenv").config();
const express = require("express");
const connectDB = require("./config/db");
const documentRoutes = require("./routes/documentRoutes");
const errorHandler = require("./middleware/errorHandler");

const app = express();
const PORT = process.env.PORT || 3000;

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

// Global error handler (must be last)
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
