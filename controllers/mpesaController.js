
import Subscription from "../models/Subscription.js";
import Profile from "../models/Profile.js";
const axios = require("axios");

/* =======================
   INITIATE STK PUSH
======================= */
export const initiateStkPush = async (req, res) => {
  try {
    const { phone, amount, plan, userId } = req.body;

    if (!phone || !amount || !plan || !userId) {
      return res.status(400).json({ message: "Missing fields" });
    }

    // Normalize phone to 2547XXXXXXXX
    const formattedPhone = phone.startsWith("0")
      ? "254" + phone.slice(1)
      : phone;

    // 1️⃣ Create pending subscription
    const subscription = await Subscription.create({
      userId,
      plan,
      price: amount,
      status: "pending",
    });

    // 2️⃣ Get access token
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

    // 3️⃣ Generate password
    const timestamp = new Date()
      .toISOString()
      .replace(/[^0-9]/g, "")
      .slice(0, 14);

    const password = Buffer.from(
      `${process.env.MPESA_SHORTCODE}${process.env.MPESA_PASSKEY}${timestamp}`
    ).toString("base64");

    // 4️⃣ Send STK push
    const stkRes = await axios.post(
      "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
      {
        BusinessShortCode: process.env.MPESA_SHORTCODE,
        Password: password,
        Timestamp: timestamp,
        TransactionType: "CustomerPayBillOnline",
        Amount: amount,
        PartyA: formattedPhone,
        PartyB: process.env.MPESA_SHORTCODE,
        PhoneNumber: formattedPhone,
        CallBackURL: `${process.env.BASE_URL}/api/mpesa/callback?secret=${process.env.MPESA_CALLBACK_SECRET}`,
        AccountReference: subscription._id.toString(),
        TransactionDesc: plan,
      },
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    // Save checkout request ID for tracking
    subscription.checkoutRequestId = stkRes.data.CheckoutRequestID;
    await subscription.save();

    res.json({
      success: true,
      message: "STK Push sent",
      subscriptionId: subscription._id,
    });
  } catch (error) {
    console.error("STK error:", error.response?.data || error.message);
    res.status(500).json({ message: "STK Push failed" });
  }
};

/* =======================
   MPESA CALLBACK
======================= */
export const mpesaCallback = async (req, res) => {
  try {
    // Validate callback secret
    if (req.query.secret !== process.env.MPESA_CALLBACK_SECRET) {
      return res.status(401).json({ ok: false });
    }

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

    const subscriptionDoc = await Subscription.findById(result.AccountReference);

    const subscription = await Subscription.findByIdAndUpdate(
      result.AccountReference,
      {
        status: "active",
        paymentRef: receipt,
        startDate: new Date(),
        endDate: getExpiryDate(subscriptionDoc.plan),
      },
      { new: true }
    );

    // Activate VIP
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
