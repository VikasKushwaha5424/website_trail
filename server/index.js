const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");

// 1. Load Environment Variables
dotenv.config();

// 2. Connect to Database
connectDB();

// 3. Initialize Express
const app = express();

// 4. Middleware
app.use(express.json()); // Allows us to accept JSON data in the body
app.use(cors()); // Allows our React client to make requests to this server

// 5. Basic Test Route
app.get("/", (req, res) => {
  res.send("API is running...");
});

// 6. Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


// ... existing imports
const authRoute = require("./routes/auth"); // ADD THIS

// ... existing app.use middleware

app.use("/api/auth", authRoute); // ADD THIS BEFORE app.listen