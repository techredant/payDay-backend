// backend/models/Tip.js
const mongoose = require("mongoose");

const tipSchema = new mongoose.Schema(
  {
    homeTeam: { type: String, required: true },
    awayTeam: { type: String, required: true },
    league: { type: String },
    prediction: { type: String, required: true },
    odds: { type: String },
    confidence: { type: Number, default: 75 },
    time: { type: String },
    isVip: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["pending", "won", "lost"],
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Tip", tipSchema);
