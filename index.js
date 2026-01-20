require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const serverless = require("serverless-http");

const authRoute = require("./routes/auth.js");
const profileRoute = require("./routes/profile.js");
const tipsRoute = require("./routes/tip.js");
const mpesaRoutes = require("./routes/mpesaRoutes.js");

const app = express();

app.use(cors());
app.use(express.json());

let isConnected = false;

async function connectDB() {
  if (isConnected) return;
  await mongoose.connect(process.env.MONGO_URI);
  isConnected = true;
}

app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/", (req, res) => res.send("Hello from Payday Picks Backend!"));

app.use("/api/mpesa", mpesaRoutes);
app.use("/api/profile", profileRoute);
app.use("/api/auth", authRoute);
app.use("/api/tip", tipsRoute);

// ✅ IMPORTANT
module.exports = serverless(app);
