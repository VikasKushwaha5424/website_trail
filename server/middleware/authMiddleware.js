const jwt = require("jsonwebtoken");
const User = require("../models/User");

// =========================================================
// 1️⃣ PROTECT: Verify Token & Load User
// =========================================================
exports.protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Load user
      req.user = await User.findById(decoded.id).select("-passwordHash");

      if (!req.user) {
        return res.status(401).json({ message: "Not authorized. User ID not found." });
      }

      if (req.user.isActive === false) {
        return res.status(403).json({ message: "Account is disabled. Contact Admin." });
      }

      next(); 
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
exports.facultyOnly = (req, res, next) => {
  // FIXED: Check for both lowercase and uppercase roles
  const allowedRoles = ['faculty', 'FACULTY', 'admin', 'ADMIN'];
  
  if (req.user && allowedRoles.includes(req.user.role)) {
    next();
  } else {
    res.status(403).json({ 
      message: `Access denied. Faculty role required. (Your role is: ${req.user ? req.user.role : 'Guest'})` 
    });
  }
};

// =========================================================
// 3️⃣ AUTHORIZE: Generic Role Check
// =========================================================
exports.authorize = (...roles) => {
  return (req, res, next) => {
    // FIXED: Normalize both user role and allowed roles to lowercase for comparison
    const userRole = req.user.role.toLowerCase();
    const allowedRoles = roles.map(r => r.toLowerCase());

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ 
        message: `Access Denied: Role '${req.user.role}' is not authorized.` 
      });
    }
    next();
  };
};