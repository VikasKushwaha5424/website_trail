const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const http = require("http"); // <--- NEW: Import HTTP module
const { Server } = require("socket.io"); // <--- NEW: Import Socket.io

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

// 6. Middleware
app.use(express.json()); 
app.use(cors()); 

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
// 🚀 LEVEL 4 UPGRADE: REAL-TIME SERVER
// ==========================================

// A. Create HTTP Server (Wraps Express)
const server = http.createServer(app);

// B. Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // Allow your React Frontend to connect
    methods: ["GET", "POST"]
  }
});

// C. Listen for Connections
io.on("connection", (socket) => {
  console.log(`⚡ New Client Connected: ${socket.id}`);

  // Event: User Joins a "Room" (e.g., "Class-CS101")
  // Event: User Joins a "Room"
  socket.on("join_room", (room) => {
    socket.join(room);
    console.log(`User ${socket.id} joined room: ${room}`);

    // 🚀 NEW: Send a Real-Time Notification back to the room
    io.to(room).emit("receive_notice", {
      title: "Connection Established",
      message: `Welcome to the ${room} channel! You are now live.`,
      time: new Date().toLocaleTimeString()
    });
  });

  // Event: Disconnect
  socket.on("disconnect", () => {
    console.log("❌ Client Disconnected", socket.id);
  });
});

// Make 'io' accessible to our Routes (so Controllers can send alerts!)
app.set("socketio", io);

// 9. Start Server (Use 'server.listen', NOT 'app.listen')
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Mythic Server running on port ${PORT}`);
});