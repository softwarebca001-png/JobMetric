const User = require('../models/User');
const Job = require('../models/Job');
const Application = require('../models/Application');
const CandidateProfile = require('../models/CandidateProfile');
const RecruiterProfile = require('../models/RecruiterProfile');

// Get platform statistics
const getStatistics = async (req, res) => {
  try {
    // User statistics
    const totalUsers = await User.countDocuments();
    const totalCandidates = await User.countDocuments({ role: 'candidate' });
    const totalRecruiters = await User.countDocuments({ role: 'recruiter' });
    const verifiedUsers = await User.countDocuments({ isVerified: true });
    const unverifiedUsers = await User.countDocuments({ isVerified: false });

    // Job statistics
    const totalJobs = await Job.countDocuments();
    const openJobs = await Job.countDocuments({ status: 'open' });
    const closedJobs = await Job.countDocuments({ status: 'closed' });

    // Application statistics
    const totalApplications = await Application.countDocuments();
    const appliedApplications = await Application.countDocuments({ status: 'applied' });
    const reviewedApplications = await Application.countDocuments({ status: 'reviewed' });
    const shortlistedApplications = await Application.countDocuments({ status: 'shortlisted' });
    const rejectedApplications = await Application.countDocuments({ status: 'rejected' });

    // Recent activity
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select('-password');

    const recentJobs = await Job.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('recruiterId', 'fullName email');

    const recentApplications = await Application.find()
      .sort({ appliedAt: -1 })
      .limit(10)
      .populate('candidateId', 'fullName email')
      .populate('jobId', 'title');

    res.status(200).json({
      success: true,
      data: {
        statistics: {
          users: {
            total: totalUsers,
            candidates: totalCandidates,
            recruiters: totalRecruiters,
            verified: verifiedUsers,
            unverified: unverifiedUsers
          },
          jobs: {
            total: totalJobs,
            open: openJobs,
            closed: closedJobs
          },
          applications: {
            total: totalApplications,
            applied: appliedApplications,
            reviewed: reviewedApplications,
            shortlisted: shortlistedApplications,
            rejected: rejectedApplications
          }
        },
        recentActivity: {
          users: recentUsers,
          jobs: recentJobs,
          applications: recentApplications
        }
      }
    });
  } catch (error) {
    console.error('Get statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get all users
const getAllUsers = async (req, res) => {
  try {
    const { role, isVerified, page = 1, limit = 20 } = req.query;

    const query = {};
    if (role) query.role = role;
    if (isVerified !== undefined) query.isVerified = isVerified === 'true';

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        users,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get user details with profile
const getUserDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    let profile = null;
    if (user.role === 'candidate') {
      profile = await CandidateProfile.findOne({ userId: id });
    } else if (user.role === 'recruiter') {
      profile = await RecruiterProfile.findOne({ userId: id });
    }

    // Get user's statistics
    let statistics = {};
    if (user.role === 'candidate') {
      const applicationCount = await Application.countDocuments({ candidateId: id });
      statistics = { applications: applicationCount };
    } else if (user.role === 'recruiter') {
      const jobCount = await Job.countDocuments({ recruiterId: id });
      const totalApplications = await Application.countDocuments({
        jobId: { $in: await Job.find({ recruiterId: id }).distinct('_id') }
      });
      statistics = { jobs: jobCount, applications: totalApplications };
    }

    res.status(200).json({
      success: true,
      data: {
        user,
        profile,
        statistics
      }
    });
  } catch (error) {
    console.error('Get user details error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Delete user
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent deleting admin users
    if (user.role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Cannot delete admin users'
      });
    }

    // Delete associated data
    if (user.role === 'candidate') {
      await CandidateProfile.deleteOne({ userId: id });
      await Application.deleteMany({ candidateId: id });
    } else if (user.role === 'recruiter') {
      await RecruiterProfile.deleteOne({ userId: id });
      const jobIds = await Job.find({ recruiterId: id }).distinct('_id');
      await Application.deleteMany({ jobId: { $in: jobIds } });
      await Job.deleteMany({ recruiterId: id });
    }

    await User.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Toggle user verification status
const toggleUserVerification = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.isVerified = !user.isVerified;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User verification ${user.isVerified ? 'enabled' : 'disabled'} successfully`,
      data: { user }
    });
  } catch (error) {
    console.error('Toggle verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get all jobs (admin view)
const getAllJobs = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    const query = {};
    if (status) query.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const jobs = await Job.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('recruiterId', 'fullName email');

    const total = await Job.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        jobs,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get all jobs error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Delete job (admin)
const deleteJob = async (req, res) => {
  try {
    const { id } = req.params;

    const job = await Job.findById(id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Delete associated applications
    await Application.deleteMany({ jobId: id });

    await Job.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Job deleted successfully'
    });
  } catch (error) {
    console.error('Delete job error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get all applications (admin view)
const getAllApplications = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    const query = {};
    if (status) query.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const applications = await Application.find(query)
      .sort({ appliedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('candidateId', 'fullName email')
      .populate('jobId', 'title');

    const total = await Application.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        applications,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get all applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  getStatistics,
  getAllUsers,
  getUserDetails,
  deleteUser,
  toggleUserVerification,
  getAllJobs,
  deleteJob,
  getAllApplications
};
