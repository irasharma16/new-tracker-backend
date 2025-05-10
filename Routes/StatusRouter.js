const express = require('express');
const router = express.Router();
const Status = require('../models/status');

// Function to recalculate status codes
const recalculateStatusCodes = async () => {
  const statuses = await Status.find({ isDeleted: false }).sort({ _id: 1 });
  for (let i = 0; i < statuses.length; i++) {
    statuses[i].statusCode = i + 1; // Assign sequential status codes
    await statuses[i].save();
  }
};

// Get all statuses (only those not soft-deleted)
router.get('/', async (req, res) => {
  try {
    const statuses = await Status.find({ isDeleted: false }).sort({ statusCode: 1 });
    res.json(statuses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new status
router.post('/', async (req, res) => {
  const maxStatus = await Status.findOne().sort({ statusCode: -1 });
  const newStatusCode = maxStatus ? maxStatus.statusCode + 1 : 1;

  const status = new Status({
    statusCode: newStatusCode,
    statusName: req.body.statusName
  });

  try {
    const newStatus = await status.save();
    const updatedStatuses = await Status.find({ isDeleted: false }).sort({ statusCode: 1 });
    res.status(201).json(updatedStatuses);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update an existing status
router.put('/:id', async (req, res) => {
  try {
    const updatedStatus = await Status.findByIdAndUpdate(
      req.params.id,
      {
        statusName: req.body.statusName
      },
      { new: true }
    );

    if (!updatedStatus) {
      return res.status(404).json({ message: 'Status not found' });
    }

    await recalculateStatusCodes(); // Recalculate after updating
    const updatedStatuses = await Status.find({ isDeleted: false }).sort({ statusCode: 1 });
    res.json(updatedStatuses);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Soft delete a status
router.put('/softDelete/:id', async (req, res) => {
  try {
    const softDeletedStatus = await Status.findByIdAndUpdate(
      req.params.id,
      { isDeleted: true },
      { new: true }
    );

    if (!softDeletedStatus) {
      return res.status(404).json({ message: 'Status not found' });
    }

    await recalculateStatusCodes(); // Recalculate after deletion
    const updatedStatuses = await Status.find({ isDeleted: false }).sort({ statusCode: 1 });
    res.json(updatedStatuses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
