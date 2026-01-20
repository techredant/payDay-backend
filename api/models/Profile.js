
const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  age: Number,
  phone: String,
  isVip: { type: Boolean, default: false },
  vipExpiry: Date,
});

module.exports = mongoose.model("Profile", profileSchema);
