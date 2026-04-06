const mongoose = require("mongoose");

const playerRatingSchema = new mongoose.Schema(
  {
    player: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, maxlength: 500 },
  },
  { _id: false }
);

const matchRatingSchema = new mongoose.Schema(
  {
    match: { type: mongoose.Schema.Types.ObjectId, ref: "Match", required: true, index: true },
    ratedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    ratings: [playerRatingSchema],
  },
  { timestamps: true }
);

// Un usuario solo puede calificar una vez por partido
matchRatingSchema.index({ match: 1, ratedBy: 1 }, { unique: true });

module.exports = mongoose.model("MatchRating", matchRatingSchema);
