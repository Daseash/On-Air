require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/user.js");
const Listing = require("../models/listing.js");
const Review = require("../models/review.js");

const dbUrl = process.env.ATLASDB_URL || process.env.DB_URL;

async function run() {
  console.log("============================================================");
  console.log(" Connecting to MongoDB Atlas Cluster for Review Test...");
  console.log("============================================================");

  await mongoose.connect(dbUrl, { serverSelectionTimeoutMS: 10000 });
  const db = mongoose.connection.db;
  const dbName = mongoose.connection.name;
  console.log(` Connected Successfully to Database: "${dbName}"\n`);

  // 1. GET SAMPLE USER & LISTING
  const sampleUser = await User.findOne({ email: "traveler_sample@voyager.test" });
  if (!sampleUser) {
    console.error("Sample user not found! Please run test_booking_flow.js first.");
    process.exit(1);
  }

  const sampleListing = await Listing.findOne({ title: "Seaside Sanctuary Villa" });
  if (!sampleListing) {
    console.error("Sample listing not found! Please run test_booking_flow.js first.");
    process.exit(1);
  }

  // 2. CREATE A SAMPLE REVIEW
  console.log("------------------------------------------------------------");
  console.log(" STEP 1: Creating a Sample Review...");
  console.log("------------------------------------------------------------");
  const newReview = new Review({
    comment: "Absolutely magical stay! The infinity pool and ocean sunset views were breathtaking. 10/10 would book again!",
    rating: 5,
    author: sampleUser._id,
  });

  await newReview.save();
  console.log(` Saved review to collection 'reviews' with ID: ${newReview._id}`);

  // Link review ObjectId to listing's reviews array
  sampleListing.reviews.push(newReview._id);
  await sampleListing.save();
  console.log(` Linked review ID ${newReview._id} to listing "${sampleListing.title}" (ID: ${sampleListing._id})`);

  // 3. CHECK RAW STORAGE IN MONGODB
  console.log("\n============================================================");
  console.log(" STEP 2: Checking Raw Storage in MongoDB Database");
  console.log("============================================================");
  console.log(`Database Name: ${dbName}\n`);

  console.log(">>> 1. COLLECTION: 'reviews'");
  console.log("    Path: db.reviews.find({ _id: ObjectId('" + newReview._id + "') })");
  const rawReview = await db.collection("reviews").findOne({ _id: newReview._id });
  console.log(JSON.stringify(rawReview, null, 2));

  console.log("\n>>> 2. COLLECTION: 'listings' (checking 'reviews' reference array)");
  console.log("    Path: db.listings.find({ _id: ObjectId('" + sampleListing._id + "') })");
  const rawListing = await db.collection("listings").findOne(
    { _id: sampleListing._id },
    { projection: { title: 1, location: 1, reviews: 1, owner: 1 } }
  );
  console.log(JSON.stringify(rawListing, null, 2));

  // 4. QUERY WITH NESTED POPULATE
  console.log("\n============================================================");
  console.log(" STEP 3: Populated Listing Query (Listing -> Review -> Author)");
  console.log("============================================================");
  const populatedListing = await Listing.findById(sampleListing._id)
    .populate({
      path: "reviews",
      populate: {
        path: "author",
        select: "username email",
      },
    })
    .select("title location country price reviews")
    .lean();
  console.log(JSON.stringify(populatedListing, null, 2));

  console.log("\n All review steps completed successfully!");
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error("Execution error:", err);
  process.exit(1);
});
