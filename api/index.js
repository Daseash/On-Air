const mongoose = require("mongoose");
const app = require("../app.js");

const dbUrl = process.env.ATLASDB_URL || process.env.DB_URL || process.env.MONGODB_URI;

// Global connection cache across serverless warm invocations
let cached = global._mongoConn;
if (!cached) {
  cached = global._mongoConn = { conn: null, promise: null };
}

async function ensureConnection() {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }
  if (!dbUrl) return null;

  if (cached.promise) {
    try {
      await cached.promise;
      return mongoose.connection;
    } catch {
      cached.promise = null;
    }
  }

  cached.promise = mongoose.connect(dbUrl, {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 20000,
  }).catch((err) => {
    cached.promise = null;
    console.warn("MongoDB Atlas connection error:", err.message);
  });

  await cached.promise;
  return mongoose.connection;
}

module.exports = async (req, res) => {
  try {
    await ensureConnection();
  } catch {}
  if (!req.secret) {
    req.secret = (process.env.SESSION_SECRET && process.env.SESSION_SECRET.trim()) || "onairsupersecretkey2026";
  }
  return (app.app || app)(req, res);
};
