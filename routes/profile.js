const express = require("express");
const Profile = require("../models/Profile");
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const profiles = await Profile.find();
    res.json(profiles);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
