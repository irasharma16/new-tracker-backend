const mongoose = require('mongoose');

const timeSheetSchema = new mongoose.Schema({
  dateOfSubmission: {
    type: Date,
    required: true, // Mandatory field
  },
  projectName: {
    type: String,
    required: true, // Mandatory field
  },
  clientName: {
    type: String,
    required: true, // Mandatory field
  },
  month: {
    type: String,
    enum: [
      'January', 'February', 'March', 'April', 
      'May', 'June', 'July', 'August', 
      'September', 'October', 'November', 'December'
    ],
    required: true, // Dropdown for all months
  },
  remark: {
    type: String, // Optional field
    required: false,
  },
  uploadedFile: {
    type: String, // Stores the file path or URL
    required: false, // Optional field
  },
}, { timestamps: true }); // Adds createdAt and updatedAt fields automatically

const TimeSheet = mongoose.model('TimeSheet', timeSheetSchema);

module.exports = TimeSheet;