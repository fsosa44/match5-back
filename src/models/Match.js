const mongoose = require("mongoose");

const playerSlotSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    team: { type: String, enum: ["A", "B"], required: true },
    slotIndex: { type: Number, required: true },
  },
  { _id: false }
);

const matchSchema = new mongoose.Schema(
  {
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, trim: true },
    location: { type: String, required: true, trim: true },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    maxPlayers: {
      type: Number,
      required: true,
      enum: [10, 12, 14, 16, 18, 20, 22],
    },
    players: [playerSlotSchema],
    ageRange: {
      min: { type: Number },
      max: { type: Number },
      label: { type: String },
    },
    intensity: {
      type: String,
      enum: ["recreational", "competitive", "flexible"],
    },
    status: {
      type: String,
      enum: ["upcoming", "in-progress", "finished", "cancelled"],
      default: "upcoming",
    },
    result: {
      teamA: { type: Number, default: 0 },
      teamB: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

// Virtuals
matchSchema.virtual("currentPlayers").get(function () {
  return this.players.filter((p) => p.user != null).length;
});

matchSchema.virtual("isFull").get(function () {
  return this.currentPlayers >= this.maxPlayers;
});

matchSchema.set("toJSON", { virtuals: true });
matchSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Match", matchSchema);
