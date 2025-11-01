const { body, query, validationResult } = require('express-validator');

// Validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(err => err.msg)
    });
  }
  next();
};

// Create job validation
const createJobValidation = [
  body('title')
    .notEmpty()
    .withMessage('Job title is required')
    .trim()
    .isLength({ min: 5 })
    .withMessage('Job title must be at least 5 characters'),
  body('description')
    .notEmpty()
    .withMessage('Job description is required')
    .trim()
    .isLength({ min: 50 })
    .withMessage('Job description must be at least 50 characters'),
  body('requirements')
    .notEmpty()
    .withMessage('Job requirements are required')
    .trim()
    .isLength({ min: 50 })
    .withMessage('Job requirements must be at least 50 characters'),
  body('requiredSkills')
    .isArray({ min: 1 })
    .withMessage('At least one required skill is needed'),
  body('location')
    .notEmpty()
    .withMessage('Location is required')
    .trim(),
  body('jobType')
    .isIn(['full-time', 'part-time', 'contract', 'internship'])
    .withMessage('Job type must be one of: full-time, part-time, contract, internship'),
  body('experienceLevel')
    .isIn(['entry', 'mid', 'senior', 'lead'])
    .withMessage('Experience level must be one of: entry, mid, senior, lead'),
  body('salaryMin')
    .optional()
    .isNumeric()
    .isInt({ min: 0 })
    .withMessage('Minimum salary must be a non-negative number'),
  body('salaryMax')
    .optional()
    .isNumeric()
    .isInt({ min: 0 })
    .withMessage('Maximum salary must be a non-negative number')
    .custom((value, { req }) => {
      if (req.body.salaryMin && value < req.body.salaryMin) {
        throw new Error('Maximum salary must be greater than or equal to minimum salary');
      }
      return true;
    }),
  validate
];

// Update job validation (all fields optional)
const updateJobValidation = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 5 })
    .withMessage('Job title must be at least 5 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 50 })
    .withMessage('Job description must be at least 50 characters'),
  body('requirements')
    .optional()
    .trim()
    .isLength({ min: 50 })
    .withMessage('Job requirements must be at least 50 characters'),
  body('requiredSkills')
    .optional()
    .isArray({ min: 1 })
    .withMessage('At least one required skill is needed'),
  body('location').optional().trim(),
  body('jobType')
    .optional()
    .isIn(['full-time', 'part-time', 'contract', 'internship'])
    .withMessage('Job type must be one of: full-time, part-time, contract, internship'),
  body('experienceLevel')
    .optional()
    .isIn(['entry', 'mid', 'senior', 'lead'])
    .withMessage('Experience level must be one of: entry, mid, senior, lead'),
  body('salaryMin')
    .optional()
    .isNumeric()
    .isInt({ min: 0 })
    .withMessage('Minimum salary must be a non-negative number'),
  body('salaryMax')
    .optional()
    .isNumeric()
    .isInt({ min: 0 })
    .withMessage('Maximum salary must be a non-negative number'),
  validate
];

module.exports = {
  createJobValidation,
  updateJobValidation
};
