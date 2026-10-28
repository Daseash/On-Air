require("dotenv").config();
const mongoose = require("mongoose");
const dbUrl = process.env.ATLASDB_URL || process.env.DB_URL;

async function run() {
  console.log("Connecting to MongoDB Atlas...");
  await mongoose.connect(dbUrl, { serverSelectionTimeoutMS: 10000 });
  const db = mongoose.connection.db;
  const listingsColl = db.collection("listings");
  
  const cursor = listingsColl.find({});
  let count = 0;
  while (await cursor.hasNext()) {
    const doc = await cursor.next();
    if (doc.image && doc.image.url && typeof doc.image.url === "string") {
      let url = doc.image.url;
      if (url.includes("images.unsplash.com") || url.includes("plus.unsplash.com")) {
        let newUrl = url.replace(/w=\d+/g, "w=640").replace(/q=\d+/g, "q=75");
        if (!newUrl.includes("auto=format")) {
          newUrl += (newUrl.includes("?") ? "&" : "?") + "auto=format&fit=crop&w=640&q=75";
        }
        if (newUrl !== url) {
          await listingsColl.updateOne({ _id: doc._id }, { $set: { "image.url": newUrl } });
          count++;
        }
      }
    }
  }
  console.log(` Successfully migrated ${count} listing images in MongoDB Atlas to fast resolution (w=640, q=75)!`);
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
