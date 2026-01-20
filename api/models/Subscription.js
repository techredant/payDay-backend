import mongoose from "mongoose";

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

export default mongoose.model("Subscription", subscriptionSchema);
