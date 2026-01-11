const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

// Load Environment Variables
dotenv.config();

// Initialize App
const app = express();

// Middleware
app.use(express.json()); // Allows parsing JSON body
app.use(cors()); // Allows Frontend to talk to Backend

// 🔌 Database Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.log("❌ DB Connection Error:", err));

// ==========================================
// 🚦 ROUTES (Level-2 API)
// ==========================================

// 1. Authentication (Login/Register)
app.use("/api/auth", require("./routes/authRoutes"));

// 2. Student Dashboard (Profile, Timetable, Marks)
app.use("/api/student", require("./routes/studentRoutes")); 

// Base Route (Test if server is running)
app.get("/", (req, res) => {
  res.send("🚀 Server is Running & Level-2 Ready!");
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});