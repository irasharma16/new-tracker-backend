const mongoose = require('mongoose');

const statusSchema = new mongoose.Schema({
  statusCode: {
    type: Number,
    required: true,
    unique: true
  },
  statusName: {
    type: String,
    required: true
  },
  isDeleted: {
    type: Boolean,
    default: false
  }
});

const Status = mongoose.model('Status', statusSchema);

module.exports = Status;// Status model