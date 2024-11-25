const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const { google } = require('googleapis');
const cron = require('node-cron');
const dotenv = require('dotenv');
const debug = require('debug')('app:server');
const fs = require('fs');
const admin = require('firebase-admin');
const moment = require('moment');
const path = require('path');


dotenv.config();

const serviceAccount = require('./firebase-service-account.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
const messaging = admin.messaging();

const menuItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String, required: true },
});

const orderSchema = new mongoose.Schema({
  orderedItems: [{
    itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem' },
    quantity: { type: Number, required: true },
  }],
  createdAt: { type: Date, default: Date.now },
});

const bookingSchema = new mongoose.Schema({
  name: { type: String, required: true },
  members: { type: Number, required: true },
  tableId: { type: Number, required: true },
  area: { type: String, required: true },
  orderedItems: [{
    itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem' },
    quantity: { type: Number, required: true },
  }],
});

const feedbackSchema = new mongoose.Schema({
  submissionId: { 
    type: String, 
    unique: true 
  },
  timestamp: Date,
  customerName: String,
  email: String,
  rating: Number,
  feedback: String,
  suggestions: String,
  userToken: { type: String, required: false },
  lastSyncedAt: { type: Date, default: Date.now },
  syncStatus: { type: String, enum: ['success', 'error'], default: 'success' },
}, { 
  timestamps: true 
});

const MenuItem = mongoose.model('MenuItem', menuItemSchema);
const Order = mongoose.model('Order', orderSchema);
const Booking = mongoose.model('Booking', bookingSchema);
const Feedback = mongoose.model('Feedback', feedbackSchema);

const app = express();
const PORT = process.env.PORT || 3000;

mongoose.set('debug', true);

process.on('uncaughtException', (error) => {
  console.error('UNCAUGHT EXCEPTION:', error);
  debug('Uncaught Exception: %O', error);
  fs.appendFile('error.log', `${new Date().toISOString()} - ${error.stack}\n`, (err) => {
    if (err) console.error('Could not log to file', err);
  });
});

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/restaurant');
    console.log('MongoDB connected successfully');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
};

connectDB();

const auth = new google.auth.GoogleAuth({
  keyFile: process.env.GOOGLE_SERVICE_ACCOUNT_KEY,
  scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
});

const sheets = google.sheets({ version: 'v4', auth });
const feedbackFilePath = path.join(__dirname, 'data','feedback.txt');


// Define the ratingMap to convert textual ratings to numeric ones
// Define the ratingMap to convert textual ratings to numeric ones
const ratingMap = {
  'Very Poor': 1,
  'Poor': 2,
  'Average': 3,
  'Good': 4,
  'Excellent': 5
};

// Updated feedback sync function
async function syncFeedbackData() {
  const syncStartTime = new Date();
  console.log(`Starting feedback sync at ${syncStartTime.toISOString()}`);

  let successCount = 0;
  let errorCount = 0;

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEETS_ID,
      range: 'Form Responses 1!A2:F',
    });

    const rows = response.data.values;

    if (!rows || rows.length === 0) {
      console.log('No data found in Google Sheets.');
      return;
    }

    console.log(`Found ${rows.length} rows in Google Sheets.`);

    for (const row of rows) {
      try {
        const [rawTimestamp, name, phoneNumber, feedback, rating, suggestions] = row;

        const timestamp = moment(rawTimestamp, [
          'DD/MM/YYYY HH:mm:ss',
          'MM/DD/YYYY HH:mm:ss',
          'YYYY-MM-DD HH:mm:ss',
          moment.ISO_8601,
        ]);
        if (!timestamp.isValid()) throw new Error(`Invalid timestamp: ${rawTimestamp}`);

        // Validate rating
        let numericRating = parseInt(rating, 10);
        if (isNaN(numericRating)) {
          numericRating = ratingMap[rating];
        }

        // If the rating is still invalid, assign a default value or skip the row
        if (!numericRating) {
          numericRating = 3; // Default to "Average"
        }

        const submissionId = `${timestamp.valueOf()}-${Buffer.from(name || '').toString('base64')}`;

        // Insert or update feedback in the database
        await Feedback.findOneAndUpdate(
          { submissionId },
          {
            submissionId,
            timestamp: timestamp.toDate(),
            customerName: name || 'Anonymous',
            phoneNumber: phoneNumber || 'Unknown',
            feedback,
            suggestions,
            lastSyncedAt: new Date(),
            syncStatus: 'success',
          },
          { upsert: true, new: true, runValidators: true }
        );

        // Append formatted feedback to feedback.txt
        const feedbackData = `
----------------------------------------
Customer Name: ${name || 'Anonymous'}
Phone Number: ${phoneNumber || 'Unknown'}
Feedback: ${feedback || 'No feedback provided'}
Rating: ${rating || 'No rating provided'}
Suggestions: ${suggestions || 'No suggestions provided'}
Timestamp: ${timestamp.format('YYYY-MM-DD HH:mm:ss')}
----------------------------------------\n`;
        fs.appendFileSync(feedbackFilePath, feedbackData);

        successCount++;
      } catch (error) {
        console.error(`Error processing row: ${JSON.stringify(row)} - ${error.message}`);
        errorCount++;
      }
    }

    const syncEndTime = new Date();
    console.log(`Feedback sync completed at ${syncEndTime.toISOString()}`);
    console.log(`Sync statistics:
      - Duration: ${syncEndTime - syncStartTime}ms
      - Successful: ${successCount}
      - Failed: ${errorCount}
      - Total: ${rows.length}`);
  } catch (error) {
    console.error('Sync error:', error.message);
    fs.appendFileSync(
      feedbackFilePath,
      `Sync Error: ${error.message}\n`
    );
  }
}



cron.schedule('3 * * * * *', async () => {
  console.log('Running scheduled feedback sync...');
  await syncFeedbackData();
});

app.post('/send-notification', async (req, res) => {
  const { userToken, title, message } = req.body;

  if (!userToken || !title || !message) {
    return res.status(400).json({ error: 'User token, title, and message are required' });
  }

  try {
    const notificationPayload = {
      notification: {
        title,
        body: message,
      },
      token: userToken,
    };

    const response = await messaging.send(notificationPayload);
    console.log('Notification sent successfully:', response);
    res.status(200).json({ message: 'Notification sent successfully', response });
  } catch (error) {
    console.error('Error sending notification:', error);
    res.status(500).json({ error: 'Error sending notification', details: error.message });
  }
});

app.post('/api/feedback', async (req, res) => {
  const { submissionId, customerName, email, rating, feedback, suggestions, userToken } = req.body;

  if (!submissionId || !customerName || !email || !rating || !feedback) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const newFeedback = new Feedback({
      submissionId,
      customerName,
      email,
      rating,
      feedback,
      suggestions,
      userToken,
    });

    await newFeedback.save();
    res.status(201).json(newFeedback);
  } catch (error) {
    console.error('Error creating feedback:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/', (req, res) => {
  res.send('Server is running successfully!');
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = { app, server };