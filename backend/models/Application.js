const mongoose = require('mongoose');
const applicationSchema = new mongoose.Schema({
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  candidateId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  resumeFileId: { type: mongoose.Schema.Types.ObjectId, required: true },
  resumeText: { type: String, required: true },
  status: { type: String, enum: ['applied', 'reviewed', 'shortlisted', 'rejected'], default: 'applied' },
  scores: {
    tfidfScore: { type: Number, default: 0 },
    bm25Score: { type: Number, default: 0 },
    keywordMatchScore: { type: Number, default: 0 },
    cosineScore: { type: Number, default: 0 },
    finalScore: { type: Number, default: 0 }
  },
  matchPercentage: { type: Number, default: 0, min: 0, max: 100 },
  matchedSkills: [String],
  missingSkills: [String],
  keywordsMatched: [String],
  feedback: String,
  appliedAt: { type: Date, default: Date.now },
  reviewedAt: Date
}, { timestamps: true });
applicationSchema.index({ jobId: 1, candidateId: 1 }, { unique: true });
applicationSchema.index({ jobId: 1, 'scores.finalScore': -1 });
module.exports = mongoose.model('Application', applicationSchema);
