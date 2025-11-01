const { getFileMetadata, createDownloadStream } = require('../services/fileService');
const Application = require('../models/Application');
const CandidateProfile = require('../models/CandidateProfile');

// Download file (resume)
const downloadFile = async (req, res) => {
  try {
    const { fileId } = req.params;

    // Get file metadata
    const metadata = await getFileMetadata(fileId);

    if (!metadata) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    // Check authorization
    // File can be accessed by:
    // 1. The user who uploaded it
    // 2. Recruiters viewing applications for their jobs
    // 3. Admins
    const uploadedBy = metadata.metadata?.uploadedBy?.toString();
    const isOwner = uploadedBy === req.user.userId;
    const isAdmin = req.user.role === 'admin';

    let isAuthorized = isOwner || isAdmin;

    // If recruiter, check if file belongs to an application for their job
    if (req.user.role === 'recruiter' && !isAuthorized) {
      const application = await Application.findOne({ resumeFileId: fileId })
        .populate('jobId');

      if (application && application.jobId.recruiterId.toString() === req.user.userId) {
        isAuthorized = true;
      }
    }

    // Check if file is candidate's profile resume
    if (!isAuthorized) {
      const candidateProfile = await CandidateProfile.findOne({ currentResumeFileId: fileId });
      if (candidateProfile && candidateProfile.userId.toString() === req.user.userId) {
        isAuthorized = true;
      }
    }

    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this file'
      });
    }

    // Set headers for file download
    res.set({
      'Content-Type': metadata.contentType,
      'Content-Disposition': `attachment; filename="${metadata.filename}"`,
      'Content-Length': metadata.length
    });

    // Stream file to response
    const downloadStream = createDownloadStream(fileId);

    downloadStream.on('error', (error) => {
      console.error('File download stream error:', error);
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          message: 'Error downloading file'
        });
      }
    });

    downloadStream.pipe(res);
  } catch (error) {
    console.error('Download file error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  downloadFile
};
