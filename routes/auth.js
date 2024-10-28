const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const router = express.Router();

router.post("/register", async (req, res) => {
  const { username, password, role } = req.body;
  if (!username || !password || !role) {
    return res.status(400).send("Enter details ");
  }

  const isUser = await User.find({ username: username });

  if (isUser.length > 0) {
    return res.status(400).send("Username is Already exist");
  } else {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashedPassword, role });
    await user.save();
    return res.send("User registered successfully");
  }
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(400).send("Invalid credentials");
  }
  if (user.isBlocked) return res.status(403).send("User is blocked");

  const token = jwt.sign({ _id: user._id, role: user.role }, "your_jwt_secret");
  res.send({ token });
});

module.exports = router;
