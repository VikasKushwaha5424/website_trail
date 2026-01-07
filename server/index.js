const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
// 1. Import Routes Here
const authRoute = require("./routes/auth"); 

// 2. Load Environment Variables
dotenv.config();

// 3. Connect to Database
connectDB();

// 4. Initialize Express
const app = express();

// 5. Middleware
app.use(express.json()); // Allows JSON data
app.use(cors()); // Allows Frontend to connect

// 6. Define Routes
// This sets up the route: http://localhost:5000/api/auth/login
app.use("/api/auth", authRoute); 

// 7. Basic Test Route
app.get("/", (req, res) => {
  res.send("API is running...");
});

// 8. Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});