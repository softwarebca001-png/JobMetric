const express = require('express');
const router = express.Router();
const {
  getProfile,
  updateProfile,
  getMyJobs
} = require('../controllers/recruiterController');
const { verifyToken, requireRole } = require('../middleware/auth');

// All routes require authentication and recruiter role
router.use(verifyToken);
router.use(requireRole('recruiter'));

// Profile routes
router.get('/profile', getProfile);
router.put('/profile', updateProfile);

// Jobs routes
router.get('/jobs', getMyJobs);

module.exports = router;
