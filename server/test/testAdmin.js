// testAdmin.js - Verifies that the Admin Controller works
const BASE_URL = "http://localhost:5000/api";

// 1. Credentials for the Admin we created in testAuth.js
const adminUser = {
  email: "admin@test.com",
  password: "password123" 
};


// Change this part in testAdmin.js
const newStudent = {
  name: "Rahul Sharma",
  email: "rahul2@college.com",       // <--- Changed to rahul2
  password: "studentpass",
  role: "student",
  rollNumber: "CSE-2025-02",         // <--- Changed to 02
  batch: 2025,
  departmentId: "CSE"
};


// 3. Data for the Department we need
const newDept = {
  name: "Computer Science & Engineering",
  code: "CSE"
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

    // =================================================================
    // B. (THE FIX) Ensure Department Exists Before Adding Student
    // =================================================================
    console.log("\n--- 1.5 Ensuring 'CSE' Department Exists ---");
    const deptRes = await fetch(`${BASE_URL}/admin/add-department`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}` 
      },
      body: JSON.stringify(newDept),
    });

    if (deptRes.ok) {
        console.log("✅ Department 'CSE' created.");
    } else {
        // It might fail if it already exists, which is fine!
        console.log("ℹ️  Department check (might already exist):", await deptRes.statusText);
    }

    // =================================================================
    // C. Try to Add a Student
    // =================================================================
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
    }

  } catch (error) {
    console.error("❌ Test Failed:", error.message);
  }
}

testAdminFlow();