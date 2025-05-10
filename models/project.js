const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    srNo: { type: Number, required: true },
    projectName: { type: String, required: true },
    client: { type: String, required: true },
    module: { type: String, required: true },
    activity: { type: String },
    projectDescription: { type: String, required: true },
    projectStartDate: { type: Date, required: true },
    projectEndDate: { type: Date, required: true },
    
    actualLiveDate: { type: Date },
    responsibleFunctional: { type: String },
    
    
    sageTeamRemark: { type: String },
    status: { 
        type: String, 
        required: true,
        enum: ['In Progress', 'Completed', 'On Hold', 'Cancelled']
    },


    completionPercentage: { 
        type: Number, 
        required: true,
        min: 0,
        max: 100
    },
    projectCost: { type: Number, required: true },
    completionValue: { type: Number },
    attachment: { type: String },
    isDeleted: { type: Boolean, default: false }
});

const Project = mongoose.model('Project', projectSchema);

module.exports = Project;
