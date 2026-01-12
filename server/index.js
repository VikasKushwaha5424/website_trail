const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");

// 1. Import Routes
const authRoute = require("./routes/authRoutes"); 
const facultyRoute = require("./routes/faculty"); 
const adminRoute = require("./routes/admin"); 
const studentRoute = require("./routes/studentRoutes"); 
const userRoute = require("./routes/userRoutes"); 
const courseRoute = require("./routes/courseRoutes");

// --- LEVEL 2 ROUTES ---
const feeRoute = require("./routes/feeRoutes");
const timetableRoute = require("./routes/timetableRoutes");
const hostelRoute = require("./routes/hostelRoutes");

// 2. Load Environment Variables
dotenv.config();

// 3. Connect to Database
connectDB();

// ----------------------------------------------------
// 4. REGISTER MODELS 
// ----------------------------------------------------
require("./models/User");
require("./models/Department");
require("./models/Course");
require("./models/StudentProfile"); 
require("./models/FacultyProfile");
require("./models/CourseOffering"); 
require("./models/Enrollment");
require("./models/Attendance");
require("./models/Marks");

// --- LEVEL 2 MODELS ---
require("./models/Fee"); 
require("./models/Timetable");
require("./models/Hostel");
// ----------------------------------------------------

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

// --- LEVEL 2 API ENDPOINTS ---
app.use("/api/fees", feeRoute);
app.use("/api/timetable", timetableRoute);
app.use("/api/hostel", hostelRoute);

// 8. Basic Test Route
app.get("/", (req, res) => {
  res.send("API is running...");
});

// 9. Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});