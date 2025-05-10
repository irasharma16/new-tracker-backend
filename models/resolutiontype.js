const mongoose = require('mongoose');

const resolutionTypeSchema = new mongoose.Schema({
  resolutionTypeCode: { type: Number, required: true },
  resolutionTypeName: { type: String, required: true },
  cancelled: { type: Boolean, required: false },
  isDeleted: { type: Boolean, required: false, default: false }  // Adding isDeleted field
});

module.exports = mongoose.model('ResolutionType', resolutionTypeSchema);
