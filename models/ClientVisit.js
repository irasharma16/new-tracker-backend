const mongoose = require('mongoose');

const ClientVisitSchema = new mongoose.Schema({
  assignTo: {
    type: String,
    required: [true, 'Assign to field is required'],
    trim: true,
  },
  client: {
    type: String,
    required: [true, 'Client field is required'],
    trim: true,
  },
  purpose: {
    type: String,
    required: [true, 'Purpose field is required'],
    trim: true,
    enum: ['General', 'Meeting', 'Project Scope', 'New Requirement', 'Support', 'Training'], // Add validation for purpose options
  },
  module: {
    type: String,
    required: [true, 'Module field is required'],
    trim: true,
  },
  contactPerson: {
    type: String,
    required: [true, 'Contact Person field is required'],
    trim: true,
  },
  visitDateFrom: {
    type: Date,
    required: [true, 'Visit Date (From) is required'],
  },
  visitDateTo: {
    type: Date,
    required: [true, 'Visit Date (To) is required'],
  },
  timeEstimate: {
    type: String,
    required: [true, 'Time Estimate field is required'],
  },
  remark: {
    type: String,
    required: [true, 'Remark field is required'],
    trim: true,
  },
}, {
  timestamps: true, // Automatically manage createdAt and updatedAt fields
});

ClientVisitSchema.pre('save', function(next) {
  // Additional validation or processing before saving the document
  if (this.visitDateFrom > this.visitDateTo) {
    return next(new Error('Visit Date (From) cannot be later than Visit Date (To)'));
  }
  next();
});

const ClientVisit = mongoose.model('ClientVisit', ClientVisitSchema);

module.exports = ClientVisit;// Model ClientVist