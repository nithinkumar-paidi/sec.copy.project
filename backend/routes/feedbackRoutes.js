// routes/feedback.js
const express = require('express');
const router = express.Router();
const FeedbackController = require('../Controllers/feedbackController');

router.post('/submit', FeedbackController.createFeedback);
router.get('/all', FeedbackController.getAllFeedback);
router.get('/generate-list', FeedbackController.feedback.txt);
// Send Notification Immediately
router.post('/send-now', async (req, res) => {
    const { feedbackId } = req.body;
  
    if (!feedbackId) {
      return res.status(400).json({ error: 'Feedback ID is required' });
    }
  
    try {
      await FeedbackController.processFollowUps(feedbackId);
      res.status(200).json({ message: 'Notification sent immediately' });
    } catch (error) {
      console.error('Error in /send-now route:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  // Schedule Notification
  router.post('/schedule', async (req, res) => {
    const { feedbackId, sendTime } = req.body;
  
    if (!feedbackId || !sendTime) {
      return res.status(400).json({ error: 'Feedback ID and send time are required' });
    }
  
    try {
      await FeedbackController.scheduleFollowUp(feedbackId, sendTime);
      res.status(200).json({ message: 'Follow-up notification scheduled successfully' });
    } catch (error) {
      console.error('Error in /schedule route:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

module.exports = router;