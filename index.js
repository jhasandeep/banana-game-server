
const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const socketIo = require("socket.io");
const cors = require("cors");
const dotenv = require("dotenv");

const User = require("./models/User");
const authRoutes = require("./routes/auth");
const adminRoutes = require("./routes/admin");
const playerRoutes = require("./routes/player");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    Credential: true,
  },
});

dotenv.config({
  path: "./config/config.env",
});

mongoose.connect(process.env.MONGO_URI);
app.use(
  cors({
    origin:"*",
    credentials: true,
  })
);
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/ranking", playerRoutes);

let onlineUsers = new Set();

io.on("connection", (socket) => {
  console.log("New connection:", socket.id);

  socket.on("playerConnected", (userId) => {
    onlineUsers.add(userId);
    console.log("check ids connected", Array.from(onlineUsers));
    io.emit("updateOnlinePlayers", Array.from(onlineUsers));
  });

  socket.on("bananaClick", async (userId) => {
    const user = await User.findById(userId);
    const users = await User.find();

    if (user && !user.isBlocked) {
      user.clickCount += 1;
      await user.save();
      io.emit("updateRanking", {
        userId: user._id,
        clickCount: user.clickCount,
      });

      const userIndex = users.findIndex(
        (u) => u._id.toString() === user._id.toString()
      );

      if (userIndex !== -1) {
        users[userIndex] = {
          clickCount: user.clickCount,
          isBlocked: user.isBlocked,
          password: user.password,
          role: user.role,
          username: user.username,
          _id: user._id,
        };
      } else {
        users.push({
          clickCount: user.clickCount,
          isBlocked: user.isBlocked,
          password: user.password,
          role: user.role,
          username: user.username,
          _id: user._id,
        });
      }

      io.emit("getRanking", users);
    }
  });

  socket.on("disconnect", (userId) => {
    onlineUsers.delete(userId);
    console.log("check ids disconnected", Array.from(onlineUsers));
    io.emit("updateOnlinePlayers", Array.from(onlineUsers));
  });
});

app.get("/", (req,res)=>{

  res.status(200).json({success:true, message:"hello world"})
})
const Port = process.env.PORT || 5000
server.listen(Port, () =>
  console.log(`Server running on port ${Port}`)
);
