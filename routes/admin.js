const express = require("express");
const User = require("../models/User");
const { auth, adminOnly } = require("../middleware/auth");
const router = express.Router();

router.use(auth);
router.use(adminOnly);

router.get("/users", async (req, res) => {
  const users = await User.find();
  res.send(users);
});

router.patch("/block/:id", async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, {
      isBlocked: true,
    });

    if (!user) {
      return res.status(404).send("User not found");
    }

    res.send(`User ${user.username} has been blocked`);
  } catch (error) {
    console.error("Error blocking user:", error);
    res.status(500).send("An error occurred while blocking the user");
  }
});

router.patch("/unblock/:id", async (req, res) => {
  await User.findByIdAndUpdate(req.params.id, { isBlocked: false });
  res.send("User unblocked");
});

// Create a new user
router.post("/users/add", async (req, res) => {
  const { username, password, role } = req.body;
  try {
    const newUser = new User({ username, password, role });
    await newUser.save();
    res.status(201).json(newUser);
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: "Failed to create user" });
  }
});

// Update a user
router.patch("/users/:id", async (req, res) => {
  const { id } = req.params;
  const { username, password, role } = req.body;
  try {
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { username, password, role },
      { new: true }
    );
    res.json(updatedUser);
  } catch (error) {
    res.status(400).json({ error: "Failed to update user" });
  }
});

// Delete a user
router.delete("/users/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await User.findByIdAndDelete(id);
    res.send("User deleted successfully");
  } catch (error) {
    res.status(400).json({ error: "Failed to delete user" });
  }
});

module.exports = router;
