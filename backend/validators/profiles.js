const { body, validationResult } = require('express-validator');

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

// Candidate profile validation
const updateCandidateProfileValidation = [
  body('phone').optional().trim().isLength({ min: 10 }).withMessage('Phone must be at least 10 characters'),
  body('location').optional().trim(),
  body('skills').optional().isArray().withMessage('Skills must be an array'),
  body('experience').optional().isNumeric().isInt({ min: 0 }).withMessage('Experience must be a non-negative number'),
  body('education').optional().trim(),
  body('linkedinUrl')
    .optional()
    .trim()
    .matches(/^https?:\/\/.+/)
    .withMessage('LinkedIn URL must be a valid URL'),
  body('portfolioUrl')
    .optional()
    .trim()
    .matches(/^https?:\/\/.+/)
    .withMessage('Portfolio URL must be a valid URL'),
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Bio cannot exceed 500 characters'),
  validate
];

// Recruiter profile validation
const updateRecruiterProfileValidation = [
  body('companyName')
    .notEmpty()
    .withMessage('Company name is required')
    .trim(),
  body('companyDescription').optional().trim(),
  body('companyWebsite')
    .optional()
    .trim()
    .matches(/^https?:\/\/.+/)
    .withMessage('Company website must be a valid URL'),
  body('companyLogo').optional().trim(),
  body('phone').optional().trim(),
  body('location').optional().trim(),
  validate
];

module.exports = {
  updateCandidateProfileValidation,
  updateRecruiterProfileValidation
};
