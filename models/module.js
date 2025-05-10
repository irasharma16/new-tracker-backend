const mongoose = require('mongoose');

const moduleSchema = new mongoose.Schema({
  moduleCode: {
    type: Number,
    required: true,
    unique: true
  },
  moduleName: {
    type: String,
    required: true,
    trim: true
  },
  cancelled: {
    type: Boolean,
    default: false
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Module', moduleSchema);