// testDashboard.js
// Run with: node testDashboard.js

const BASE_URL = "http://localhost:5000/api";

async function testDashboard() {
  console.log("🚀 TESTING STUDENT DASHBOARD...");
  console.log("=================================");

  // 1. LOGIN
  console.log("\n🔐 Logging in as CSE2025001...");
  try {
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "CSE2025001", password: "password123" })
    });
    
    const loginData = await loginRes.json();
    
    if (!loginRes.ok) {
      throw new Error(`Login Failed: ${loginData.message}`);
    }

    const token = loginData.token;
    console.log("✅ Logged In. Token acquired.");

    // 2. GET PROFILE
    console.log("\n📄 Fetching Profile...");
    const profileRes = await fetch(`${BASE_URL}/student/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const profile = await profileRes.json();
    
    if (profileRes.ok) {
        console.log(`   Name: ${profile.firstName} ${profile.lastName}`);
        console.log(`   Roll No: ${profile.rollNumber}`);
        console.log(`   Dept: ${profile.departmentId.name}`);
    } else {
        console.log("❌ Profile Error:", profile.message);
    }

    // 3. GET ATTENDANCE
    console.log("\n📊 Fetching Attendance...");
    const attRes = await fetch(`${BASE_URL}/student/attendance`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const att = await attRes.json();
    
    if (attRes.ok) {
        console.log(`   Attendance: ${att.attendancePercentage}%`);
        console.log(`   Classes: ${att.presentClasses} Present / ${att.totalClasses} Total`);
    } else {
        console.log("❌ Attendance Error:", att.message);
    }

    // 4. GET COURSES
    console.log("\n📚 Fetching Timetable...");
    const courseRes = await fetch(`${BASE_URL}/student/courses`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const courses = await courseRes.json();
    
    if (courseRes.ok) {
        if(courses.length === 0) console.log("   No courses found.");
        courses.forEach(c => console.log(`   - [${c.courseCode}] ${c.courseName} (Prof. ${c.faculty})`));
    } else {
        console.log("❌ Courses Error:", courses.message);
    }

    // 5. GET MARKS
    console.log("\n📝 Fetching Marks...");
    const marksRes = await fetch(`${BASE_URL}/student/marks`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    const marks = await marksRes.json();

    if(marksRes.ok) {
        if(marks.length === 0) console.log("   No marks uploaded yet.");
        marks.forEach(m => console.log(`   - ${m.subject} (${m.exam}): ${m.obtained}/${m.max} (${m.percentage}%)`));
    } else {
        console.log("❌ Marks Error:", marks.message);
    }

  } catch (error) {
    console.error("❌ TEST FAILED:", error.message);
  }
  console.log("\n=================================");
}

testDashboard();