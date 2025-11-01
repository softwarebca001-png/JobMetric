const express = require('express');
const router = express.Router();
const {
  createJob,
  getAllJobs,
  getJobById,
  updateJob,
  deleteJob,
  getJobApplications
} = require('../controllers/jobController');
const { verifyToken, requireRole } = require('../middleware/auth');

// Public routes
router.get('/', getAllJobs);
router.get('/:id', getJobById);

// Protected routes - Recruiter only
router.post('/', verifyToken, requireRole('recruiter'), createJob);
router.put('/:id', verifyToken, requireRole('recruiter'), updateJob);
router.delete('/:id', verifyToken, requireRole('recruiter'), deleteJob);
router.get('/:id/applications', verifyToken, requireRole('recruiter'), getJobApplications);

module.exports = router;
