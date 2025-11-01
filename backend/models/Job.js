const mongoose = require('mongoose');
const jobSchema = new mongoose.Schema({
  recruiterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  requirements: { type: String, required: true },
  requiredSkills: { type: [String], required: true, validate: v => v && v.length > 0 },
  location: { type: String, required: true },
  jobType: { type: String, enum: ['full-time', 'part-time', 'contract', 'internship'], required: true },
  experienceLevel: { type: String, enum: ['entry', 'mid', 'senior', 'lead'], required: true },
  salaryMin: Number,
  salaryMax: Number,
  status: { type: String, enum: ['open', 'closed'], default: 'open' },
  applicationCount: { type: Number, default: 0 },
  closedAt: Date
}, { timestamps: true });
jobSchema.index({ recruiterId: 1 });
jobSchema.index({ status: 1, createdAt: -1 });
jobSchema.index({ title: 'text', description: 'text', requirements: 'text' });
module.exports = mongoose.model('Job', jobSchema);
