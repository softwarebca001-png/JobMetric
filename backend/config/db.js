const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Create indexes for better performance
    await createIndexes();

    return conn;
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

// Function to create indexes after connection
const createIndexes = async () => {
  try {
    const User = require('../models/User');
    const Job = require('../models/Job');
    const Application = require('../models/Application');
    const CandidateProfile = require('../models/CandidateProfile');
    const RecruiterProfile = require('../models/RecruiterProfile');

    // User indexes
    await User.collection.createIndex({ email: 1 }, { unique: true });
    await User.collection.createIndex({ verificationToken: 1 });
    await User.collection.createIndex({ resetPasswordToken: 1 });
    await User.collection.createIndex({ role: 1 });

    // Job indexes
    await Job.collection.createIndex({ recruiterId: 1 });
    await Job.collection.createIndex({ status: 1 });
    await Job.collection.createIndex({ status: 1, createdAt: -1 });
    await Job.collection.createIndex(
      { title: 'text', description: 'text', requirements: 'text' },
      { name: 'job_search_index' }
    );

    // Application indexes
    await Application.collection.createIndex({ jobId: 1 });
    await Application.collection.createIndex({ candidateId: 1 });
    await Application.collection.createIndex({ jobId: 1, candidateId: 1 }, { unique: true });
    await Application.collection.createIndex({ jobId: 1, 'scores.finalScore': -1 });
    await Application.collection.createIndex({ status: 1 });

    // Profile indexes
    await CandidateProfile.collection.createIndex({ userId: 1 }, { unique: true });
    await CandidateProfile.collection.createIndex({ skills: 1 });
    await RecruiterProfile.collection.createIndex({ userId: 1 }, { unique: true });

    console.log('Database indexes created successfully');
  } catch (error) {
    console.error('Error creating indexes:', error.message);
    // Don't exit process, just log the error
  }
};

module.exports = connectDB;
