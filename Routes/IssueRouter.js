const express = require('express');
const router = express.Router();
const Issue = require('../models/issue');

// Function to generate the next issue code
const getNextIssueCode = async () => {
  try {
    const issues = await Issue.find().sort({ issueCode: 1 }).exec();

    let nextCode = 1;
    for (let issue of issues) {
      if (issue.issueCode === nextCode) {
        nextCode++;
      } else {
        break;
      }
    }

    return nextCode;
  } catch (err) {
    console.error('Error fetching the issue codes:', err);
    return 1;
  }
};

// Get all non-deleted issues
router.get('/', async (req, res) => {
  try {
    const issues = await Issue.find({ isDeleted: false }).sort({ issueCode: 1 });
    res.json(issues);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a new issue
router.post('/', async (req, res) => {
  try {
    if (!req.body.issueName || req.body.trCheck === undefined) {
      return res.status(400).json({ message: 'Issue Name and TR Check are required.' });
    }

    const issueCode = await getNextIssueCode();

    const issue = new Issue({
      issueCode,
      issueName: req.body.issueName,
      trCheck: req.body.trCheck,
      isDeleted: false
    });

    const newIssue = await issue.save();
    res.status(201).json(newIssue);
  } catch (err) {
    console.error('Error saving issue:', err);
    res.status(500).json({ message: 'Error saving issue', error: err.message });
  }
});

// Soft delete an issue
router.put('/softDelete/:id', async (req, res) => {
  try {
    const issue = await Issue.findByIdAndUpdate(
      req.params.id,
      { isDeleted: true },
      { new: true }
    );

    if (!issue) return res.status(404).json({ message: 'Issue not found' });

    res.json({ message: 'Issue soft deleted successfully' });
  } catch (err) {
    res.status(400).json({ message: 'Error deleting issue', error: err.message });
  }
});

 
// Update an issue's details
router.put('/update/:id', async (req, res) => {
  try {
    const updatedIssue = await Issue.findByIdAndUpdate(
      req.params.id,
      {
        issueName: req.body.issueName,
        trCheck: req.body.trCheck,
      },
      { new: true }
    );

    if (!updatedIssue) return res.status(404).json({ message: 'Issue not found' });

    res.json(updatedIssue);
  } catch (err) {
    res.status(400).json({ message: 'Error updating issue', error: err.message });
  }
});


module.exports = router;