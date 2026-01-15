const { body, validationResult } = require('express-validator');

// 1. Generic Validator Handler (Checks for errors)
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false, 
      errors: errors.array().map(err => err.msg) 
    });
  }
  next();
};

// 2. Specific Validation Rules

// A. Validate Semester Creation
exports.validateSemester = [
  body('name')
    .trim()
    .notEmpty().withMessage('Semester name is required'),
  
  body('code')
    .trim()
    .notEmpty().withMessage('Semester code is required'),
  
  body('academicYear')
    .matches(/^\d{4}-\d{4}$/).withMessage('Academic Year must be in format YYYY-YYYY (e.g., 2025-2026)'),

  body('startDate')
    .isISO8601().toDate().withMessage('Valid Start Date is required'),

  body('endDate')
    .isISO8601().toDate().withMessage('Valid End Date is required')
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.startDate)) {
        throw new Error('End Date must be after Start Date');
      }
      return true;
    }),

  validate // Always include the handler at the end
];

// B. Validate User Creation (Example)
exports.validateUser = [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 chars'),
  body('role').isIn(['student', 'faculty', 'admin']).withMessage('Invalid Role'),
  validate
];