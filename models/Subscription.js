const mongoose = require("mongoose");


const subscriptionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "Profile", required: true },
  plan: { type: String, required: true },
  price: { type: Number, required: true },
  status: { type: String, default: "pending" },
  paymentRef: String,
  startDate: Date,
  endDate: Date,
  checkoutRequestId: String,
});

module.exports = mongoose.model("Subscription", subscriptionSchema);
