const mongoose = require("mongoose");

const ratingSchema = mongoose.Schema(
  {
    client: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
    reviewTitle: { type: String },
    review: { type: String },
    rating: { type: Number },
    is_active: { type: Boolean, default: true },
    expert: {type:mongoose.Schema.Types.ObjectId, ref: "User" }
  },
  { timestamps: true }
);

const rating = mongoose.model("Rating", ratingSchema);

module.exports = rating;
