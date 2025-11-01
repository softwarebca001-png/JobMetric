const mongoose = require('mongoose');
const { GridFSBucket } = require('mongodb');
let gridfsBucket;
const initGridFS = () => {
  const db = mongoose.connection.db;
  if (!db) throw new Error('MongoDB connection not established');
  gridfsBucket = new GridFSBucket(db, { bucketName: 'uploads' });
  console.log('GridFS initialized');
  return gridfsBucket;
};
const getGridFSBucket = () => {
  if (!gridfsBucket) throw new Error('GridFS not initialized');
  return gridfsBucket;
};
module.exports = { initGridFS, getGridFSBucket };
