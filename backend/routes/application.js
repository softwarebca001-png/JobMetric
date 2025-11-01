const express = require('express');
const router = express.Router();
const {
  submitApplication,
  getMyApplications,
  getApplicationById,
  updateApplicationStatus
} = require('../controllers/applicationController');
const { verifyToken, requireRole } = require('../middleware/auth');
const { upload, uploadToGridFSMiddleware } = require('../middleware/upload');

// All routes require authentication
router.use(verifyToken);

// Candidate routes
router.post('/', requireRole('candidate'), upload.single('resume'), uploadToGridFSMiddleware, submitApplication);
router.get('/my-applications', requireRole('candidate'), getMyApplications);

// Shared routes (accessible by candidate, recruiter, or admin)
router.get('/:id', getApplicationById);

// Recruiter routes
router.patch('/:id/status', requireRole('recruiter'), updateApplicationStatus);

module.exports = router;
