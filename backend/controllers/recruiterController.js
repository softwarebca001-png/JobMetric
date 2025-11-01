const RecruiterProfile = require('../models/RecruiterProfile');
const Job = require('../models/Job');

// Get recruiter profile
const getProfile = async (req, res) => {
  try {
    const profile = await RecruiterProfile.findOne({ userId: req.user.userId })
      .populate('userId', 'email fullName');

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    res.status(200).json({
      success: true,
      data: { profile }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Update recruiter profile
const updateProfile = async (req, res) => {
  try {
    const {
      companyName,
      companyDescription,
      companyWebsite,
      companyLogo,
      phone,
      location
    } = req.body;

    const profile = await RecruiterProfile.findOne({ userId: req.user.userId });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    // Update fields
    if (companyName !== undefined) profile.companyName = companyName;
    if (companyDescription !== undefined) profile.companyDescription = companyDescription;
    if (companyWebsite !== undefined) profile.companyWebsite = companyWebsite;
    if (companyLogo !== undefined) profile.companyLogo = companyLogo;
    if (phone !== undefined) profile.phone = phone;
    if (location !== undefined) profile.location = location;

    await profile.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: { profile }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get recruiter's jobs
const getMyJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ recruiterId: req.user.userId })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        jobs,
        count: jobs.length
      }
    });
  } catch (error) {
    console.error('Get my jobs error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  getMyJobs
};
