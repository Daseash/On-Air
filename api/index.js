const mongoose = require("mongoose");
const app = require("../app.js");

const dbUrl = process.env.ATLASDB_URL || process.env.DB_URL || process.env.MONGODB_URI;

let connPromise = null;

async function ensureConnection() {
  if (mongoose.connection.readyState === 1) return;
  if (!dbUrl) return;

  if (mongoose.connection.readyState === 2) {
    await new Promise((resolve) => {
      mongoose.connection.once("open", resolve);
      mongoose.connection.once("error", resolve);
      setTimeout(resolve, 3000);
    });
    return;
  }

  if (!connPromise) {
    connPromise = mongoose.connect(dbUrl, {
      serverSelectionTimeoutMS: 2500,
    }).catch((err) => {
      connPromise = null;
      console.warn("Vercel MongoDB connection fallback:", err.message);
    });
  }
  await connPromise;
}

module.exports = async (req, res) => {
  try {
    await ensureConnection();
  } catch {}
  return (app.app || app)(req, res);
};
