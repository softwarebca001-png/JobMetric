const Job = require('../models/Job');
const Application = require('../models/Application');

// Create new job
const createJob = async (req, res) => {
  try {
    const {
      title,
      description,
      requirements,
      requiredSkills,
      location,
      jobType,
      experienceLevel,
      salaryMin,
      salaryMax
    } = req.body;

    // Validate required fields
    if (!title || !description || !requirements || !requiredSkills || !location || !jobType || !experienceLevel) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Validate required skills array
    if (!Array.isArray(requiredSkills) || requiredSkills.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one required skill must be provided'
      });
    }

    // Create job
    const job = await Job.create({
      recruiterId: req.user.userId,
      title,
      description,
      requirements,
      requiredSkills,
      location,
      jobType,
      experienceLevel,
      salaryMin,
      salaryMax
    });

    res.status(201).json({
      success: true,
      message: 'Job created successfully',
      data: { job }
    });
  } catch (error) {
    console.error('Create job error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get all jobs (public - with filters)
const getAllJobs = async (req, res) => {
  try {
    const {
      search,
      location,
      jobType,
      experienceLevel,
      skills,
      page = 1,
      limit = 10,
      sort = 'createdAt'
    } = req.query;

    // Build query
    const query = { status: 'open' };

    // Search in title and description
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Location filter
    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }

    // Job type filter
    if (jobType) {
      const types = jobType.split(',');
      query.jobType = { $in: types };
    }

    // Experience level filter
    if (experienceLevel) {
      const levels = experienceLevel.split(',');
      query.experienceLevel = { $in: levels };
    }

    // Skills filter
    if (skills) {
      const skillArray = skills.split(',').map(s => s.trim());
      query.requiredSkills = { $in: skillArray };
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Sort
    const sortOption = {};
    if (sort === 'createdAt' || sort === '-createdAt') {
      sortOption.createdAt = sort.startsWith('-') ? -1 : 1;
    }

    const jobs = await Job.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('recruiterId', 'fullName');

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

// Get single job by ID
const getJobById = async (req, res) => {
  try {
    const { id } = req.params;

    const job = await Job.findById(id).populate('recruiterId', 'fullName');

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Get recruiter profile for company info
    const RecruiterProfile = require('../models/RecruiterProfile');
    const recruiterProfile = await RecruiterProfile.findOne({ userId: job.recruiterId._id });

    res.status(200).json({
      success: true,
      data: {
        job,
        companyInfo: recruiterProfile ? {
          companyName: recruiterProfile.companyName,
          companyWebsite: recruiterProfile.companyWebsite,
          companyDescription: recruiterProfile.companyDescription
        } : null
      }
    });
  } catch (error) {
    console.error('Get job by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Update job
const updateJob = async (req, res) => {
  try {
    const { id } = req.params;

    const job = await Job.findById(id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Check ownership
    if (job.recruiterId.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this job'
      });
    }

    const {
      title,
      description,
      requirements,
      requiredSkills,
      location,
      jobType,
      experienceLevel,
      salaryMin,
      salaryMax,
      status
    } = req.body;

    // Update fields
    if (title) job.title = title;
    if (description) job.description = description;
    if (requirements) job.requirements = requirements;
    if (requiredSkills) job.requiredSkills = requiredSkills;
    if (location) job.location = location;
    if (jobType) job.jobType = jobType;
    if (experienceLevel) job.experienceLevel = experienceLevel;
    if (salaryMin !== undefined) job.salaryMin = salaryMin;
    if (salaryMax !== undefined) job.salaryMax = salaryMax;
    if (status) {
      job.status = status;
      if (status === 'closed') {
        job.closedAt = new Date();
      }
    }

    await job.save();

    res.status(200).json({
      success: true,
      message: 'Job updated successfully',
      data: { job }
    });
  } catch (error) {
    console.error('Update job error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Delete job
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

    // Check ownership
    if (job.recruiterId.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this job'
      });
    }

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

// Get applications for a job (recruiter only)
const getJobApplications = async (req, res) => {
  try {
    const { id } = req.params;

    const job = await Job.findById(id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Check ownership
    if (job.recruiterId.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view applications for this job'
      });
    }

    // Get applications sorted by score (highest first)
    const applications = await Application.find({ jobId: id })
      .sort({ 'scores.finalScore': -1 })
      .populate('candidateId', 'fullName email');

    res.status(200).json({
      success: true,
      data: {
        applications,
        count: applications.length
      }
    });
  } catch (error) {
    console.error('Get job applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  createJob,
  getAllJobs,
  getJobById,
  updateJob,
  deleteJob,
  getJobApplications
};
