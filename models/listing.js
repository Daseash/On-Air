const mongoose = require("mongoose");
const schema = mongoose.Schema;
const Review = require("./review.js");

const listingSchema = new schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  price: Number,
  location: String,
  image: {
    url: {
      type: String,
      default:
        "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=640&q=75",
      set: (v) => {
        if (!v || v === "") {
          return "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=640&q=75";
        }
        if (typeof v === "string" && (v.includes("images.unsplash.com") || v.includes("plus.unsplash.com"))) {
          let u = v.replace(/w=\d+/g, "w=640").replace(/q=\d+/g, "q=75");
          if (!u.includes("auto=format")) {
            u += (u.includes("?") ? "&" : "?") + "auto=format&fit=crop&w=640&q=75";
          }
          return u;
        }
        return v;
      },
      get: (v) => {
        if (!v) {
          return "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=640&q=75";
        }
        if (typeof v === "string" && (v.includes("images.unsplash.com") || v.includes("plus.unsplash.com"))) {
          let u = v.replace(/w=\d+/g, "w=640").replace(/q=\d+/g, "q=75");
          if (!u.includes("auto=format")) {
            u += (u.includes("?") ? "&" : "?") + "auto=format&fit=crop&w=640&q=75";
          }
          return u;
        }
        if (typeof v === "string" && v.includes("res.cloudinary.com") && v.includes("/upload/")) {
          if (!v.includes("/w_") && !v.includes("/q_")) {
            return v.replace("/upload/", "/upload/c_fill,w_640,q_auto:good,f_auto/");
          }
        }
        return v;
      },
    },
    filename: {
      type: String,
      default: "listingimage",
    },
  },
  country: String,
  embedding: { type: [Number], default: undefined },
  embeddingModel: { type: String, default: undefined },
  reviews: [
    {
      type: schema.Types.ObjectId,
      ref: "Review",
    },
  ],
  owner: {
    type: schema.Types.ObjectId,
    ref: "User",
  },
  category: {
    type: String,
    enum: [
      "trending",
      "amazing-views",
      "beach",
      "cabin",
      "countryside",
      "farm",
      "lake",
      "treehouse",
      "camping",
      "tiny",
      "island",
      "mansion",
      "castle",
      "luxury",
      "ski",
      "tropical",
      "city",
      "mountain",
      "nature",
    ],
    default: "trending",
  },
});

// Post middleware: Delete all associated reviews when a listing is deleted
listingSchema.post("findOneAndDelete", async (listing) => {
  if (listing && listing.reviews.length) {
    await Review.deleteMany({ _id: { $in: listing.reviews } });
  }
});

listingSchema.set("toObject", { getters: true });
listingSchema.set("toJSON", { getters: true });

const listing = mongoose.model("listing", listingSchema);
module.exports = listing;
