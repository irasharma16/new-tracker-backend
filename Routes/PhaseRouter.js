const express = require('express');
const router = express.Router();
const Phase = require('../models/phase');

// GET all non-deleted phases
router.get('/', async (req, res) => {
    try {
        const phases = await Phase.find({ isDeleted: false });
        res.json(phases);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching phases', error });
    }
});

// POST a new phase
router.post('/', async (req, res) => {
    const { phaseName } = req.body;
    try {
        // Count existing non-deleted phases to generate code
        const phaseCount = await Phase.countDocuments({ isDeleted: false });
        
        const newPhase = new Phase({ 
            name: phaseName,
            code: phaseCount + 1
        });
        
        await newPhase.save();
        res.status(201).json(newPhase);
    } catch (error) {
        res.status(400).json({ message: 'Error saving phase', error });
    }
});

// PUT (update) an existing phase
router.put('/update/:id', async (req, res) => {
    const { id } = req.params;
    const { phaseName } = req.body;
    
    try {
        const updatedPhase = await Phase.findByIdAndUpdate(
            id,
            { name: phaseName },
            { new: true, runValidators: true }
        );
        
        if (!updatedPhase) return res.status(404).send('Phase not found');
        res.json(updatedPhase);
    } catch (error) {
        res.status(400).json({ message: 'Error updating phase', error });
    }
});

// Soft delete a phase
router.put('/softDelete/:id', async (req, res) => {
    const { id } = req.params;
    
    try {
        const deletedPhase = await Phase.findByIdAndUpdate(
            id,
            { isDeleted: true },
            { new: true }
        );
        
        if (!deletedPhase) return res.status(404).send('Phase not found');
        res.json(deletedPhase);
    } catch (error) {
        res.status(500).json({ message: 'Error deleting phase', error });
    }
});

module.exports = router;