const express = require('express');
const router = express.Router();
const Project = require('../models/project');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: './uploads/',
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({ storage: storage });

// Get all non-deleted projects
router.get('/', async (req, res) => {
    try {
        const projects = await Project.find({ isDeleted: false }).sort({ srNo: 1 });
        res.json(projects);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching projects', error: err.message });
    }
});

// Create a new project
router.post('/', upload.single('attachment'), async (req, res) => {
    try {
        const projectData = { ...req.body };
        if (req.file) {
            projectData.attachment = req.file.path;
        }

        const project = new Project(projectData);
        const newProject = await project.save();
        res.status(201).json(newProject);
    } catch (err) {
        res.status(500).json({ message: 'Error saving project', error: err.message });
    }
});

// Update a project by _id
router.put('/:id', upload.single('attachment'), async (req, res) => {
    try {
        const projectData = { ...req.body };
        if (req.file) {
            projectData.attachment = req.file.path;
        }

        const updatedProject = await Project.findByIdAndUpdate(
            req.params.id,
            projectData,
            { new: true }
        );

        if (!updatedProject) {
            return res.status(404).json({ message: 'Project not found' });
        }

        res.json(updatedProject);
    } catch (err) {
        res.status(400).json({ message: 'Error updating project', error: err.message });
    }
});

// Delete a project by _id
router.delete('/:id', async (req, res) => {
    try {
        const deletedProject = await Project.findByIdAndDelete(req.params.id);

        if (!deletedProject) {
            return res.status(404).json({ message: 'Project not found' });
        }

        res.json({ message: 'Project deleted successfully' });
    } catch (err) {
        res.status(400).json({ message: 'Error deleting project', error: err.message });
    }
});

module.exports = router;