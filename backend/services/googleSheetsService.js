// googleSheetsService.js
const { google } = require('googleapis');
const Feedback = require('../models/Feedback');
const path = require('path');
const fs = require('fs').promises;
const NotificationService = require('./notificationService');
const debug = require('debug')('app:sheets');

class GoogleSheetsService {
  constructor() {
    const keyFilePath = path.join(__dirname, '..', process.env.GOOGLE_SERVICE_ACCOUNT_KEY);
    this.auth = new google.auth.GoogleAuth({
      keyFile: keyFilePath,
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });
    this.sheets = google.sheets({ version: 'v4', auth: this.auth });
    this.feedbackFilePath = path.join(__dirname, '..', 'data', 'feedback.txt');
  }

  async ensureDataDirectory() {
    debug('Ensuring data directory exists...');
    const dataDir = path.join(__dirname, '..', 'data');
    try {
      await fs.access(dataDir);
      debug('Data directory exists');
    } catch {
      debug('Creating data directory');
      await fs.mkdir(dataDir, { recursive: true });
    }
  }
   
  
  formatFeedbackForFile(feedback) {
    const date = new Date(feedback.SubmissionTime);
    const formattedDate = date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    return `
===============================
Submission Time: ${formattedDate}
Name: ${feedback.Name}
Phone Number: ${feedback.PhoneNumber}
Experience Rating: ${feedback.Experience}
Feedback: ${feedback.Feedback}
Follow-up Status: ${feedback.FollowUpStatus}
===============================
`;
  }

  async writeFeedbackFile(feedbackArray) {
    debug('Writing feedback to file');
    await this.ensureDataDirectory();

    let fileContent = `CUSTOMER FEEDBACK RECORDS\nLast Updated: ${new Date().toLocaleString()}\n\n`;

    feedbackArray.forEach((feedback) => {
      fileContent += this.formatFeedbackForFile(feedback);
    });

    await fs.writeFile(this.feedbackFilePath, fileContent, 'utf8');
    await fs.writeFile(
      this.feedbackFilePath.replace('.txt', '.json'),
      JSON.stringify(feedbackArray, null, 2),
      'utf8'
    );

    debug('Feedback written to files successfully');
  }

  async readFeedbackFile() {
    debug('Reading existing feedback file');
    try {
      const jsonPath = this.feedbackFilePath.replace('.txt', '.json');
      const data = await fs.readFile(jsonPath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      debug('No existing feedback file found or error reading file:', error.message);
      return [];
    }
  }

  async fetchAndSaveData() {
    try {
      debug('Starting Google Sheets sync process');
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: process.env.GOOGLE_SHEETS_ID,
        range: 'Form Responses 1!A2:E',
      });

      const rows = response.data.values;
      if (!rows || rows.length === 0) {
        debug('No data found in sheet');
        return;
      }

      debug(`Found ${rows.length} rows of data`);

      const allFeedback = await this.readFeedbackFile();
      const feedbackMap = new Map(allFeedback.map((f) => [f.submissionId, f]));

      for (const row of rows) {
        try {
          const [timestamp, name, phoneNumber, experience, feedback] = row;

          if (!phoneNumber || typeof phoneNumber !== 'string') {
            debug(`Invalid phone number: ${phoneNumber}`);
            continue;
          }

          // Validate and parse timestamp
          const parsedTimestamp = Date.parse(timestamp);
          if (isNaN(parsedTimestamp)) {
            debug(`Invalid timestamp: ${timestamp}`);
            continue;
          }

          const date = new Date(parsedTimestamp);

          const submissionId = `${date.getTime()}-${phoneNumber}`;
          const followUpDate = new Date(date);
          followUpDate.setHours(15, 54, 0, 0);
          if (date > followUpDate) {
            followUpDate.setDate(followUpDate.getDate() + 1);
          }

          const feedbackDoc = {
            submissionId,
            timestamp: date.toISOString(),
            customerName: name,
            phoneNumber,
            experience,
            feedback: feedback || '',
            createdAt: new Date().toISOString(),
            requiresFollowUp: true,
            followUpDate: followUpDate,
            status: 'pending',
          };

          const savedFeedback = await Feedback.findOneAndUpdate(
            { submissionId },
            feedbackDoc,
            { upsert: true, new: true }
          );

          if (savedFeedback.isNew) {
            try {
              const feedbackData = await Feedback.findOne({ submissionId });
              if (feedbackData.fcmToken) {
                await NotificationService.sendNotification(
                  feedbackData.fcmToken,
                  'Thank You for Your Feedback!',
                  'We value your opinion and appreciate your time.',
                  { feedbackId: savedFeedback._id }
                );
                debug('Notification sent successfully for new feedback');
              }
            } catch (notificationError) {
              debug('Error sending notification:', notificationError.message);
            }
          }

          const formattedFeedback = {
            submissionId,
            Name: name,
            PhoneNumber: phoneNumber,
            Experience: experience,
            Feedback: feedback || '',
            SubmissionTime: date.toISOString(),
            FollowUpStatus: savedFeedback.status,
          };

          feedbackMap.set(submissionId, formattedFeedback);
        } catch (rowError) {
          debug('Error processing row:', rowError.message);
          continue;
        }
      }

      const updatedFeedback = Array.from(feedbackMap.values()).sort(
        (a, b) => new Date(b.SubmissionTime) - new Date(a.SubmissionTime)
      );

      await this.writeFeedbackFile(updatedFeedback);
      debug('Data successfully saved to MongoDB and files');
    } catch (error) {
      debug('Error during Google Sheets sync:', error.message);
      throw error;
    }
  }

   syncFeedbackData = async () => {
    const syncStartTime = new Date();
    console.log(`Starting feedback sync at ${syncStartTime.toISOString()}`);
    
    try {
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: process.env.GOOGLE_SHEETS_ID,
        range: 'Form Responses 1!A2:F',
      });
  
      const rows = response.data.values;
      if (!rows) {
        console.log('No data found in sheets.');
        return;
      }
  
      console.log('Total rows found:', rows.length);
  
      let successCount = 0;
      let errorCount = 0;
  
      for (const row of rows) {
        try {
          const [rawTimestamp, name, email, rating, feedback, suggestions] = row;
          
          // Debug log
          console.log('Processing row:', {
            timestamp: rawTimestamp,
            name,
            email,
            rating,
            feedback: feedback?.substring(0, 50) // Log first 50 chars of feedback
          });
  
          // Parse timestamp
          const timestamp = new Date(rawTimestamp);
          if (isNaN(timestamp.getTime())) {
            console.warn(`Invalid timestamp format: ${rawTimestamp}`);
            errorCount++;
            continue;
          }
  
          const submissionId = `${timestamp.valueOf()}-${Buffer.from(email).toString('base64')}`;
  
          // Attempt to save the feedback
          try {
            const result = await Feedback.findOneAndUpdate(
              { submissionId },
              {
                submissionId,
                timestamp,
                customerName: name,
                email,
                rating, // Store the rating directly as received
                feedback,
                suggestions,
                lastSyncedAt: new Date()
              },
              { 
                upsert: true,
                new: true,
                runValidators: true
              }
            );
  
            console.log('Successfully saved feedback with ID:', result._id);
            successCount++;
          } catch (dbError) {
            console.error('Database error for submissionId:', submissionId, dbError);
            errorCount++;
          }
  
        } catch (rowError) {
          console.error('Error processing row:', rowError);
          errorCount++;
        }
      }
  
      const syncEndTime = new Date();
      const syncDuration = syncEndTime - syncStartTime;
      
      console.log(`Feedback sync completed at ${syncEndTime.toISOString()}`);
      console.log(`Sync statistics: Duration: ${syncDuration}ms, Successful: ${successCount}, Failed: ${errorCount}, Total: ${rows.length}`);
  
    } catch (error) {
      console.error('Sync error:', error);
      // Log the full error stack for debugging
      console.error('Full error:', error.stack);
    }
  };

}

module.exports = new GoogleSheetsService();
