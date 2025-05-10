const express = require('express');
const router = express.Router();
const Process = require('../models/process'); // Import the Process model

// Create a new process
router.post('/', async (req, res) => {
    try {
        if (!req.body.processName) {
            return res.status(400).json({ message: 'Process name is required' });
        }

        // Create a new process instance
        const newProcess = new Process({
            processName: req.body.processName
        });

        // Save the process to the database
        const savedProcess = await newProcess.save();
        res.status(201).json({
            message: 'Process created successfully',
            data: savedProcess
        });
    } catch (error) {
        res.status(500).json({ message: 'Error saving process', error: error.message });
    }
});

// Get all processes (only those not soft-deleted)
router.get('/', async (req, res) => {
    try {
        const processes = await Process.find({ isDeleted: false }); // Exclude soft-deleted processes
        res.status(200).json({
            message: 'Processes fetched successfully',
            data: processes
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching processes', error: error.message });
    }
});

// Update an existing process
router.put('/:id', async (req, res) => {
    try {
        if (!req.body.processName) {
            return res.status(400).json({ message: 'Process name is required' });
        }

        const updatedProcess = await Process.findByIdAndUpdate(
            req.params.id,
            { processName: req.body.processName },
            { new: true }
        );

        if (!updatedProcess) {
            return res.status(404).json({ message: 'Process not found' });
        }

        res.status(200).json({
            message: 'Process updated successfully',
            data: updatedProcess
        });
    } catch (error) {
        res.status(500).json({ message: 'Error updating process', error: error.message });
    }
});

// Soft delete a process
router.put('/softDelete/:id', async (req, res) => {
    try {
        const softDeletedProcess = await Process.findByIdAndUpdate(
            req.params.id,
            { isDeleted: true },
            { new: true }
        );

        if (!softDeletedProcess) {
            return res.status(404).json({ message: 'Process not found' });
        }

        res.status(200).json({
            message: 'Process deleted successfully',
            data: softDeletedProcess
        });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting process', error: error.message });
    }
});

module.exports = router;

//router code process