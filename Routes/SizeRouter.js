const express = require('express');
const router = express.Router();
const Size = require('../models/size'); // Assuming `size.js` is in the Models folder

// Get all sizes (excluding soft-deleted ones)
router.get('/', async (req, res) => {
  try {
    const sizes = await Size.find({ isDeleted: false });
    res.json(sizes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new size
router.post('/', async (req, res) => {
  const { sizeName } = req.body;

  if (!sizeName) {
    return res.status(400).json({ message: 'Size Name is required' });
  }

  const size = new Size({ sizeName, isDeleted: false });

  try {
    const newSize = await size.save();
    res.status(201).json(newSize);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update an existing size
router.put('/:id', async (req, res) => {
  const { sizeName } = req.body;

  if (!sizeName) {
    return res.status(400).json({ message: 'Size Name is required' });
  }

  try {
    const size = await Size.findById(req.params.id);
    if (!size || size.isDeleted) {
      return res.status(404).json({ message: 'Size not found' });
    }

    size.sizeName = sizeName;
    const updatedSize = await size.save();
    res.json(updatedSize);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Soft delete a size
router.put('/softDelete/:id', async (req, res) => {
  try {
    const size = await Size.findByIdAndUpdate(req.params.id);
    if (!size || size.isDeleted) {
      return res.status(404).json({ message: 'Size not found' });
    }

    size.isDeleted = true;
    await size.save();
    res.json({ message: 'Size soft deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

