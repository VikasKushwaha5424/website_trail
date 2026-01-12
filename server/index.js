const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const http = require("http");
const { Server } = require("socket.io");

// 🛡️ SECURITY PACKAGES
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
// ✅ SECURITY: Use modern 'xss' library
const xss = require("xss");

// 1. Import Routes
const authRoute = require("./routes/authRoutes"); 
const facultyRoute = require("./routes/faculty"); 
const adminRoute = require("./routes/admin"); 
const studentRoute = require("./routes/studentRoutes"); 
const userRoute = require("./routes/userRoutes"); 
const courseRoute = require("./routes/courseRoutes");
const feeRoute = require("./routes/feeRoutes");
const timetableRoute = require("./routes/timetableRoutes");
const hostelRoute = require("./routes/hostelRoutes");

// 2. Load Environment Variables
dotenv.config();

// 3. Connect to Database
connectDB();

// 4. Register Models
require("./models/User");
require("./models/Department");
require("./models/Course");
require("./models/StudentProfile"); 
require("./models/FacultyProfile");
require("./models/CourseOffering"); 
require("./models/Enrollment");
require("./models/Attendance");
require("./models/Marks");
require("./models/Fee"); 
require("./models/Timetable");
require("./models/Hostel");

// 5. Initialize Express
const app = express();

// ==========================================
// 🛡️ SECURITY LAYER (Phase 1)
// ==========================================

// A. Set Security Headers (Helmet)
app.use(helmet());

// B. Body Parsing (MUST BE BEFORE SANITIZATION)
app.use(express.json({ limit: "10kb" })); 
app.use(cors()); 

// C. Rate Limiting (Stops Spammers)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per 15 mins
  message: "Too many requests from this IP, please try again after 15 minutes."
});
app.use(limiter);

// D. Data Sanitization (Prevents MongoDB Injection)
app.use(mongoSanitize());

// E. XSS Protection (Modern Replacement)
// Helper function to recursively sanitize objects
const sanitizeData = (data) => {
    if (!data) return data;
    if (typeof data === 'string') {
        return xss(data); // Sanitize string
    }
    if (Array.isArray(data)) {
        return data.map(item => sanitizeData(item));
    }
    if (typeof data === 'object') {
        Object.keys(data).forEach(key => {
            data[key] = sanitizeData(data[key]);
        });
    }
    return data;
};

// Middleware to sanitize body, query, and params
app.use((req, res, next) => {
    if (req.body) req.body = sanitizeData(req.body);
    if (req.query) req.query = sanitizeData(req.query);
    if (req.params) req.params = sanitizeData(req.params);
    next();
});

// ==========================================

// 7. Define Routes
app.use("/api/auth", authRoute); 
app.use("/api/faculty", facultyRoute); 
app.use("/api/admin", adminRoute);
app.use("/api/student", studentRoute);
app.use("/api/users", userRoute);   
app.use("/api/courses", courseRoute); 
app.use("/api/fees", feeRoute);
app.use("/api/timetable", timetableRoute);
app.use("/api/hostel", hostelRoute);

// 8. Basic Test Route
app.get("/", (req, res) => {
  res.send("API is running...");
});

// ==========================================
// 9. GLOBAL ERROR HANDLER (Must be last)
// ==========================================
app.use((err, req, res, next) => {
  console.error(err.stack); // Log the error stack for debugging
  
  // Return a clean JSON error response
  res.status(500).json({ 
    message: "Internal Server Error", 
    error: process.env.NODE_ENV === "development" ? err.message : "Something went wrong"
  });
});

// ==========================================
// 🚀 REAL-TIME SERVER
// ==========================================

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

io.on("connection", (socket) => {
  console.log(`⚡ New Client Connected: ${socket.id}`);

  socket.on("join_room", (room) => {
    socket.join(room);
    console.log(`User ${socket.id} joined room: ${room}`);
    
    io.to(room).emit("receive_notice", {
      title: "Connection Established",
      message: `Welcome to the ${room} channel!`,
      time: new Date().toLocaleTimeString()
    });
  });

  socket.on("disconnect", () => {
    console.log("❌ Client Disconnected", socket.id);
  });
});

app.set("socketio", io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Mythic Server (SECURE + FAST) running on port ${PORT}`);
});