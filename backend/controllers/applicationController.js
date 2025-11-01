const Application = require('../models/Application');
const Job = require('../models/Job');
const CandidateProfile = require('../models/CandidateProfile');
const { extractResumeText } = require('../services/resumeParserService');
const { calculateMatchScore } = require('../services/scoringService');
const { downloadFromGridFS, getFileMetadata } = require('../services/fileService');

// Submit application with resume and automatic scoring
const submitApplication = async (req, res) => {
  try {
    const { jobId } = req.body;

    if (!jobId) {
      return res.status(400).json({
        success: false,
        message: 'Job ID is required'
      });
    }

    if (!req.fileId) {
      return res.status(400).json({
        success: false,
        message: 'Resume file is required'
      });
    }

    // Check if job exists and is open
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    if (job.status !== 'open') {
      return res.status(400).json({
        success: false,
        message: 'This job is no longer accepting applications'
      });
    }

    // Check if already applied
    const existingApplication = await Application.findOne({
      jobId,
      candidateId: req.user.userId
    });

    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: 'You have already applied to this job'
      });
    }

    // Download and extract text from resume
    const buffer = await downloadFromGridFS(req.fileId);
    const metadata = await getFileMetadata(req.fileId);
    const resumeText = await extractResumeText(buffer, metadata.contentType);

    // Calculate match score
    let scoringResult;
    try {
      scoringResult = await calculateMatchScore(
        job.description,
        job.requirements,
        job.requiredSkills,
        resumeText
      );
    } catch (scoringError) {
      console.error('Scoring error:', scoringError);
      // Continue with null scores if scoring fails
      scoringResult = {
        scores: {
          tfidfScore: null,
          bm25Score: null,
          cosineScore: null,
          keywordMatchScore: null,
          finalScore: null
        },
        matchPercentage: null,
        matchedSkills: [],
        missingSkills: job.requiredSkills,
        keywordsMatched: [],
        feedback: 'Unable to calculate match score at this time.'
      };
    }

    // Create application
    const application = await Application.create({
      jobId,
      candidateId: req.user.userId,
      resumeFileId: req.fileId,
      resumeText,
      scores: scoringResult.scores,
      matchPercentage: scoringResult.matchPercentage,
      matchedSkills: scoringResult.matchedSkills,
      missingSkills: scoringResult.missingSkills,
      keywordsMatched: scoringResult.keywordsMatched,
      feedback: scoringResult.feedback
    });

    // Update job application count
    job.applicationCount += 1;
    await job.save();

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: {
        application: {
          id: application._id,
          jobId: application.jobId,
          matchPercentage: application.matchPercentage,
          feedback: application.feedback,
          status: application.status,
          appliedAt: application.appliedAt
        }
      }
    });
  } catch (error) {
    console.error('Submit application error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to submit application'
    });
  }
};

// Get candidate's applications
const getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({ candidateId: req.user.userId })
      .sort({ appliedAt: -1 })
      .populate('jobId', 'title location jobType experienceLevel status');

    res.status(200).json({
      success: true,
      data: {
        applications,
        count: applications.length
      }
    });
  } catch (error) {
    console.error('Get my applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get single application by ID
const getApplicationById = async (req, res) => {
  try {
    const { id } = req.params;

    const application = await Application.findById(id)
      .populate('jobId')
      .populate('candidateId', 'fullName email');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Check authorization - candidate can view their own, recruiter can view for their jobs
    const isCandidate = application.candidateId._id.toString() === req.user.userId;
    const isRecruiter = application.jobId.recruiterId.toString() === req.user.userId;
    const isAdmin = req.user.role === 'admin';

    if (!isCandidate && !isRecruiter && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this application'
      });
    }

    // Get candidate profile if recruiter or admin is viewing
    let candidateProfile = null;
    if (isRecruiter || isAdmin) {
      candidateProfile = await CandidateProfile.findOne({ userId: application.candidateId._id });
    }

    res.status(200).json({
      success: true,
      data: {
        application,
        candidateProfile: candidateProfile ? {
          phone: candidateProfile.phone,
          location: candidateProfile.location,
          skills: candidateProfile.skills,
          experience: candidateProfile.experience,
          education: candidateProfile.education,
          linkedinUrl: candidateProfile.linkedinUrl,
          portfolioUrl: candidateProfile.portfolioUrl
        } : null
      }
    });
  } catch (error) {
    console.error('Get application by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Update application status (recruiter only)
const updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }

    const validStatuses = ['applied', 'reviewed', 'shortlisted', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value'
      });
    }

    const application = await Application.findById(id).populate('jobId');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Check if user is the recruiter for this job
    if (application.jobId.recruiterId.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this application'
      });
    }

    application.status = status;
    if (status === 'reviewed' && !application.reviewedAt) {
      application.reviewedAt = new Date();
    }
    await application.save();

    res.status(200).json({
      success: true,
      message: 'Application status updated successfully',
      data: { application }
    });
  } catch (error) {
    console.error('Update application status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  submitApplication,
  getMyApplications,
  getApplicationById,
  updateApplicationStatus
};
