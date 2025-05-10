const mongoose = require('mongoose');

const phaseSchema = new mongoose.Schema({
    code: { 
        type: Number, 
        unique: true, 
        required: true 
    },
    name: { 
        type: String, 
        required: true 
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

module.exports = mongoose.model('Phase', phaseSchema);