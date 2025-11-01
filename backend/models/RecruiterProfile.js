const mongoose = require('mongoose');
const recruiterProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  companyName: { type: String, required: true, trim: true },
  companyDescription: String,
  companyWebsite: String,
  companyLogo: String,
  phone: String,
  location: String
}, { timestamps: true });
recruiterProfileSchema.index({ userId: 1 });
module.exports = mongoose.model('RecruiterProfile', recruiterProfileSchema);
