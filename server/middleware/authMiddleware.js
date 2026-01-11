const jwt = require("jsonwebtoken");
const User = require("../models/User");

// 1. PROTECT: Verifies the User is Logged In
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(" ")[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from the token ID (exclude password)
      // Check for both 'id' and '_id' to be safe
      req.user = await User.findById(decoded.id || decoded._id).select("-passwordHash");

      if (!req.user) {
        return res.status(401).json({ message: "User not found" });
      }

      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: "Not authorized, token failed" });
    }
  } else {
    // If no token at all
    res.status(401).json({ message: "Not authorized, no token" });
  }
};

// 2. ADMIN ONLY: Checks if User is Admin
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "Admin") {
    next();
  } else {
    res.status(403).json({ message: "Access denied. Admins only." });
  }
};

// 3. FACULTY ONLY: Checks if User is Faculty
const facultyOnly = (req, res, next) => {
  if (req.user && req.user.role === 'Faculty') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Faculty only.' });
  }
};

// Export ALL functions
module.exports = { protect, adminOnly, facultyOnly };