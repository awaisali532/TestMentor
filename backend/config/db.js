const mongoose = require("mongoose");

// Serverless Mongoose Connection Cache
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  // If connection is already established and active, reuse it
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false, // Don't hang for 10s if connection drops; fail fast or await connection
      maxPoolSize: 10, // Recommended pool size for serverless functions
      minPoolSize: 1, // Keep at least 1 warm socket ready for zero-latency queries
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    cached.promise = mongoose
      .connect(process.env.MONGO_URI, opts)
      .then((mongooseInstance) => {
        console.log("✅ MongoDB connected successfully (Serverless Cached)");
        return mongooseInstance;
      })
      .catch((err) => {
        cached.promise = null; // Clear cached promise on error so next call can retry
        console.error("❌ MongoDB connection error:", err.message);
        throw err;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
};

module.exports = connectDB;

