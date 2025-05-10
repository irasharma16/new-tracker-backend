const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
  teamCode: { type: Number, required: true },
  teamName: { type: String, required: true },
  cancelled: { type: Boolean, required: false },
  isDeleted: { type: Boolean, required: false, default: false }  // Adding isDeleted field
});

module.exports = mongoose.model('Team', teamSchema);
