const express = require('express');
const router = express.Router();
const Level = require('../models/level');

// GET all non-deleted levels
router.get('/', async (req, res) => {
    try {
        const levels = await Level.find({ isDeleted: false });
        res.json(levels);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching levels', error });
    }
});

// POST a new level
router.post('/', async (req, res) => {
    const { levelName, cancelled } = req.body;
    try {
        // Count existing non-deleted levels to generate code
        const levelCount = await Level.countDocuments({ isDeleted: false });
        
        const newLevel = new Level({ 
            levelName,
            cancelled: cancelled || false,
            code: levelCount + 1
        });
        
        await newLevel.save();
        res.status(201).json(newLevel);
    } catch (error) {
        res.status(400).json({ message: 'Error saving level', error });
    }
});

// PUT (update) an existing level
router.put('/update/:id', async (req, res) => {
    const { id } = req.params;
    const { levelName, cancelled } = req.body;
    
    try {
        const updatedLevel = await Level.findByIdAndUpdate(
            id,
            { 
                levelName, 
                cancelled: cancelled || false 
            },
            { new: true, runValidators: true }
        );
        
        if (!updatedLevel) return res.status(404).send('Level not found');
        res.json(updatedLevel);
    } catch (error) {
        res.status(400).json({ message: 'Error updating level', error });
    }
});

// Soft delete a level
router.put('/softDelete/:id', async (req, res) => {
    const { id } = req.params;
    
    try {
        const deletedLevel = await Level.findByIdAndUpdate(
            id,
            { isDeleted: true },
            { new: true }
        );
        
        if (!deletedLevel) return res.status(404).send('Level not found');
        res.json(deletedLevel);
    } catch (error) {
        res.status(500).json({ message: 'Error deleting level', error });
    }
});

module.exports = router;