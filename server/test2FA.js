// test2FA.js - Simulate setting up 2FA
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

// ⚠️ PASTE YOUR TOKEN HERE (Login via Postman or previous test to get one)
const TOKEN = "PASTE_YOUR_JWT_TOKEN_HERE"; 

async function testSetup() {
  console.log("🔐 Requesting 2FA Setup...");
  
  const response = await fetch("http://localhost:5000/api/auth/2fa/setup", {
    method: "POST",
    headers: { "Authorization": `Bearer ${TOKEN}` }
  });

  const data = await response.json();
  
  if (data.qrCode) {
    console.log("✅ Success! QR Code Data URL received.");
    console.log("🔑 Secret:", data.secret);
    console.log("📸 (In a real app, this huge text blob becomes a QR image)");
  } else {
    console.log("❌ Failed:", data);
  }
}

testSetup();