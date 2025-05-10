const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  employeeCode: {
     type: Number, 
     required: true 
    },
  employeeName: { 
    type: String, 
    required: true 
  },
  cancelled: { 
    type: Boolean, 
    required: true 
  },
  isDeleted: { 
    type: Boolean, 
    default: false
   }
});

module.exports = mongoose.model('Employee', employeeSchema);

//emp in models