const CandidateProfile = require('../models/CandidateProfile');
const User = require('../models/User');
const { extractResumeText } = require('../services/resumeParserService');
const { downloadFromGridFS, getFileMetadata, createDownloadStream } = require('../services/fileService');

// Get candidate profile
const getProfile = async (req, res) => {
  try {
    const profile = await CandidateProfile.findOne({ userId: req.user.userId })
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

// Update candidate profile
const updateProfile = async (req, res) => {
  try {
    const {
      phone,
      location,
      skills,
      experience,
      education,
      linkedinUrl,
      portfolioUrl,
      bio
    } = req.body;

    const profile = await CandidateProfile.findOne({ userId: req.user.userId });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    // Update fields
    if (phone !== undefined) profile.phone = phone;
    if (location !== undefined) profile.location = location;
    if (skills !== undefined) profile.skills = skills;
    if (experience !== undefined) profile.experience = experience;
    if (education !== undefined) profile.education = education;
    if (linkedinUrl !== undefined) profile.linkedinUrl = linkedinUrl;
    if (portfolioUrl !== undefined) profile.portfolioUrl = portfolioUrl;
    if (bio !== undefined) profile.bio = bio;

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

// Upload resume to profile
const uploadResume = async (req, res) => {
  try {
    if (!req.fileId) {
      return res.status(400).json({
        success: false,
        message: 'Resume file is required'
      });
    }

    // Download the file to extract text
    const buffer = await downloadFromGridFS(req.fileId);
    const metadata = await getFileMetadata(req.fileId);

    // Extract text from resume
    const resumeText = await extractResumeText(buffer, metadata.contentType);

    // Update profile
    const profile = await CandidateProfile.findOne({ userId: req.user.userId });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    profile.currentResumeFileId = req.fileId;
    profile.currentResumeText = resumeText;
    await profile.save();

    res.status(200).json({
      success: true,
      message: 'Resume uploaded successfully',
      data: {
        fileId: req.fileId,
        filename: metadata.filename
      }
    });
  } catch (error) {
    console.error('Upload resume error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to upload resume'
    });
  }
};

// Get resume file
const getResume = async (req, res) => {
  try {
    const profile = await CandidateProfile.findOne({ userId: req.user.userId });

    if (!profile || !profile.currentResumeFileId) {
      return res.status(404).json({
        success: false,
        message: 'No resume found'
      });
    }

    const metadata = await getFileMetadata(profile.currentResumeFileId);

    res.status(200).json({
      success: true,
      data: {
        fileId: profile.currentResumeFileId,
        filename: metadata.filename,
        contentType: metadata.contentType,
        uploadDate: metadata.uploadDate
      }
    });
  } catch (error) {
    console.error('Get resume error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  uploadResume,
  getResume
};
