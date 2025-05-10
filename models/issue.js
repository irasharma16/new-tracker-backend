const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema({
  issueCode: {
    type: Number,
    required: true,
    
  },
  issueName: { 
    type: String, 
    required: true 
  },
  trCheck: { 
    type: Boolean, 
    required: true 
  },
  isDeleted: { 
    type: Boolean, 
    default: false 
  }
});

module.exports = mongoose.model('Issue', issueSchema);