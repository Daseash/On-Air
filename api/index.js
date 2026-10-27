const mongoose = require("mongoose");
const { app } = require("../app.js");

const dbUrl = process.env.ATLASDB_URL || process.env.DB_URL || process.env.MONGODB_URI;

module.exports = async (req, res) => {
  // Ensure connection in serverless environment
  if (dbUrl && mongoose.connection.readyState !== 1) {
    try {
      await mongoose.connect(dbUrl, {
        serverSelectionTimeoutMS: 5000,
      });
    } catch (err) {
      console.warn("Vercel MongoDB connection fallback:", err.message);
    }
  }

  return app(req, res);
};
