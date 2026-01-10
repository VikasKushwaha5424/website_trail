// testAuth.js
// Note: We use native 'fetch' (available in Node v18+), so no require needed.

const BASE_URL = "http://localhost:5000/api/auth";

async function testLogin() {
  console.log("\n🧪 STARTING AUTHENTICATION TESTS...");
  console.log("=====================================");

  // ----------------------------------------------------
  // TEST 1: Manual Login (Roll Number + Password)
  // ----------------------------------------------------
  console.log("\n1️⃣  Testing Manual Login (Roll No: STU001)...");
  
  try {
    const response = await fetch(`${BASE_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        rollNumber: "STU001", // This user was created in seed.js
        password: "123456"
      })
    });

    const data = await response.json();

    if (response.ok) {
      console.log("✅ SUCCESS! Logged in as:", data.user.email);
      // Check if token exists before trying to print it
      if (data.token) {
        console.log("🔑 Token Received:", data.token.substring(0, 20) + "...");
      } else {
        console.log("⚠️  Login successful but NO TOKEN received (Check authController).");
      }
    } else {
      console.log("❌ FAILED:", data.message);
    }
  } catch (err) {
    console.log("❌ ERROR:", err.message);
  }

  // ----------------------------------------------------
  // TEST 2: Google Login (Simulation)
  // ----------------------------------------------------
  console.log("\n2️⃣  Testing Google Login (Email: john@student.com)...");

  try {
    // ✅ FIXED URL: Now pointing to /google-login (instead of /google)
    const googleResponse = await fetch(`${BASE_URL}/google-login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "john@student.com" // This email matches STU001
      })
    });

    const googleData = await googleResponse.json();

    if (googleResponse.ok) {
      console.log("✅ SUCCESS! Google Account Linked found.");
      if (googleData.token) {
        console.log("🔑 Token Received:", googleData.token.substring(0, 20) + "...");
      } else {
        console.log("⚠️  Login successful but NO TOKEN received.");
      }
    } else {
      console.log("❌ FAILED:", googleData.message);
    }
  } catch (err) {
    console.log("❌ ERROR:", err.message);
  }
  
  console.log("\n=====================================");
}

testLogin();