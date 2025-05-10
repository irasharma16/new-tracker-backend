const express = require('express');
const router = express.Router();
const Module = require('../models/module'); 

// Function to generate the next module code
const getNextModuleCode = async () => {
  try {
    const modules = await Module.find().sort({ moduleCode: 1 }).exec();

    let nextCode = 1;
    for (let module of modules) {
      if (module.moduleCode === nextCode) {
        nextCode++;
      } else {
        break;
      }
    }

    return nextCode;
  } catch (err) {
    console.error('Error fetching module codes:', err);
    return 1;
  }
};

// Get all non-deleted modules
router.get('/', async (req, res) => {
  try {
    const modules = await Module.find({ isDeleted: false }).sort({ moduleCode: 1 });
    res.json(modules);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching modules', error: err.message });
  }
});

// Create a new module
router.post('/', async (req, res) => {
  try {
    const { moduleName, cancelled, moduleCode } = req.body;

    if (!moduleName) {
      return res.status(400).json({ message: 'Module Name is required.' });
    }

    const module = new Module({
      moduleCode: moduleCode || await getNextModuleCode(),
      moduleName,
      cancelled: cancelled || false,
      isDeleted: false
    });

    const newModule = await module.save();
    res.status(201).json(newModule);
  } catch (err) {
    console.error('Error saving module:', err);
    res.status(500).json({ message: 'Error saving module', error: err.message });
  }
});

// Soft delete a module
router.put('/softDelete/:id', async (req, res) => {
  try {
    const module = await Module.findByIdAndUpdate(
      req.params.id,
      { isDeleted: true },
      { new: true }
    );

    if (!module) return res.status(404).json({ message: 'Module not found' });

    res.json({ message: 'Module soft deleted successfully' });
  } catch (err) {
    res.status(400).json({ message: 'Error deleting module', error: err.message });
  }
});

// Update a module's details
router.put('/update/:id', async (req, res) => {
  try {
    const { moduleName, cancelled, moduleCode } = req.body;

    if (!moduleName) {
      return res.status(400).json({ message: 'Module Name is required.' });
    }

    const updatedModule = await Module.findByIdAndUpdate(
      req.params.id,
      {
        moduleName,
        cancelled,
        moduleCode
      },
      { new: true }
    );

    if (!updatedModule) return res.status(404).json({ message: 'Module not found' });

    res.json(updatedModule);
  } catch (err) {
    res.status(400).json({ message: 'Error updating module', error: err.message });
  }
});

module.exports = router;