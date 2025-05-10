const express = require('express');
const router = express.Router();
const ClientVisit = require('../models/ClientVisit');

// Create a new client visit
router.post('/', async (req, res) => {
  try {
    console.log('Request Data:', req.body);
    const newVisit = new ClientVisit(req.body);
    const savedVisit = await newVisit.save();
    res.status(201).json(savedVisit);
  } catch (err) {
    console.error('Error creating client visit:', err.message);
    res.status(400).json({ message: 'Error creating client visit', error: err.message });
  }
});

// Get all client visits
router.get('/', async (req, res) => {
  try {
    const visits = await ClientVisit.find();
    res.json(visits);
  } catch (err) {
    console.error('Error fetching client visits:', err.message);
    res.status(500).json({ message: 'Error fetching client visits', error: err.message });
  }
});

// Update a client visit
router.put('/:id', async (req, res) => {
  try {
    const updatedVisit = await ClientVisit.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!updatedVisit) {
      return res.status(404).json({ message: 'Client visit not found' });
    }
    res.json(updatedVisit);
  } catch (err) {
    console.error('Error updating client visit:', err.message);
    res.status(400).json({ message: 'Error updating client visit', error: err.message });
  }
});

// Delete a client visit
router.delete('/:id', async (req, res) => {
  try {
    const deletedVisit = await ClientVisit.findByIdAndDelete(req.params.id);
    if (!deletedVisit) {
      return res.status(404).json({ message: 'Client visit not found' });
    }
    res.json({ message: 'Client visit deleted successfully' });
  } catch (err) {
    console.error('Error deleting client visit:', err.message);
    res.status(500).json({ message: 'Error deleting client visit', error: err.message });
  }
});

module.exports = router;

