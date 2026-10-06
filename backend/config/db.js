const mongoose = require("mongoose");

// Track reconnect attempts
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000, // 10s timeout for initial connection
      socketTimeoutMS: 45000,          // 45s socket timeout
      maxPoolSize: 10,                 // max 10 connections in pool
    });

    reconnectAttempts = 0;
    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Handle disconnection events
    mongoose.connection.on("disconnected", () => {
      console.warn("[MongoDB] Disconnected. Attempting to reconnect...");
      if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
        reconnectAttempts++;
        setTimeout(connectDB, 5000 * reconnectAttempts); // exponential backoff
      } else {
        console.error("[MongoDB] Max reconnect attempts reached. Exiting.");
        process.exit(1);
      }
    });

    mongoose.connection.on("error", (err) => {
      console.error("[MongoDB] Connection error:", err.message);
    });

  } catch (error) {
    console.error(`[MongoDB] Initial connection failed: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
