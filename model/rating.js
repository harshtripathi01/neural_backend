const mongoose = require("mongoose");

const ratingSchema = mongoose.Schema(
  {
    client: { type: mongoose.Schema.Types.ObjectId, ref: "Client" },
    reviewTitle: { type: String },
    review: { type: String },
    rating: { type: Number },
    is_active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const rating = mongoose.model("Rating", ratingSchema);

module.exports = rating;
