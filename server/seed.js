const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("./models/User");
const connectDB = require("./config/db");

dotenv.config();
connectDB();

const users = [
  { userId: "21CSE045", username: "vikas", password: "123", role: "STUDENT" },
  { userId: "office01", username: "admin", password: "123", role: "OFFICE" },
  { userId: "teach01", username: "teacher", password: "123", role: "TEACHER" },
  { userId: "ment01", username: "mentor", password: "123", role: "MENTOR" },
  { userId: "hod01", username: "hod", password: "123", role: "HOD" },
  { userId: "prin01", username: "principal", password: "123", role: "PRINCIPAL" }
];

const importData = async () => {
  try {
    await User.deleteMany(); // Clears old data
    await User.insertMany(users);
    console.log("Data Imported!");
    process.exit();
  } catch (error) {
    console.error(`Error: ${error}`);
    process.exit(1);
  }
};

importData();