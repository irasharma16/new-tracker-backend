const mongoose = require('mongoose');

const registerissueSchema = new mongoose.Schema({
  issueNumber: { type: String, unique: true, required: true },
  client: { type: String, required: true },
  email: { type: String },
  issueType: { type: String, required: true },
  contactPerson: { type: String, required: true },
  dateReported: { type: Date, required: true },
  designation: { type: String },
  status: { type: String, required: true },
  department: { type: String },
  phone: { type: String },
  module: { type: String },
  attachment: { type: String },
  assignTo: { type: String },
  resolutionType: { type: String },
  supportType: { type: String },
  level: { type: String },
  priority: { type: String },
  size: { type: String },
  targetDate: { type: Date },
  resolutionDate: { type: Date },
  estimatedTime: { type: Number },
  actualTime: { type: Number },
  trNo: { type: String },
  finalResolution: { type: String },
  description: { type: String, required: true },
  billingStatus: { type: String },
  assignTo2: { type: String },
});

module.exports = mongoose.model('RegisterIssue', registerissueSchema);