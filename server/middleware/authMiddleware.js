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
      // 1. Get token safely
      const parts = req.headers.authorization.split(" ");
      if (parts.length === 2) {
        token = parts[1];
      }

      if (!token) {
        return res.status(401).json({ message: "Not authorized, no token found" });
      }

      // 2. Verify Token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // 3. Load user
      req.user = await User.findById(decoded.id).select("-passwordHash");

      if (!req.user) {
        return res.status(401).json({ message: "Not authorized. User ID not found." });
      }

      // 4. Check Activity
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
  const allowedRoles = ['faculty', 'FACULTY', 'admin', 'ADMIN'];
  
  // Safety check: Ensure req.user exists before checking role
  if (req.user && allowedRoles.includes(req.user.role)) {
    next();
  } else {
    // If req.user is missing OR role is wrong, deny access
    res.status(403).json({ 
      message: `Access denied. Faculty role required.` 
    });
  }
};

// =========================================================
// 3️⃣ AUTHORIZE: Generic Role Check
// =========================================================
exports.authorize = (...roles) => {
  return (req, res, next) => {
    // 🛡️ SECURITY SAFETY CHECK
    // This ensures the server doesn't crash if 'protect' was forgotten.
    if (!req.user) {
        return res.status(401).json({ message: "Not authorized. User context missing." });
    }

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