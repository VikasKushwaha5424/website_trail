const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");

// 1. Import Routes Here
const authRoute = require("./routes/auth"); 
const facultyRoute = require("./routes/faculty"); // <--- Make sure this is imported!
const adminRoute = require("./routes/admin");
const studentRoute = require("./routes/student");

// 2. Load Environment Variables
dotenv.config();

// 3. Connect to Database
connectDB();

// ----------------------------------------------------
// 4. REGISTER MODELS (Important for Mongoose)
// ----------------------------------------------------
require("./models/User");
require("./models/Department");
require("./models/Course");
require("./models/Student");
require("./models/FacultyProfile");
require("./models/FacultyCourse");
require("./models/Enrollment");
require("./models/Attendance");
require("./models/Marks");
require("./models/Announcement");
// ----------------------------------------------------

// 5. Initialize Express
const app = express();

// 6. Middleware
app.use(express.json()); // Allows JSON data
app.use(cors()); // Allows Frontend to connect

// 7. Define Routes
app.use("/api/auth", authRoute); 
app.use("/api/faculty", facultyRoute); // <--- Added here
app.use("/api/admin", adminRoute);
app.use("/api/student", studentRoute);

// 8. Basic Test Route
app.get("/", (req, res) => {
  res.send("API is running...");
});

// 9. Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});