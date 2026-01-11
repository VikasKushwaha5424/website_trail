const jwt = require("jsonwebtoken");
const User = require("../models/User");

// =========================================================
// 1️⃣ PROTECT: Verify Token & Load User
// =========================================================
exports.protect = async (req, res, next) => {
  let token;

  // Check for "Bearer <token>" in the Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // 1. Get token from header (Remove "Bearer " prefix)
      token = req.headers.authorization.split(" ")[1];

      // 2. Verify Token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 3. Get User from Database (Exclude password)
      // We assume the payload has 'id'. Adjust if yours uses 'userId'
      req.user = await User.findById(decoded.id).select("-passwordHash");

      if (!req.user) {
        return res.status(401).json({ message: "Not authorized. User ID not found." });
      }

      // 4. Check if Account is Active (Safety Check)
      if (req.user.isActive === false) {
        return res.status(403).json({ message: "Account is disabled. Contact Admin." });
      }

      next(); // Move to the next middleware
    } catch (error) {
      console.error("Auth Middleware Error:", error.message);
      res.status(401).json({ message: "Not authorized, invalid token" });
    }
  } else {
    res.status(401).json({ message: "Not authorized, no token provided" });
  }
};

// =========================================================
// 2️⃣ FACULTY ONLY: Specific Role Check
// =========================================================
// This is the function your faculty.js was looking for!
exports.facultyOnly = (req, res, next) => {
  // Ensure protect() ran first and loaded req.user
  if (req.user && (req.user.role === 'faculty' || req.user.role === 'admin')) {
    next();
  } else {
    res.status(403).json({ 
      message: `Access denied. Faculty role required. (Your role is: ${req.user ? req.user.role : 'Guest'})` 
    });
  }
};

// =========================================================
// 3️⃣ AUTHORIZE: Generic Role Check (Optional Helper)
// =========================================================
// Useful if you want to allow multiple roles dynamically later
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `Access Denied: Role '${req.user.role}' is not authorized.` 
      });
    }
    next();
  };
};