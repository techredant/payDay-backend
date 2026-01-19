const express = require("express");
const profile = require("../models/Profile");
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const profiles = await profile.find();
    res.json(profiles);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
