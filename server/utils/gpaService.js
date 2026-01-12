const Marks = require("../models/Marks");

// Helper: Convert Percentage to Grade Point (10-point scale)
const getGradePoint = (percentage) => {
  if (percentage >= 90) return 10;
  if (percentage >= 80) return 9;
  if (percentage >= 70) return 8;
  if (percentage >= 60) return 7;
  if (percentage >= 50) return 6;
  if (percentage >= 40) return 5;
  return 0; // Fail
};

const calculateSGPA = async (studentId) => {
  // 1. Fetch ALL marks for this student
  // We need the Course Details (Credits) associated with these marks
  const allMarks = await Marks.find({ studentId })
    .populate({
      path: "courseOfferingId",
      populate: { path: "courseId" } // Deep populate to get Course Credits
    });

  if (!allMarks || allMarks.length === 0) return 0;

  // 2. Group Marks by Course (e.g., Physics: [Internal: 20, Final: 60] -> Total: 80)
  const courseTotals = {}; // { "course_id_123": { totalMarks: 80, credits: 4 } }

  allMarks.forEach((markEntry) => {
    const course = markEntry.courseOfferingId.courseId;
    const courseId = course._id.toString();

    if (!courseTotals[courseId]) {
      courseTotals[courseId] = { 
        name: course.name,
        totalMarks: 0, 
        credits: course.credits 
      };
    }
    // Add marks (Example: 20 from Internal + 50 from Final)
    courseTotals[courseId].totalMarks += markEntry.marksObtained;
  });

  // 3. Calculate Weighted Score
  let totalCredits = 0;
  let totalWeightedPoints = 0;

  console.log("\n📊 --- GRADE REPORT ---");
  for (const courseId in courseTotals) {
    const { name, totalMarks, credits } = courseTotals[courseId];
    
    // Convert 100/100 scale to Grade Point
    const gradePoint = getGradePoint(totalMarks);
    
    console.log(`📘 ${name}: ${totalMarks} Marks -> Grade Point: ${gradePoint} (Credits: ${credits})`);

    totalWeightedPoints += (gradePoint * credits);
    totalCredits += credits;
  }

  if (totalCredits === 0) return 0;

  // 4. Final SGPA Formula
  const sgpa = (totalWeightedPoints / totalCredits).toFixed(2);
  console.log(`\n🏆 Calculated SGPA: ${sgpa}`);
  console.log("-----------------------");
  
  return sgpa;
};

module.exports = { calculateSGPA };