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

// Update application status validation
const updateApplicationStatusValidation = [
  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(['reviewed', 'shortlisted', 'rejected'])
    .withMessage('Status must be one of: reviewed, shortlisted, rejected'),
  validate
];

module.exports = {
  updateApplicationStatusValidation
};
