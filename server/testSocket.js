// testSocket.js - Simulates a Real-Time Client
const io = require("socket.io-client");

console.log("📡 Attempting to connect to Mythic Server...");

// 1. Connect to the Server
const socket = io("http://localhost:5000");

// 2. Listen for Success
socket.on("connect", () => {
  console.log(`✅ Connected! My Socket ID is: ${socket.id}`);
  
  // 3. Try to Join a Room
  console.log("➡️ Joining Room: 'Physics_Class'...");
  socket.emit("join_room", "Physics_Class");
});

// 4. Listen for Disconnect
socket.on("disconnect", () => {
  console.log("❌ Disconnected");
});

// 5. Listen for Notifications
socket.on("receive_notice", (data) => {
  console.log("\n🔔 --- NEW ALERT RECEIVED ---");
  console.log(`📢 Title: ${data.title}`);
  console.log(`💬 Message: ${data.message}`);
  console.log(`⏰ Time: ${data.time}`);
  console.log("------------------------------\n");
});