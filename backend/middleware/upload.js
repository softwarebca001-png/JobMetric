const multer = require('multer');
const { GridFSBucket } = require('mongodb');
const mongoose = require('mongoose');
const crypto = require('crypto');

// Configure multer to use memory storage
const storage = multer.memoryStorage();

// File filter to accept only PDF and DOCX
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF and DOCX files are allowed'), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5242880 // 5MB default
  },
  fileFilter: fileFilter
});

// Middleware to upload file to GridFS from memory buffer
const uploadToGridFSMiddleware = async (req, res, next) => {
  try {
    if (!req.file) {
      return next();
    }

    const db = mongoose.connection.db;
    const bucket = new GridFSBucket(db, { bucketName: 'fs' });

    // Generate unique filename
    const filename = `${crypto.randomBytes(16).toString('hex')}_${req.file.originalname}`;

    // Create upload stream
    const uploadStream = bucket.openUploadStream(filename, {
      contentType: req.file.mimetype,
      metadata: {
        uploadedBy: req.user.userId,
        purpose: req.body.purpose || 'application',
        originalName: req.file.originalname
      }
    });

    // Write buffer to GridFS
    uploadStream.end(req.file.buffer);

    // Wait for upload to complete
    await new Promise((resolve, reject) => {
      uploadStream.on('finish', () => {
        req.fileId = uploadStream.id;
        req.fileMetadata = {
          id: uploadStream.id,
          filename: filename,
          originalName: req.file.originalname,
          contentType: req.file.mimetype,
          size: req.file.size
        };
        resolve();
      });
      uploadStream.on('error', reject);
    });

    next();
  } catch (error) {
    console.error('GridFS upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload file. Please try again.'
    });
  }
};

module.exports = {
  upload,
  uploadToGridFSMiddleware
};
