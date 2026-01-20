// backend/routes/tip.js
const express = require("express");
const Tip = require("../models/Tip");

const router = express.Router();

/**
 * GET all tips
 */
router.get("/", async (req, res) => {
  try {
    const tips = await Tip.find().sort({ createdAt: -1 });
    res.json(tips);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * CREATE tip
 */
router.post("/", async (req, res) => {
  try {
    const tip = new Tip(req.body);
    await tip.save();
    res.status(201).json(tip);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/**
 * UPDATE status (won/lost)
 */
router.patch("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;

    const tip = await Tip.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    res.json(tip);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/**
 * DELETE tip
 */
router.delete("/:id", async (req, res) => {
  try {
    await Tip.findByIdAndDelete(req.params.id);
    res.json({ message: "Tip deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
