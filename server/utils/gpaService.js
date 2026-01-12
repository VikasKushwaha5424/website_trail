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
  const allMarks = await Marks.find({ studentId })
    .populate({
      path: "courseOfferingId",
      populate: { path: "courseId" } 
    });

  if (!allMarks || allMarks.length === 0) return 0;

  const courseTotals = {}; 

  allMarks.forEach((markEntry) => {
    const course = markEntry.courseOfferingId.courseId;
    const courseId = course._id.toString();

    if (!courseTotals[courseId]) {
      courseTotals[courseId] = { 
        name: course.name,
        totalObtained: 0, // Track Obtained
        totalMax: 0,      // ✅ FIX: Track Max Possible Marks
        credits: course.credits 
      };
    }
    courseTotals[courseId].totalObtained += markEntry.marksObtained;
    courseTotals[courseId].totalMax += markEntry.maxMarks; // ✅ FIX: Sum Max Marks
  });

  let totalCredits = 0;
  let totalWeightedPoints = 0;

  console.log("\n📊 --- GRADE REPORT ---");
  for (const courseId in courseTotals) {
    const { name, totalObtained, totalMax, credits } = courseTotals[courseId];
    
    // ✅ FIX: Calculate true percentage
    // If no max marks defined (prevent div by zero), assume 0%
    const percentage = totalMax === 0 ? 0 : (totalObtained / totalMax) * 100;
    
    const gradePoint = getGradePoint(percentage);
    
    console.log(`📘 ${name}: ${totalObtained}/${totalMax} (${percentage.toFixed(1)}%) -> GP: ${gradePoint}`);

    totalWeightedPoints += (gradePoint * credits);
    totalCredits += credits;
  }

  if (totalCredits === 0) return 0;

  const sgpa = (totalWeightedPoints / totalCredits).toFixed(2);
  console.log(`\n🏆 Calculated SGPA: ${sgpa}`);
  return sgpa;
};

module.exports = { calculateSGPA };