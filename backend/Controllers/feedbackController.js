// controllers/feedbackController.js
const Feedback = require('../models/Feedback');
const NotificationService = require('../services/notificationService');

class FeedbackController {
  static async createFeedback(req, res) {
    try {
      const {
        customerName,
        phoneNumber,
        rating,
        feedback,
        fcmToken
      } = req.body;
      console.log('Incoming Request Body:', req.body); // Add this for debugging

      // Validate required fields
      if (!customerName || !phoneNumber || !rating) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields'
        });
      }

      // Create unique submissionId
      const submissionId = `${Date.now()}-${phoneNumber}`;

      const newFeedback = new Feedback({
        submissionId,
        customerName,
        phoneNumber,
        rating,
        feedback,
        fcmToken,
        timestamp: new Date(),
        status: 'pending'
      });

      const savedFeedback = await newFeedback.save();

      // Send notification if fcmToken is provided
      if (fcmToken) {
        try {
          await NotificationService.sendNotification(
            fcmToken,
            'Thank You for Your Feedback!',
            'We appreciate your valuable feedback.',
            { feedbackId: savedFeedback._id }
          );

          await Feedback.findByIdAndUpdate(savedFeedback._id, {
            fcmStatus: 'SENT',
            fcmTimestamp: new Date()
          });
        } catch (notificationError) {
          console.error('Notification error:', notificationError);
          await Feedback.findByIdAndUpdate(savedFeedback._id, {
            fcmStatus: 'FAILED',
            fcmResponse: notificationError.message
          });
        }
      }

      res.status(201).json({
        success: true,
        data: savedFeedback
      });

    } catch (error) {
      console.error('Error creating feedback:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating feedback',
        error: error.message
      });
    }
  }

  static async getAllFeedback(req, res) {
    try {
      const feedback = await Feedback.find()
        .sort({ timestamp: -1 })
        .limit(100);

      res.json({
        success: true,
        count: feedback.length,
        data: feedback
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching feedback',
        error: error.message
      });
    }
  }
}

module.exports = FeedbackController;