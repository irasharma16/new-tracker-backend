const express = require('express');
const Priority = require('../models/priority');

const router = express.Router();

// Fetch all priorities (excluding soft-deleted ones)
router.get('/', async (req, res) => {
  try {
    const priorities = await Priority.find({ isDeleted: false });
    res.status(200).json(priorities);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching priorities', error });
  }
});

// Add a new priority
router.post('/', async (req, res) => {
  const { priorityName } = req.body;

  if (!priorityName) {
    return res.status(400).json({ message: 'Priority Name is required' });
  }

  try {
    const newPriority = new Priority({ priorityName });
    const savedPriority = await newPriority.save();
    res.status(201).json(savedPriority);
  } catch (error) {
    res.status(500).json({ message: 'Error saving priority', error });
  }
});

// Update an existing priority
router.put('/update/:id', async (req, res) => {
  const { id } = req.params;
  const { priorityName } = req.body;

  if (!priorityName) {
    return res.status(400).json({ message: 'Priority Name is required' });
  }

  try {
    const updatedPriority = await Priority.findByIdAndUpdate(
      id,
      { priorityName },
      { new: true }
    );

    if (!updatedPriority) {
      return res.status(404).json({ message: 'Priority not found' });
    }

    res.status(200).json(updatedPriority);
  } catch (error) {
    res.status(500).json({ message: 'Error updating priority', error });
  }
});

// Soft delete a priority
router.put('/softDelete/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const deletedPriority = await Priority.findByIdAndUpdate(
      id,
      { isDeleted: true },
      { new: true }
    );

    if (!deletedPriority) {
      return res.status(404).json({ message: 'Priority not found' });
    }

    res.status(200).json({ message: 'Priority soft deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting priority', error });
  }
});

module.exports = router;
