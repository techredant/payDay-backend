// backend/controllers/mpesaController.js
const axios = require("axios");
const Subscription = require("../models/Subscription.js");
const Profile = require("../models/Profile.js");

exports.initiateStkPush = async (req, res) => {
  try {
    const { phone, amount, plan, userId } = req.body;

    if (!phone || !amount || !plan || !userId) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const subscription = await Subscription.create({
      userId,
      plan,
      price: amount,
      status: "pending",
    });

    const auth = Buffer.from(
      `${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`
    ).toString("base64");

    const tokenRes = await axios.get(
      "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
      {
        headers: { Authorization: `Basic ${auth}` },
      }
    );

    const accessToken = tokenRes.data.access_token;

    const timestamp = new Date()
      .toISOString()
      .replace(/[^0-9]/g, "")
      .slice(0, 14);

    const password = Buffer.from(
      `${process.env.MPESA_SHORTCODE}${process.env.MPESA_PASSKEY}${timestamp}`
    ).toString("base64");

    const stkRes = await axios.post(
      "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
      {
        BusinessShortCode: process.env.MPESA_SHORTCODE,
        Password: password,
        Timestamp: timestamp,
        TransactionType: "CustomerBuyGoodsOnline",
        Amount: Number(amount),
        PartyA: phone,
        PartyB: process.env.MPESA_SHORTCODE,
        PhoneNumber: phone,
        CallBackURL: `${process.env.BASE_URL}/api/mpesa/callback`,
        AccountReference: subscription._id.toString(),
        TransactionDesc: plan,
      },
      {
        headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
      }
    );

    res.json({
      success: true,
      message: "STK Push sent",
      subscriptionId: subscription._id,
      stkResponse: stkRes.data,  // <-- IMPORTANT for debugging
    });
  } catch (error) {
    console.error("STK error:", error.response?.data || error.message);
    res.status(500).json({
      message: "STK Push failed",
      error: error.response?.data || error.message,
    });
  }
};


exports.mpesaCallback = async (req, res) => {
  try {
    const result = req.body.Body.stkCallback;

    if (result.ResultCode !== 0) {
      await Subscription.findOneAndUpdate(
        { _id: result.AccountReference },
        { status: "failed" }
      );
      return res.json({ ok: true });
    }

    const receipt = result.CallbackMetadata.Item.find(
      (i) => i.Name === "MpesaReceiptNumber"
    ).Value;

    const subscriptionId = result.AccountReference;

    const subscription = await Subscription.findByIdAndUpdate(
      subscriptionId,
      {
        status: "active",
        paymentRef: receipt,
        startDate: new Date(),
        endDate: getExpiryDate(subscription.plan),
      },
      { new: true }
    );

    await Profile.findByIdAndUpdate(subscription.userId, {
      isVip: true,
      vipExpiry: subscription.endDate,
    });

    res.json({ ok: true });
  } catch (err) {
    console.error("Callback error:", err);
    res.json({ ok: true });
  }
};

function getExpiryDate(plan) {
  const now = Date.now();
  if (plan === "Weekly VIP") return new Date(now + 7 * 86400000);
  if (plan === "Monthly VIP") return new Date(now + 30 * 86400000);
  return new Date(now + 365 * 86400000);
}
