const express = require("express");
const dotenv = require("dotenv");
// 1. Load Env Vars FIRST (Before routes/db)
dotenv.config();

const cors = require("cors");
const connectDB = require("./config/db");
const http = require("http");
const { Server } = require("socket.io");

// 🛡️ SECURITY PACKAGES
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");

// 2. Import Routes
const authRoute = require("./routes/authRoutes"); 
const facultyRoute = require("./routes/faculty"); 
const adminRoute = require("./routes/admin"); 
const studentRoute = require("./routes/studentRoutes"); 
const userRoute = require("./routes/userRoutes"); 
const courseRoute = require("./routes/courseRoutes");
const feeRoute = require("./routes/feeRoutes");
const timetableRoute = require("./routes/timetableRoutes");
const hostelRoute = require("./routes/hostelRoutes");
const marksRoute = require("./routes/marksRoutes"); // 👈 ADDED: Import Marks Route

// 3. Connect to Database
connectDB();

// 4. Register Models (Good practice to ensure they are registered)
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
require("./models/ExamSchedule"); // Ensure ExamSchedule is also registered if used

// 5. Initialize Express
const app = express();

// ==========================================
// 🛡️ SECURITY LAYER
// ==========================================

app.use(helmet());
app.use(express.json({ limit: "10kb" })); 
app.use(cors()); 

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100, 
  message: "Too many requests from this IP, please try again after 15 minutes."
});
app.use(limiter);

// ❌ COMMENTED OUT TO FIX CRASH (Incompatible with Express 5)
// app.use(mongoSanitize()); 

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
app.use("/api/marks", marksRoute); // 👈 ADDED: Register Marks Route

// 8. Basic Test Route
app.get("/", (req, res) => {
  res.send("API is running...");
});

// 9. GLOBAL ERROR HANDLER
app.use((err, req, res, next) => {
  console.error(err.stack); 
  res.status(500).json({ 
    message: "Internal Server Error", 
    error: process.env.NODE_ENV === "development" ? err.message : "Something went wrong"
  });
});

// ==========================================
// 🚀 REAL-TIME SERVER
// ==========================================

const server = http.createServer(app);

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173", // Added Vite Default Port
  process.env.CLIENT_URL
].filter(Boolean);

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  }
});

io.on("connection", (socket) => {
  console.log(`⚡ New Client Connected: ${socket.id}`);

  socket.on("join_room", (room) => {
    socket.join(room);
    console.log(`User ${socket.id} joined room: ${room}`);
  });

  socket.on("disconnect", () => {
    console.log("❌ Client Disconnected", socket.id);
  });
});

app.set("socketio", io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Mythic Server running on port ${PORT}`);
  console.log(`📡 Socket.io allowed origins:`, allowedOrigins); 
});