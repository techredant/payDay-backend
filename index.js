require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const serverless = require("serverless-http");

const authRoute = require("./routes/auth");
const profileRoute = require("./routes/profile");
const tipsRoute = require("./routes/tip");

const app = express();
app.use(cors());
app.use(express.json());

let isConnected = false;

async function connectDB() {
  if (isConnected) return;

  await mongoose.connect(process.env.MONGO_URI, {
    bufferCommands: false,
  });

  isConnected = true;
  console.log("MongoDB connected");
}

// TEST route
app.get("/", (req, res) => {
  res.send("Hello from Payday Picks Backend!");
});

// ROUTES
app.use("/api/profile", profileRoute);
app.use("/api/auth", authRoute);
app.use("/api/tip", tipsRoute);

// SERVERLESS
module.exports = app;
module.exports.handler = serverless(app);
