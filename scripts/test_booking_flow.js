require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/user.js");
const Listing = require("../models/listing.js");
const Booking = require("../models/booking.js");

const dbUrl = process.env.ATLASDB_URL || process.env.DB_URL;

async function run() {
  console.log("============================================================");
  console.log(" Connecting to MongoDB Atlas Cluster...");
  console.log("============================================================");
  
  await mongoose.connect(dbUrl, { serverSelectionTimeoutMS: 10000 });
  
  const db = mongoose.connection.db;
  const dbName = mongoose.connection.name;
  console.log(` Connected Successfully!`);
  console.log(` Database Name: "${dbName}"`);
  console.log(` Host: ${mongoose.connection.host}\n`);

  // 1. CREATE / FIND A SAMPLE USER
  console.log("------------------------------------------------------------");
  console.log(" STEP 1: Creating a Sample User...");
  console.log("------------------------------------------------------------");
  const sampleEmail = "traveler_sample@voyager.test";
  const sampleUsername = "traveler_sample";

  let sampleUser = await User.findOne({ email: sampleEmail });
  if (!sampleUser) {
    const newUser = new User({
      email: sampleEmail,
      username: sampleUsername,
      phone: "+91 9876543210",
    });
    sampleUser = await User.register(newUser, "SecurePass@2026");
    console.log(` Created new user "${sampleUser.username}" with ID: ${sampleUser._id}`);
  } else {
    console.log(` Found existing sample user "${sampleUser.username}" with ID: ${sampleUser._id}`);
  }

  // 2. CREATE A SAMPLE LISTING
  console.log("\n------------------------------------------------------------");
  console.log(" STEP 2: Creating a Sample Listing...");
  console.log("------------------------------------------------------------");
  const sampleListing = await Listing.create({
    title: "Seaside Sanctuary Villa",
    description: "Ultra-luxury beachfront villa with private infinity pool, panoramic sunset views, and direct white sand access.",
    price: 18500,
    location: "Anjuna, Goa",
    country: "India",
    category: "beach",
    image: {
      url: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=85",
      filename: "sample_villa_image",
    },
    owner: sampleUser._id,
  });
  console.log(` Created listing "${sampleListing.title}" with ID: ${sampleListing._id}`);

  // 3. CREATE A SAMPLE BOOKING
  console.log("\n------------------------------------------------------------");
  console.log(" STEP 3: Creating a Sample Booking...");
  console.log("------------------------------------------------------------");
  const checkIn = new Date("2026-11-15T00:00:00.000Z");
  const checkOut = new Date("2026-11-19T00:00:00.000Z");
  const nights = 4;
  const pricePerNight = sampleListing.price;
  const subtotal = nights * pricePerNight;
  const cleaningFee = Math.round(subtotal * 0.08); // 8%
  const serviceFee = Math.round(subtotal * 0.12);  // 12%
  const total = subtotal + cleaningFee + serviceFee;

  const sampleBooking = await Booking.create({
    user: sampleUser._id,
    listing: sampleListing._id,
    checkIn: checkIn,
    checkOut: checkOut,
    guests: 2,
    nights: nights,
    pricePerNight: pricePerNight,
    subtotal: subtotal,
    cleaningFee: cleaningFee,
    serviceFee: serviceFee,
    total: total,
    status: "confirmed",
  });
  console.log(` Created booking with ID: ${sampleBooking._id}`);

  // 4. CHECK WHERE AND HOW IT IS STORED IN MONGODB
  console.log("\n============================================================");
  console.log(" STEP 4: Checking Storage in MongoDB Database");
  console.log("============================================================");
  console.log(`Database Name: ${dbName}\n`);

  console.log(">>> 1. COLLECTION: 'users'");
  console.log("    Path: db.users.find({ _id: ObjectId('" + sampleUser._id + "') })");
  const rawUser = await db.collection("users").findOne({ _id: sampleUser._id });
  console.log(JSON.stringify(rawUser, null, 2));

  console.log("\n>>> 2. COLLECTION: 'listings'");
  console.log("    Path: db.listings.find({ _id: ObjectId('" + sampleListing._id + "') })");
  const rawListing = await db.collection("listings").findOne({ _id: sampleListing._id });
  console.log(JSON.stringify(rawListing, null, 2));

  console.log("\n>>> 3. COLLECTION: 'bookings'");
  console.log("    Path: db.bookings.find({ _id: ObjectId('" + sampleBooking._id + "') })");
  const rawBooking = await db.collection("bookings").findOne({ _id: sampleBooking._id });
  console.log(JSON.stringify(rawBooking, null, 2));

  // 5. QUERY WITH POPULATE (Showing relational linking via ObjectIds)
  console.log("\n============================================================");
  console.log(" STEP 5: Populated Booking Query (User & Listing Joined)");
  console.log("============================================================");
  const populatedBooking = await Booking.findById(sampleBooking._id)
    .populate("user", "username email phone")
    .populate("listing", "title location country price")
    .lean();
  console.log(JSON.stringify(populatedBooking, null, 2));

  console.log("\n All steps completed successfully!");
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error("Execution error:", err);
  process.exit(1);
});
