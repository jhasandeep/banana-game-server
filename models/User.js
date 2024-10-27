const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["admin", "player"], default: "player" },
  clickCount: { type: Number, default: 0 },
  isBlocked: { type: Boolean, default: false },
});

module.exports = mongoose.model("User", userSchema);
