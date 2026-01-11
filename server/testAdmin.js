// testAdmin.js - Verifies that the Admin Controller works
const BASE_URL = "http://localhost:5000/api";

// 1. Credentials for the Admin we created in testAuth.js
const adminUser = {
  email: "admin@test.com",
  password: "password123" 
};

// 2. Data for a NEW Student we want to add
const newStudent = {
  name: "Rahul Sharma",  // The Admin Controller should split this into "Rahul" and "Sharma"
  email: "rahul@college.com",
  password: "studentpass",
  role: "student",
  rollNumber: "CSE-2025-01",
  batch: 2025,
  departmentId: "CSE" // Assumes you have logic to handle this or it might fail if Dept doesn't exist yet
};

async function testAdminFlow() {
  console.log("\n--- 1. Logging in as Admin ---");
  let token;
  
  try {
    // A. Login to get the Token
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(adminUser),
    });
    const loginData = await loginRes.json();

    if (!loginRes.ok) throw new Error(loginData.message);
    
    token = loginData.token;
    console.log("✅ Admin Login Success! Token acquired.");

    // B. Try to Add a Student
    console.log("\n--- 2. Creating a Student (Testing Name Split Logic) ---");
    const addRes = await fetch(`${BASE_URL}/admin/add-user`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}` // Send the token!
      },
      body: JSON.stringify(newStudent),
    });

    const addData = await addRes.json();

    if (addRes.ok) {
      console.log("✅ Student Created Successfully!");
      console.log("   User Details:", addData.user);
    } else {
      console.log("❌ Creation Failed:", addData.error || addData.message);
      
      // Hint: If it fails due to Department, we might need to create a Dept first.
      if (addData.error && addData.error.includes("Department")) {
        console.log("   (Hint: You might need to create a Department first via /api/admin/add-department)");
      }
    }

  } catch (error) {
    console.error("❌ Test Failed:", error.message);
  }
}

testAdminFlow();