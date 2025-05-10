const express = require('express');
const router = express.Router();
const Issue = require('../models/registerissue');
const multer = require('multer');
const { sendEmail } = require('../emailService');
const path = require('path');

// Define storage for multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

// Helper function to handle issueNumber type conversion
const findIssueByNumber = async (issueNumber) => {
  // Try string comparison first
  let issue = await Issue.findOne({ issueNumber: issueNumber.toString() });
  
  // If not found, try numeric comparison
  if (!issue && !isNaN(issueNumber)) {
    issue = await Issue.findOne({ issueNumber: parseInt(issueNumber) });
  }
  
  return issue;
};

// Create a new issue
router.post('/', upload.single('attachment'), async (req, res) => {
  try {
    // Ensure issueNumber is stored as string
    const newIssue = new Issue({
      ...req.body,
      issueNumber: req.body.issueNumber.toString(),
      attachment: req.file ? req.file.filename : '',
      dateReported: new Date(), // Ensure date is set
    });
    await newIssue.save();
    res.status(201).json(newIssue);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get all issues
router.get('/', async (req, res) => {
  try {
    const { userRole, company, loggedInUser } = req.query;

    let issues;
    if (userRole === 'client') {
      if (!company) {
        return res.status(400).json({ error: 'Company parameter is required for clients.' });
      }
      issues = await Issue.find({ client: company });
    } else if (userRole === 'admin') {
      issues = await Issue.find();
    } else if (userRole === 'user') {
      issues = await Issue.find({
        $or: [{ assignTo: loggedInUser }, { assignTo2: loggedInUser }]
      });
    } else {
      return res.status(403).json({ error: 'Invalid user role' });
    }

    // Convert all issueNumbers to strings in response
    issues = issues.map(issue => ({
      ...issue.toObject(),
      issueNumber: issue.issueNumber.toString()
    }));

    res.status(200).json(issues);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update an issue by issueNumber
router.put('/:issueNumber', upload.single('attachment'), async (req, res) => {
  try {
    const { userRole, loggedInUser, company } = req.query;
    const { issueNumber } = req.params;

    // Find the existing issue using the helper function
    const existingIssue = await findIssueByNumber(issueNumber);
    if (!existingIssue) {
      return res.status(404).json({ error: 'Issue not found' });
    }

    // Check permissions based on role
    if (userRole === 'client' && existingIssue.client !== company) {
      return res.status(403).json({ error: 'Access denied. Clients can only update their own issues.' });
    }

    if (userRole === 'user' && 
        !(existingIssue.assignTo === loggedInUser || existingIssue.assignTo2 === loggedInUser)) {
      return res.status(403).json({ error: 'Access denied. Users can only update issues assigned to them.' });
    }

    // Prepare update data
    const updateData = {
      ...req.body,
      issueNumber: req.body.issueNumber.toString(),
      attachment: req.file ? req.file.filename : existingIssue.attachment
    };

    // Update the issue
    const updatedIssue = await Issue.findOneAndUpdate(
      { _id: existingIssue._id },
      updateData,
      { new: true }
    );

// Update the email sending section in the RegisterIssueRouter.js file

if (req.body.status === 'Closed') {
  try {
    // Send email using the email field from the existing issue
    if (existingIssue.email) {
      const emailSubject = `Issue #${existingIssue.issueNumber} Resolved - ${existingIssue.client}`;
      const emailBody = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f4f4f4;
    }
    .email-container {
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      padding: 30px;
    }
    .email-header {
      background-color: #4a90e2;
      color: white;
      text-align: center;
      padding: 15px;
      border-radius: 8px 8px 0 0;
      margin-bottom: 20px;
    }
    .email-content {
      margin-bottom: 20px;
    }
    .ticket-details {
      background-color: #f9f9f9;
      border-radius: 6px;
      padding: 15px;
      margin-bottom: 20px;
      border: 1px solid #e0e0e0;
    }
    .detail-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 10px;
      border-bottom: 1px solid #eee;
      padding-bottom: 10px;
    }
    .detail-row:last-child {
      border-bottom: none;
    }
    .detail-label {
      font-weight: bold;
      color: #555;
    }
    .detail-value {
      text-align: right;
      color: #333;
    }
    .email-footer {
      text-align: center;
      color: #888;
      font-size: 0.9em;
      margin-top: 20px;
      padding-top: 15px;
      border-top: 1px solid #e0e0e0;
    }
    .resolution-section {
      background-color: #e6f3ff;
      border-radius: 6px;
      padding: 15px;
      border: 1px solid #b3d9ff;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="email-header">
      <h1>Support Ticket Resolved</h1>
    </div>
    
    <div class="email-content">
      <p>Dear ${existingIssue.client},</p>
      
      <p>We are pleased to inform you that the support ticket for your issue has been resolved.</p>
      
      <div class="ticket-details">
        <div class="detail-row">
          <span class="detail-label">Ticket Number: </span>
          <span class="detail-value">#${existingIssue.issueNumber}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Client: </span>
          <span class="detail-value">${existingIssue.client}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Reported Date: </span>
          <span class="detail-value">${new Date(existingIssue.dateReported).toLocaleDateString()}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Target Date: </span>
          <span class="detail-value">${new Date(existingIssue.targetDate).toLocaleDateString()}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Assigned To: </span>
          <span class="detail-value">${existingIssue.assignTo}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Issue Type: </span>
          <span class="detail-value">${existingIssue.issueType}</span>
        </div>
      </div>
      
      <div class="resolution-section">
        <h3>Issue Description</h3>
        <p>${existingIssue.description}</p>
        
        <h3>Resolution Details</h3>
        <p>${req.body.finalResolution || 'No additional details provided'}</p>
      </div>
      
      <p>If you have any further questions or concerns, please don't hesitate to contact our support team.</p>
    </div>
    
    <div class="email-footer">
      <p>© ${new Date().getFullYear()} Support Team. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;
    
      // Send HTML email
      await sendEmail(existingIssue.email, emailSubject, emailBody, true); // Add a third parameter to indicate HTML email
    }
  } catch (emailError) {
    console.error('Error sending closure email:', emailError);
  }
}
    

    res.status(200).json(updatedIssue);
  } catch (err) {
    console.error('Error updating issue:', err);
    res.status(500).json({ error: err.message });
  }
});

// Delete an issue by issueNumber
router.delete('/:issueNumber', async (req, res) => {
  try {
    const { userRole } = req.query;
    const { issueNumber } = req.params;

    if (userRole !== 'admin') {
      return res.status(403).json({ error: 'Only administrators can delete issues.' });
    }

    // Find the issue using the helper function
    const issue = await findIssueByNumber(issueNumber);
    if (!issue) {
      return res.status(404).json({ error: 'Issue not found.' });
    }

    await Issue.deleteOne({ _id: issue._id });
    res.status(200).json({ message: 'Issue deleted successfully.' });
  } catch (err) {
    console.error('Error deleting issue:', err);
    res.status(500).json({ error: err.message });
  }
});

// Route to send additional emails if needed
router.post('/send-email', async (req, res) => {
  const { recipient, subject, body } = req.body;

  try {
    await sendEmail(recipient, subject, body);
    res.status(200).json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ error: 'Failed to send email' });
  }
});

module.exports = router;