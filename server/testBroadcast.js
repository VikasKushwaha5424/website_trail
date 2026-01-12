// testBroadcast.js - Simulates an Admin sending a notice (NO TOKEN NEEDED)
// We use dynamic import for node-fetch
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function sendAlert() {
  console.log("📢 Admin is typing a message...");

  // Notice: No "Authorization" header needed now!
  const response = await fetch("http://localhost:5000/api/admin/broadcast", {
    method: "POST",
    headers: { 
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      title: "🚨 URGENT: CLASS CANCELLED",
      message: "Physics class is cancelled due to heavy rain. Enjoy the holiday!"
    })
  });

  const data = await response.json();
  console.log("Response:", data);
}

sendAlert();