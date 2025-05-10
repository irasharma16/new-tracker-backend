const mongoose = require('mongoose');

const sizeSchema = new mongoose.Schema({
 
  sizeName: {
    type: String,
    required: true
  },
  isDeleted: {
    type: Boolean,
    default: false
  }
});

const Size = mongoose.model('Size', sizeSchema);

module.exports = Size;





