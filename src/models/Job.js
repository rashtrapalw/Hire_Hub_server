const mongoose = require('mongoose');
const ApplicantSchema = new mongoose.Schema({
  candidate: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  resumePath: { type: String },
  appliedAt: { type: Date, default: Date.now },
  status: { type: String, enum: ['applied', 'reviewing', 'rejected', 'hired'], default: 'applied' }
});
const JobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  company: { type: String, required: true },
  description: { type: String },
  location: { type: String },
  salary: { type: String },
  recruiter: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  applicants: [ApplicantSchema]
});
module.exports = mongoose.model('Job', JobSchema);
