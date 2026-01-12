const Marks = require("../models/Marks");
const CourseOffering = require("../models/CourseOffering"); // 👈 Import this

// Helper: Convert Percentage to Grade Point
const getGradePoint = (percentage) => {
  if (percentage >= 90) return 10;
  if (percentage >= 80) return 9;
  if (percentage >= 70) return 8;
  if (percentage >= 60) return 7;
  if (percentage >= 50) return 6;
  if (percentage >= 40) return 5;
  return 0; // Fail
};

// ✅ FIX: Accept semesterId to limit calculation to one term
const calculateSGPA = async (studentId, semesterId) => {
  
  // 1. Find all CourseOfferings for this specific semester
  const semesterOfferings = await CourseOffering.find({ semesterId }).select("_id");
  const offeringIds = semesterOfferings.map(o => o._id);

  // 2. Fetch marks ONLY for those offerings
  const semesterMarks = await Marks.find({ 
    studentId, 
    courseOfferingId: { $in: offeringIds } 
  })
  .populate({
      path: "courseOfferingId",
      populate: { path: "courseId" } 
  });

  if (!semesterMarks || semesterMarks.length === 0) return 0;

  const courseTotals = {}; 

  semesterMarks.forEach((markEntry) => {
    // Safety Check
    if(!markEntry.courseOfferingId || !markEntry.courseOfferingId.courseId) return;

    const course = markEntry.courseOfferingId.courseId;
    const courseId = course._id.toString();

    if (!courseTotals[courseId]) {
      courseTotals[courseId] = { 
        name: course.name,
        totalObtained: 0, 
        totalMax: 0,      
        credits: course.credits 
      };
    }
    courseTotals[courseId].totalObtained += markEntry.marksObtained;
    courseTotals[courseId].totalMax += markEntry.maxMarks; 
  });

  let totalCredits = 0;
  let totalWeightedPoints = 0;

  for (const courseId in courseTotals) {
    const { totalObtained, totalMax, credits } = courseTotals[courseId];
    
    // Avoid division by zero
    const percentage = totalMax === 0 ? 0 : (totalObtained / totalMax) * 100;
    const gradePoint = getGradePoint(percentage);
    
    totalWeightedPoints += (gradePoint * credits);
    totalCredits += credits;
  }

  if (totalCredits === 0) return 0;

  const sgpa = (totalWeightedPoints / totalCredits).toFixed(2);
  return sgpa;
};

module.exports = { calculateSGPA };