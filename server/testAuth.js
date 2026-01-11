// testAuth.js
// Run with: node testAuth.js
// Requirement: Node v18+ (for native fetch)

const BASE_URL = "http://localhost:5000/api/auth";

async function testLogin() {
  console.log("\n🧪 STARTING LEVEL-2 AUTHENTICATION TESTS...");
  console.log("===========================================");

  // ----------------------------------------------------
  // TEST 1: Manual Login (Username + Password)
  // ----------------------------------------------------
  console.log("\n1️⃣  Testing Manual Login (User: CSE2025001)...");
  
  try {
    const response = await fetch(`${BASE_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: "CSE2025001", // ✅ UPDATED: Matches new Seed Data
        password: "password123" // ✅ UPDATED: Matches new Seed Password
      })
    });

    const data = await response.json();

    if (response.ok) {
      console.log("✅ SUCCESS! Logged in as:", data.user.email);
      console.log(`   Role: ${data.user.role}`); // Verifying Role
      
      if (data.token) {
        console.log("🔑 Token Received:", data.token.substring(0, 20) + "...");
      } else {
        console.log("⚠️  Login successful but NO TOKEN received.");
      }
    } else {
      console.log("❌ FAILED:", data.message);
    }
  } catch (err) {
    console.log("❌ ERROR:", err.message);
  }

  // ----------------------------------------------------
  // TEST 2: Google Login (Email Only)
  // ----------------------------------------------------
  console.log("\n2️⃣  Testing Google Login (Email: vikas@student.edu)...");

  try {
    const googleResponse = await fetch(`${BASE_URL}/google-login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "vikas@student.edu" // ✅ UPDATED: Matches new Seed Email
      })
    });

    const googleData = await googleResponse.json();

    if (googleResponse.ok) {
      console.log("✅ SUCCESS! Google Account Linked found.");
      console.log(`   User: ${googleData.user.username}`);
      
      if (googleData.token) {
        console.log("🔑 Token Received:", googleData.token.substring(0, 20) + "...");
      }
    } else {
      console.log("❌ FAILED:", googleData.message);
    }
  } catch (err) {
    console.log("❌ ERROR:", err.message);
  }
  
  // ----------------------------------------------------
  // TEST 3: Fail Scenario (Wrong Password)
  // ----------------------------------------------------
  console.log("\n3️⃣  Testing Invalid Password...");

  try {
    const failResponse = await fetch(`${BASE_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: "CSE2025001",
        password: "wrongpassword"
      })
    });
    
    const failData = await failResponse.json();
    
    if (failResponse.status === 401) {
      console.log("✅ SUCCESS! System correctly rejected invalid password.");
    } else {
      console.log("❌ FAILED: Should have rejected login, but got:", failData);
    }

  } catch (err) {
     console.log("❌ ERROR:", err.message);
  }

  console.log("\n===========================================");
}

testLogin();