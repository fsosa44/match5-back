const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const reviewSchema = new mongoose.Schema(
  {
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, maxlength: 500 },
  },
  { timestamps: true }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    phone: { type: String, trim: true },
    position: {
      type: String,
      enum: ["Arquero", "Defensor", "Mediocampista", "Delantero"],
      default: "Mediocampista",
    },
    birthDate: { type: Date },
    playStyle: {
      type: String,
      enum: ["recreational", "competitive", "flexible"],
      default: "flexible",
    },
    location: { type: String, trim: true },
    profilePhoto: { type: String, default: null },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    matchesPlayed: { type: Number, default: 0 },
    goals: { type: Number, default: 0 },
    reviews: [reviewSchema],
  },
  { timestamps: true }
);

// Hash password antes de guardar
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Comparar password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// No devolver password en JSON
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model("User", userSchema);
