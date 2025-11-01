const express = require('express');
const router = express.Router();
const {
  getProfile,
  updateProfile,
  uploadResume,
  getResume
} = require('../controllers/candidateController');
const { verifyToken, requireRole } = require('../middleware/auth');
const { upload, uploadToGridFSMiddleware } = require('../middleware/upload');

// All routes require authentication and candidate role
router.use(verifyToken);
router.use(requireRole('candidate'));

// Profile routes
router.get('/profile', getProfile);
router.put('/profile', updateProfile);

// Resume routes
router.post('/profile/resume', upload.single('resume'), uploadToGridFSMiddleware, uploadResume);
router.get('/profile/resume', getResume);

module.exports = router;
