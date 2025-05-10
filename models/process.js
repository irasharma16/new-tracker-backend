// models/Process.js
const mongoose = require('mongoose');

const ProcessSchema = new mongoose.Schema({
  processName: {
    type: String,
    required: true,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  }
}, { timestamps: true });

module.exports = mongoose.model('Process', ProcessSchema);