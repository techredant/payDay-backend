require("dotenv").config();
const express = require("express");
const cors = require("cors");
const serverless = require("serverless-http");
const connectDB = require("./db");

const authRoute = require("./routes/auth");
const profileRoute = require("./routes/profile");
const tipsRoute = require("./routes/tip");

const app = express();

app.use(cors({
  origin: [
    "https://pay-day-frontend.vercel.app",
    "http://localhost:5173"
  ]
}));

app.use(express.json());

// ✅ ENSURE DB CONNECTS BEFORE ANY ROUTE
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error("DB connection failed:", err);
    return res.status(500).json({ error: "Database connection failed" });
  }
});

app.get("/", (req, res) => res.send("Backend running"));

app.use("/api/profile", profileRoute);
app.use("/api/auth", authRoute);
app.use("/api/tip", tipsRoute);

module.exports = app;
module.exports.handler = serverless(app);
