const express = require('express');
const router = express.Router();
const {
  getStatistics,
  getAllUsers,
  getUserDetails,
  deleteUser,
  toggleUserVerification,
  getAllJobs,
  deleteJob,
  getAllApplications
} = require('../controllers/adminController');
const { verifyToken, requireRole } = require('../middleware/auth');

// All routes require authentication and admin role
router.use(verifyToken);
router.use(requireRole('admin'));

// Statistics
router.get('/statistics', getStatistics);

// User management
router.get('/users', getAllUsers);
router.get('/users/:id', getUserDetails);
router.delete('/users/:id', deleteUser);
router.patch('/users/:id/verify', toggleUserVerification);

// Job management
router.get('/jobs', getAllJobs);
router.delete('/jobs/:id', deleteJob);

// Application management
router.get('/applications', getAllApplications);

module.exports = router;
