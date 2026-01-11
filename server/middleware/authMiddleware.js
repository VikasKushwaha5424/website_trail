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
      // We accept 'id' because our generateToken used 'id'
      req.user = await User.findById(decoded.id).select("-passwordHash");

      if (!req.user) {
        return res.status(401).json({ message: "Not authorized. User ID not found." });
      }

      // 4. Check if Account is Active (Level-2 Safety)
      if (!req.user.isActive) {
        return res.status(403).json({ message: "Account is disabled. Contact Admin." });
      }

      next(); // Move to the next middleware/controller
    } catch (error) {
      console.error("Auth Middleware Error:", error.message);
      return res.status(401).json({ message: "Not authorized, invalid token" });
    }
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token provided" });
  }
};

// =========================================================
// 2️⃣ AUTHORIZE: Role-Based Access Control (RBAC)
// =========================================================
// Usage: router.get('/admin-dashboard', protect, authorize('ADMIN', 'PRINCIPAL'), controller)
exports.authorize = (...roles) => {
  return (req, res, next) => {
    // Check if the user's role is in the allowed list
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `Access Denied: Role '${req.user.role}' is not authorized.` 
      });
    }
    next();
  };
};