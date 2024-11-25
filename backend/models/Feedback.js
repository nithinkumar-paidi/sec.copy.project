// const mongoose = require('mongoose');

// const feedbackSchema = new mongoose.Schema({
//   customerName: { type: String, required: true },
//   phoneNumber: { type: String, required: true },
//   feedback: { type: String, required: true },
//   fcmToken: { type: String },
//   followUpScheduled: { type: Boolean, default: false }, // Whether a follow-up is scheduled
//   followUpTime: { type: Date }, // Time for the follow-up notification
//   followUpSent: { type: Boolean, default: false } // Whether follow-up notification was sent
// });

// module.exports = mongoose.model('Feedback', feedbackSchema);



// models/Feedback.js
const mongoose = require('mongoose');

const FeedbackSchema = new mongoose.Schema({
  submissionId: { type: String, required: true, unique: true },
  customerName: { type: String, required: true },
  phoneNumber: { type: String, required: true }, // Add this field
  rating: { type: Number, required: true },
  feedback: { type: String },
  fcmToken: { type: String },
  fcmStatus: { type: String, enum: ['SENT', 'FAILED'], default: 'PENDING' },
  fcmResponse: { type: String },
  timestamp: { type: Date, default: Date.now },
  status: { type: String, enum: ['pending', 'resolved'], default: 'pending' },
}, { timestamps: true });

module.exports = mongoose.model('Feedback', FeedbackSchema);
