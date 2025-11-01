const mongoose = require('mongoose');
const candidateProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  phone: String,
  location: String,
  currentResumeFileId: mongoose.Schema.Types.ObjectId,
  currentResumeText: String,
  skills: [String],
  experience: Number,
  education: String,
  linkedinUrl: String,
  portfolioUrl: String,
  bio: { type: String, maxlength: 500 }
}, { timestamps: true });
candidateProfileSchema.index({ userId: 1 });
module.exports = mongoose.model('CandidateProfile', candidateProfileSchema);
