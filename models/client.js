const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
    clientCode: { type: Number, required: true },
    clientName: { type: String, required: true },
    contactPerson: { type: String, required: true },
    role: { type: String, required: true },
    email: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    companyLogo: { type: String }, // Path to the uploaded file
    deleted: { type: Boolean, default: false } // Soft delete flag
});

module.exports = mongoose.model('Client', clientSchema);