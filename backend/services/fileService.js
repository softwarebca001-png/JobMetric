const { GridFSBucket } = require('mongodb');
const mongoose = require('mongoose');

// Upload file to GridFS
const uploadToGridFS = async (buffer, filename, contentType, metadata = {}) => {
  try {
    const db = mongoose.connection.db;
    const bucket = new GridFSBucket(db, { bucketName: 'fs' });

    return new Promise((resolve, reject) => {
      const uploadStream = bucket.openUploadStream(filename, {
        contentType,
        metadata
      });

      uploadStream.end(buffer);

      uploadStream.on('finish', () => {
        resolve({
          id: uploadStream.id,
          filename: filename,
          contentType: contentType,
          size: buffer.length
        });
      });

      uploadStream.on('error', reject);
    });
  } catch (error) {
    console.error('GridFS upload error:', error);
    throw new Error('Failed to upload file to GridFS');
  }
};

// Download file from GridFS
const downloadFromGridFS = async (fileId) => {
  try {
    const db = mongoose.connection.db;
    const bucket = new GridFSBucket(db, { bucketName: 'fs' });

    return new Promise((resolve, reject) => {
      const chunks = [];
      const downloadStream = bucket.openDownloadStream(new mongoose.Types.ObjectId(fileId));

      downloadStream.on('data', (chunk) => {
        chunks.push(chunk);
      });

      downloadStream.on('end', () => {
        resolve(Buffer.concat(chunks));
      });

      downloadStream.on('error', reject);
    });
  } catch (error) {
    console.error('GridFS download error:', error);
    throw new Error('Failed to download file from GridFS');
  }
};

// Get file metadata
const getFileMetadata = async (fileId) => {
  try {
    const db = mongoose.connection.db;
    const bucket = new GridFSBucket(db, { bucketName: 'fs' });

    const files = await bucket.find({ _id: new mongoose.Types.ObjectId(fileId) }).toArray();

    if (files.length === 0) {
      throw new Error('File not found');
    }

    return files[0];
  } catch (error) {
    console.error('GridFS metadata error:', error);
    throw new Error('Failed to get file metadata');
  }
};

// Delete file from GridFS
const deleteFromGridFS = async (fileId) => {
  try {
    const db = mongoose.connection.db;
    const bucket = new GridFSBucket(db, { bucketName: 'fs' });

    await bucket.delete(new mongoose.Types.ObjectId(fileId));
    return { success: true };
  } catch (error) {
    console.error('GridFS delete error:', error);
    throw new Error('Failed to delete file from GridFS');
  }
};

// Create download stream
const createDownloadStream = (fileId) => {
  try {
    const db = mongoose.connection.db;
    const bucket = new GridFSBucket(db, { bucketName: 'fs' });

    return bucket.openDownloadStream(new mongoose.Types.ObjectId(fileId));
  } catch (error) {
    console.error('GridFS stream error:', error);
    throw new Error('Failed to create download stream');
  }
};

module.exports = {
  uploadToGridFS,
  downloadFromGridFS,
  getFileMetadata,
  deleteFromGridFS,
  createDownloadStream
};
