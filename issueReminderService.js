const cron = require('node-cron');
const axios = require('axios');
const { sendEmail } = require('./emailService');
const Issue = require('./models/registerissue');
const User = require('./models/Users'); 

class IssueReminderService {
  constructor() {
    this.initScheduledReminders();
  }

  initScheduledReminders() {
    console.log('Initializing scheduled reminders');
    
    // Run once every 24 hours to check for issues older than 72 hours
    cron.schedule('0 0 */1 * *', async () => {
      console.log(`Running issue reminder check at ${new Date().toISOString()}`);
      try {
        await this.sendOpenIssueReminders();
      } catch (error) {
        console.error('Error in scheduled issue reminder task:', error);
      }
    });
  }

  async sendOpenIssueReminders() {
    console.log('Running sendOpenIssueReminders at', new Date());
    
    // Find issues that are not closed
    const nonClosedIssues = await Issue.find({ status: { $ne: 'Closed' } });
    console.log(`Found ${nonClosedIssues.length} non-closed issues`);
  
    for (const issue of nonClosedIssues) {
      try {
        // Calculate time since issue was reported
        const issueAge = new Date() - new Date(issue.dateReported);
        const hoursSinceReported = Math.floor(issueAge / (1000 * 60 * 60));
  
        // Only send reminder if the issue is older than 72 hours
        if (hoursSinceReported >= 72) {
          // Find emails for assigned persons
          const assignedUsers = await this.findAssignedUsersEmails(issue);
          
          // Send reminder email to each assigned user
          for (const user of assignedUsers) {
            if (user.email) {
              await this.sendIssueReminderEmail(issue, user);
            }
          }
        }
      } catch (error) {
        console.error(`Error processing issue ${issue.issueNumber}:`, error);
      }
    }
  }

  async findAssignedUsersEmails(issue) {
    const assignedUsers = [];

    // Find users by assigned names
    if (issue.assignTo) {
      const user1 = await User.findOne({ name: issue.assignTo });
      if (user1) assignedUsers.push(user1);
    }

    if (issue.assignTo2) {
      const user2 = await User.findOne({ name: issue.assignTo2 });
      if (user2) assignedUsers.push(user2);
    }

    return assignedUsers;
  }

  async sendIssueReminderEmail(issue, user) {
    const emailSubject = `Reminder: Open Issue #${issue.issueNumber} Requires Attention`;
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
      background-color: #ff6b6b;
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
    .reminder-text {
      background-color: #fff3cd;
      border: 1px solid #ffeeba;
      color: #856404;
      padding: 15px;
      border-radius: 6px;
      margin-bottom: 20px;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="email-header">
      <h1>Open Issue Reminder</h1>
    </div>
    
    <div class="reminder-text">
      <p><strong>Action Required:</strong> This issue has been open for some time and requires your attention.</p>
    </div>
    
    <div class="email-content">
      <p>Dear ${user.name},</p>
      
      <p>This is a friendly reminder about an open issue that needs your action.</p>
      
      <div class="ticket-details">
        <div class="detail-row">
          <span class="detail-label">Ticket Number:</span>
          <span class="detail-value">#${issue.issueNumber}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Client:</span>
          <span class="detail-value">${issue.client}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Date Reported:</span>
          <span class="detail-value">${new Date(issue.dateReported).toLocaleDateString()}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Issue Type:</span>
          <span class="detail-value">${issue.issueType}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Description:</span>
          <span class="detail-value">${issue.description}</span>
        </div>
      </div>
      
      <p>Please update or resolve this issue as soon as possible. If you need additional time or resources, communicate with your team.</p>
    </div>
  </div>
</body>
</html>
    `;

    try {
      await sendEmail(user.email, emailSubject, emailBody, true);
      console.log(`Reminder email sent to ${user.name} for issue #${issue.issueNumber}`);
    } catch (error) {
      console.error(`Failed to send reminder email to ${user.name}:`, error);
    }
  }
}

// Export as a singleton
module.exports = new IssueReminderService();