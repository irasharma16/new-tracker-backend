const mongoose = require('mongoose');

const prioritySchema = new mongoose.Schema({
  priorityName: {
    type: String,
    required: true,
    trim: true,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

module.exports = mongoose.model('Priority', prioritySchema);
