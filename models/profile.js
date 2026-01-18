
const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  age: Number
});

module.exports = mongoose.model("Profile", profileSchema);
