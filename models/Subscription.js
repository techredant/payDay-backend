import mongoose from "mongoose";

const SubscriptionSchema = new mongoose.Schema(
  {
    // 🔗 Who paid
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Profile", // or "User" depending on your model
      required: true,
      index: true,
    },

    // 📦 Plan details
    plan: {
      type: String,
      enum: ["Weekly VIP", "Monthly VIP", "1 Year VIP"],
      required: true,
    },

    price: {
      type: Number,
      required: true,
    },

    // 💳 Payment status
    status: {
      type: String,
      enum: ["pending", "active", "expired", "failed"],
      default: "pending",
      index: true,
    },

    // 🧾 Mpesa reference
    paymentRef: {
      type: String,
      default: null,
      index: true,
    },

    // ⏱ Subscription period
    startDate: {
      type: Date,
      default: null,
    },

    endDate: {
      type: Date,
      default: null,
      index: true,
    },

    // 📱 Extra tracking (optional but useful)
    phone: {
      type: String,
    },

    checkoutRequestId: {
      type: String, // From M-Pesa STK response
    },
  },
  {
    timestamps: true, // createdAt & updatedAt
  }
);

/* =========================
   AUTO-EXPIRE CHECK
========================= */
SubscriptionSchema.methods.isExpired = function () {
  return this.endDate && new Date() > this.endDate;
};

/* =========================
   INDEXES (Performance)
========================= */
SubscriptionSchema.index({ userId: 1, status: 1 });
SubscriptionSchema.index({ endDate: 1 });

export default mongoose.models.Subscription ||
  mongoose.model("Subscription", SubscriptionSchema);
