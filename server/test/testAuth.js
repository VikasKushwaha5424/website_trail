// testAuth.js - Quick Backend Test

const BASE_URL = "http://localhost:5000/api/auth";

// 1. Define a Test User
const testUser = {
  name: "Test Admin",
  email: "admin@test.com",
  password: "password123", 
  role: "admin", // We try to create an admin
  rollNumber: "ADM001" 
};

// Function to Register
async function registerUser() {
  console.log("\n--- 1. Testing Registration ---");
  try {
    const response = await fetch(`${BASE_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(testUser),
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log("✅ Registration Success:", data);
    } else {
      console.log("⚠️ Registration Message:", data.message);
    }
  } catch (error) {
    console.error("❌ Network Error (Register):", error.cause || error);
  }
}

// Function to Login
async function loginUser() {
  console.log("\n--- 2. Testing Login ---");
  try {
    const response = await fetch(`${BASE_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: testUser.email,
        password: testUser.password
      }),
    });

    const data = await response.json();

    if (response.ok) {
      console.log("✅ Login Success!");
      console.log("🔑 Received Token:", data.token ? "Yes" : "No");
    } else {
      console.log("❌ Login Failed:", data.message);
    }
  } catch (error) {
    console.error("❌ Network Error (Login):", error.cause || error);
  }
}

// Run the tests
async function runTests() {
  await registerUser();
  await loginUser();
}

runTests();