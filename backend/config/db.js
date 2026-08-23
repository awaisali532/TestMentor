const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    // Add connection state event listeners to prevent server crashes on socket timeouts
    mongoose.connection.on("error", (err) => {
      console.error("⚠️ Mongoose connection error:", err.message);
    });

    mongoose.connection.on("disconnected", () => {
      console.warn("⚠️ Mongoose disconnected. Attempting automatic reconnect...");
    });

    mongoose.connection.on("reconnected", () => {
      console.log("✅ Mongoose reconnected to MongoDB Atlas!");
    });

    await mongoose.connect(process.env.MONGO_URI, {
      family: 4,
      maxPoolSize: 50,
      minPoolSize: 5,
      serverSelectionTimeoutMS: 15000, // 15s to allow Atlas handshake
      connectTimeoutMS: 15000,
      socketTimeoutMS: 45000,
      retryWrites: true,
      retryReads: true,
    });
    console.log("✅ MongoDB connected with optimized resilient pool");
  } catch (err) {
    console.error("❌ MongoDB initial connection error:", err.message);
    // Don't exit immediately in dev mode, allow auto-retry
  }
};

module.exports = connectDB;
