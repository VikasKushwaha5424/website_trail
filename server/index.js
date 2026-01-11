const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");

// 1. Import Routes
const authRoute = require("./routes/authRoutes"); 
const facultyRoute = require("./routes/faculty"); 
const adminRoute = require("./routes/admin"); // Check if filename is admin.js or adminRoutes.js
const studentRoute = require("./routes/student");
const userRoute = require("./routes/userRoutes"); // <--- NEW: For Faculty List
const courseRoute = require("./routes/courseRoutes"); // <--- NEW: For Course List
const userRoute = require("./routes/userRoutes"); 
const courseRoute = require("./routes/courseRoutes");

// 2. Load Environment Variables
dotenv.config();

// 3. Connect to Database
connectDB();

// ----------------------------------------------------
// 4. REGISTER MODELS (Prevents "Schema hasn't been registered" errors)
// ----------------------------------------------------
require("./models/User");
require("./models/Department");
require("./models/Course");
require("./models/Student");
require("./models/FacultyProfile");
require("./models/FacultyCourse");
require("./models/Enrollment");
require("./models/Attendance");
// ----------------------------------------------------

// 5. Initialize Express
const app = express();

// 6. Middleware
app.use(express.json()); 
app.use(cors()); 

// 7. Define Routes
// Make sure these match what is in your Frontend API calls!
app.use("/api/auth", authRoute); 
app.use("/api/faculty", facultyRoute); 
app.use("/api/admin", adminRoute);
app.use("/api/student", studentRoute);
app.use("/api/users", userRoute);   // <--- NEW: Handles /api/users/faculty-list
app.use("/api/courses", courseRoute); // <--- NEW: Handles /api/courses


// 8. Basic Test Route
app.get("/", (req, res) => {
  res.send("API is running...");
});

// 9. Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});