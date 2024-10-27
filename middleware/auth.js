const jwt = require("jsonwebtoken");

function auth(req, res, next) {
  const authHeader = req.header("Authorization");
  if (!authHeader) {
    return res.status(401).send("Access denied. No token provided.");
  }

  // Extract token from the header
  const token = authHeader.replace("Bearer ", "");

  // Verify the token
  jwt.verify(token, "your_jwt_secret", (err, decoded) => {
    if (err) {
      return res.status(401).send("Access denied. Invalid token.");
    }
    req.user = decoded;
    next(); // Call the next middleware
  });
}

function adminOnly(req, res, next) {
  // Check if the user is an admin
  if (req.user.role !== "admin") {
    return res.status(403).send("Admin access required.");
  }
  next(); // Call the next middleware
}

module.exports = { auth, adminOnly };
