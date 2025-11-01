const crypto = require('crypto');

// Generate random verification token
const generateVerificationToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Generate random password reset token
const generateResetToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

module.exports = {
  generateVerificationToken,
  generateResetToken
};
