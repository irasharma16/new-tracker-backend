const express = require('express');
const multer = require('multer');
const TimeSheet = require('../models/TimeSheet');
const fs = require('fs');
const path = require('path');
const router = express.Router();

// Ensure the 'timesheets' folder exists for storing files
const uploadDir = path.join(__dirname, '../uploads/timesheets');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Define storage for uploaded files
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

// Multer configuration
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB file size limit
});

// Create a new timesheet
router.post('/', upload.single('uploadedFile'), async (req, res) => {
  try {
    const { dateOfSubmission, projectName, clientName, month, remark } = req.body;

    const newTimeSheet = new TimeSheet({
      dateOfSubmission,
      projectName,
      clientName,
      month,
      remark,
      uploadedFile: req.file ? req.file.path : null,
    });

    const savedTimeSheet = await newTimeSheet.save();
    res.status(201).json(savedTimeSheet);
  } catch (error) {
    console.error('Error creating timesheet:', error);
    res.status(500).json({ message: 'Failed to save timesheet' });
  }
});

// Fetch all timesheets
router.get('/', async (_req, res) => {
  try {
    const timesheets = await TimeSheet.find();
    res.status(200).json(timesheets);
  } catch (error) {
    console.error('Error fetching timesheets:', error);
    res.status(500).json({ message: 'Failed to fetch timesheets' });
  }
});

// Update an existing timesheet by ID
router.put('/:id', upload.single('uploadedFile'), async (req, res) => {
  try {
    const { id } = req.params;
    const { dateOfSubmission, projectName, clientName, month, remark } = req.body;

    const updateData = {
      dateOfSubmission,
      projectName,
      clientName,
      month,
      remark,
    };

    if (req.file) {
      updateData.uploadedFile = req.file.path;
    }

    const updatedTimeSheet = await TimeSheet.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    );

    if (!updatedTimeSheet) {
      return res.status(404).json({ message: 'Timesheet not found' });
    }

    res.status(200).json(updatedTimeSheet);
  } catch (error) {
    console.error('Error updating timesheet:', error);
    res.status(500).json({ message: 'Failed to update timesheet' });
  }
});

// Serve uploaded files
router.get('/uploads/:filename', (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(uploadDir, filename);

  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).json({ message: 'File not found' });
  }
});

module.exports = router;
