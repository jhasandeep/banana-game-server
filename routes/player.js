const express = require("express");
const User = require("../models/User");
const router = express.Router();

// Get ranking data

router.post("/user", async (req, res) => {
  try {
    const user = await User.findById(req.body.playerId);

    res.send(user);
  } catch (error) {
    res.status(500).json({ message: "Error fetching user" });
  }
});

router.get("/", async (req, res) => {
  try {
    const rankings = await User.find()
      .sort({ clickCount: -1 })
      .select("username clickCount")
      .limit(10);
    res.json(rankings);
  } catch (error) {
    res.status(500).json({ message: "Error fetching rankings" });
  }
});

module.exports = router;
