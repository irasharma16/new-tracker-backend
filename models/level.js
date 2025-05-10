const mongoose = require('mongoose');

const levelSchema = new mongoose.Schema({
    code: { 
        type: Number, 
        unique: true, 
        required: true 
    },
    levelName: { 
        type: String, 
        required: true 
    },
    cancelled: {
        type: Boolean,
        default: false
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

module.exports = mongoose.model('Level', levelSchema);