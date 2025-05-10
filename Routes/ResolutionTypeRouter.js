const express = require('express');
const router = express.Router();
const ResolutionType = require('../models/resolutiontype'); 

// Function to generate the next resolution type code
const getNextResolutionTypeCode = async () => {
  try {
    const resolutionTypes = await ResolutionType.find().sort({ resolutionTypeCode: 1 }).exec();

    let nextCode = 1;
    for (let resolutionType of resolutionTypes) {
      if (resolutionType.resolutionTypeCode === nextCode) {
        nextCode++;
      } else {
        break;
      }
    }

    return nextCode;
  } catch (err) {
    console.error('Error fetching resolution type codes:', err);
    return 1;
  }
};

// Get all non-deleted resolution types
router.get('/', async (req, res) => {
  try {
    const resolutionTypes = await ResolutionType.find({ isDeleted: false }).sort({ resolutionTypeCode: 1 });
    res.json(resolutionTypes);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching resolution types', error: err.message });
  }
});

// Create a new resolution type
router.post('/', async (req, res) => {
  try {
    const { resolutionTypeName, cancelled } = req.body;

    if (!resolutionTypeName) {
      return res.status(400).json({ message: 'Resolution Type Name is required.' });
    }

    const resolutionTypeCode = await getNextResolutionTypeCode();

    const resolutionType = new ResolutionType({
      resolutionTypeCode,
      resolutionTypeName,
      cancelled,
      isDeleted: false
    });

    const newResolutionType = await resolutionType.save();
    res.status(201).json(newResolutionType);
  } catch (err) {
    console.error('Error saving resolution type:', err);
    res.status(500).json({ message: 'Error saving resolution type', error: err.message });
  }
});

// Soft delete a resolution type
router.put('/softDelete/:id', async (req, res) => {
  try {
    const resolutionType = await ResolutionType.findByIdAndUpdate(
      req.params.id,
      { isDeleted: true },
      { new: true }
    );

    if (!resolutionType) return res.status(404).json({ message: 'Resolution Type not found' });

    res.json({ message: 'Resolution Type soft deleted successfully' });
  } catch (err) {
    res.status(400).json({ message: 'Error deleting resolution type', error: err.message });
  }
});

// Update a resolution type's details
router.put('/update/:id', async (req, res) => {
  try {
    const { resolutionTypeName, cancelled } = req.body;

    if (!resolutionTypeName) {
      return res.status(400).json({ message: 'Resolution Type Name is required.' });
    }

    const updatedResolutionType = await ResolutionType.findByIdAndUpdate(
      req.params.id,
      {
        resolutionTypeName,
        cancelled,
      },
      { new: true }
    );

    if (!updatedResolutionType) return res.status(404).json({ message: 'Resolution Type not found' });

    res.json(updatedResolutionType);
  } catch (err) {
    res.status(400).json({ message: 'Error updating resolution type', error: err.message });
  }
});

module.exports = router;
