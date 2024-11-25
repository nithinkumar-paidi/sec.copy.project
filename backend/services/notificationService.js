// // services/notificationService.js
// const twilio = require('twilio');

// class NotificationService {
//   constructor() {
//     this.client = twilio(
//       process.env.TWILIO_ACCOUNT_SID, 
//       process.env.TWILIO_AUTH_TOKEN
//     );
//   }

//   async sendSMS(phoneNumber, message) {
//     try {
//       const result = await this.client.messages.create({
//         body: message,
//         to: phoneNumber,
//         from: process.env.TWILIO_PHONE_NUMBER
//       });
      
//       console.log(`SMS sent successfully to ${phoneNumber}. SID: ${result.sid}`);
//       return { success: true, messageId: result.sid };
//     } catch (error) {
//       console.error('Error sending SMS:', error);
//       throw error;
//     }
//   }
// }

// module.exports = new NotificationService();


// const twilio = require('twilio');
// const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// class NotificationService {
//   static async sendSMS(to, message) {
//     // Check if the phone number is in E.164 format
//     if (!/^\+\d{10,15}$/.test(to)) {
//       console.error(`Invalid phone number format: ${to}. Phone numbers must be in E.164 format.`);
//       return { success: false, error: 'Invalid phone number format' };
//     }
    
//     try {
//       console.log(`Sending SMS to ${to}: ${message}`);
//       const result = await client.messages.create({
//         body: message,
//         to: to,
//         from: process.env.TWILIO_PHONE_NUMBER
//       });
      
//       console.log(`SMS sent successfully to ${to}. SID: ${result.sid}`);
//       return { success: true, messageId: result.sid };
//     } catch (error) {
//       console.error('Error sending SMS:', error);
//       return { success: false, error: error.message };
//     }
//   }
// }
// //Function to verify if the number is valid//
// async function isNumberVerified(phoneNumber) {
//     try {
//         const verification = await client.incomingPhoneNumbers
//             .list({ phoneNumber: phoneNumber })
//             .then((numbers) => {
//                 return numbers.length > 0; // Returns true if the number is verified
//             });
//         return verification;
//     } catch (err) {
//         console.error('Error verifying number:', err);
//         return false; // Return false if any error occurs
//     }
// }

// // Send SMS with number verification check
// async function sendSMS(phoneNumber, message) {
//     if (await isNumberVerified(phoneNumber)) {
//         try {
//             await client.messages.create({
//                 body: message,
//                 from: '+YOUR_TWILIO_PHONE_NUMBER', // Your Twilio phone number
//                 to: phoneNumber,
//             });
//             console.log(`SMS sent successfully to ${phoneNumber}`);
//         } catch (err) {
//             console.error(`Error sending SMS to ${phoneNumber}:`, err);
//         }
//     } else {
//         console.error(`Number ${phoneNumber} is not verified. Cannot send SMS.`);
//     }
// }

// module.exports = NotificationService;



    //  ////another///
    // //  const admin = require('firebase-admin');
    //  const admin = require('../config/firebase-config');


    //  if (!admin.apps.length) {
    //    const serviceAccount = require(process.env.FIREBASE_ADMIN_SDK_PATH);
    //    admin.initializeApp({
    //      credential: admin.credential.cert(serviceAccount),
    //    });
    //  }
     
    //  class NotificationService {
    //    /**
    //     * Send a notification using Firebase Cloud Messaging (FCM)
    //     * @param {string} token - FCM device token of the user
    //     * @param {string} title - Notification title
    //     * @param {string} body - Notification body
    //     * @param {Object} data - Additional data payload (optional)
    //     * @returns {Object} Result of the notification send process
    //     */
    //    static async sendNotification(token, title, body, data = {}) {
    //      if (!token || typeof token !== 'string') {
    //        throw new TypeError('Invalid token: Must be a non-empty string.');
    //      }
     
    //      try {
    //        const message = {
    //          token,
    //          notification: { title, body },
    //          data: { ...data },
    //        };
     
    //        console.log(`Sending FCM notification: ${JSON.stringify(message)}`);
    //        const result = await admin.messaging().send(message);
    //        console.log(`Notification sent successfully. Message ID: ${result}`);
    //        return { success: true, messageId: result };
    //      } catch (error) {
    //        console.error('Error sending FCM notification:', error);
    //        return { success: false, error: error.message };
    //      }
    //    }
    //  }
     
    //  module.exports = NotificationService;
     

        ////recent one///

//     // services/notificationService.js
// const admin = require('../config/firebase-config');  // Import the Firebase configuration

// class NotificationService {
//   /**
//    * Send a notification using Firebase Cloud Messaging (FCM)
//    * @param {string} token - FCM device token of the user
//    * @param {string} title - Notification title
//    * @param {string} body - Notification body
//    * @param {Object} data - Additional data payload (optional)
//    * @returns {Object} Result of the notification send process
//    */
//   static async sendNotification(token, title, body, data = {}) {
//     try {
//       const message = {
//         token,
//         notification: {
//           title,
//           body
//         },
//         data: { ...data },  // Additional data
//       };

//       console.log(`Sending FCM notification: ${JSON.stringify(message)}`);

//       const result = await admin.messaging().send(message);
//       console.log(`Notification sent successfully. Message ID: ${result}`);

//       return { success: true, messageId: result };
//     } catch (error) {
//       console.error('Error sending FCM notification:', error);
//       return { success: false, error: error.message };
//     }
//   }

//   // Method to send SMS notification (optional)
//   static async sendSMS(phoneNumber, message) {
//     // Your SMS sending logic here, or use the FCM method for push notifications
//     console.log(`Sending SMS to ${phoneNumber}: ${message}`);
//   }
// }

// module.exports = NotificationService;


// services/notificationService.js
// // notificationTracking.js
// const admin = require('../config/firebase-config');
// const Feedback = require('../models/Feedback');
// const debug = require('debug')('app:notification');

// class NotificationTracking {
//   static async checkMessageStatus(messageId) {
//     try {
//       debug(`Checking status for message ID: ${messageId}`);
//       const message = await admin.messaging().getMessageStatus(messageId);
//       return {
//         messageId,
//         status: message.status,
//         sendTime: message.sendTime,
//         deliveryTime: message.deliveryTime
//       };
//     } catch (error) {
//       debug(`Error checking message status: ${error.message}`);
//       return {
//         messageId,
//         status: 'error',
//         error: error.message
//       };
//     }
//   }

//   static async getNotificationHistory(customerId) {
//     try {
//       debug(`Fetching notification history for customer: ${customerId}`);
//       const feedback = await Feedback.findOne({ 
//         $or: [
//           { _id: customerId },
//           { phoneNumber: customerId }
//         ]
//       });

//       if (!feedback) {
//         debug('No feedback found for customer');
//         return null;
//       }

//       return feedback.notificationHistory || [];
//     } catch (error) {
//       debug(`Error fetching notification history: ${error.message}`);
//       throw error;
//     }
//   }

//   static async getAllPendingNotifications() {
//     try {
//       debug('Fetching all pending notifications');
//       const feedbacks = await Feedback.find({
//         'notificationHistory.status': 'pending'
//       });

//       return feedbacks.map(feedback => ({
//         customerId: feedback._id,
//         customerName: feedback.customerName,
//         phoneNumber: feedback.phoneNumber,
//         pendingNotifications: feedback.notificationHistory.filter(n => n.status === 'pending')
//       }));
//     } catch (error) {
//       debug(`Error fetching pending notifications: ${error.message}`);
//       throw error;
//     }
//   }

//   static async checkAllNotificationStatuses() {
//     try {
//       debug('Starting comprehensive notification status check');
//       const feedbacks = await Feedback.find({
//         'notificationHistory.messageId': { $exists: true }
//       });

//       const results = {
//         total: 0,
//         successful: 0,
//         failed: 0,
//         pending: 0,
//         details: []
//       };

//       for (const feedback of feedbacks) {
//         debug(`Checking notifications for customer: ${feedback.customerName}`);
        
//         for (const notification of feedback.notificationHistory) {
//           if (!notification.messageId) continue;

//           results.total++;
          
//           try {
//             const status = await this.checkMessageStatus(notification.messageId);
            
//             // Update notification status in database
//             await Feedback.updateOne(
//               { 
//                 _id: feedback._id,
//                 'notificationHistory.messageId': notification.messageId 
//               },
//               { 
//                 $set: { 
//                   'notificationHistory.$.status': status.status,
//                   'notificationHistory.$.lastChecked': new Date(),
//                   'notificationHistory.$.deliveryTime': status.deliveryTime
//                 }
//               }
//             );

//             results.details.push({
//               customerId: feedback._id,
//               customerName: feedback.customerName,
//               phoneNumber: feedback.phoneNumber,
//               messageId: notification.messageId,
//               status: status.status,
//               sentAt: notification.sentAt,
//               deliveredAt: status.deliveryTime
//             });

//             if (status.status === 'success') results.successful++;
//             else if (status.status === 'failed') results.failed++;
//             else results.pending++;

//           } catch (error) {
//             debug(`Error checking message ${notification.messageId}: ${error.message}`);
//             results.failed++;
//           }
//         }
//       }

//       debug('Notification status check completed', results);
//       return results;
//     } catch (error) {
//       debug(`Error in checkAllNotificationStatuses: ${error.message}`);
//       throw error;
//     }
//   }

//   // CLI tool for checking notification status
//   static async displayNotificationStatus() {
//     console.log('\nFCM Notification Status Check Tool');
//     console.log('=================================');

//     try {
//       const results = await this.checkAllNotificationStatuses();
      
//       console.log('\nSummary:');
//       console.log(`Total Notifications: ${results.total}`);
//       console.log(`Successful: ${results.successful}`);
//       console.log(`Failed: ${results.failed}`);
//       console.log(`Pending: ${results.pending}`);
      
//       console.log('\nDetailed Results:');
//       results.details.forEach(detail => {
//         console.log('\n-------------------');
//         console.log(`Customer: ${detail.customerName}`);
//         console.log(`Phone: ${detail.phoneNumber}`);
//         console.log(`Message ID: ${detail.messageId}`);
//         console.log(`Status: ${detail.status}`);
//         console.log(`Sent At: ${detail.sentAt}`);
//         console.log(`Delivered At: ${detail.deliveredAt || 'N/A'}`);
//       });

//     } catch (error) {
//       console.error('Error checking notification status:', error.message);
//     }
//   }
// }

// module.exports = NotificationTracking;

   ////new one ////


   const Feedback = require('../models/Feedback');
   const debug = require('debug')('app:notification');
   const admin = require('firebase-admin');
   const express = require('express');
   const router = express.Router();
   
   // Initialize Firebase Admin with your service account
   try {
     const serviceAccount = require('../config/firebase-service-account.json');
     admin.initializeApp({
       credential: admin.credential.cert(serviceAccount)
     });
     debug('Firebase Admin SDK initialized successfully');
   } catch (error) {
     debug('Firebase initialization error:', error);
   }
   
   class NotificationService {
     static async sendSMS(phoneNumber, message) {
       try {
         debug('Sending SMS:', { phoneNumber, message });
         // Placeholder for SMS API integration
         const response = { status: 'SENT', messageId: '12345' }; // Mock response
         debug('SMS sent successfully:', response);
         return response;
       } catch (error) {
         debug('Error sending SMS:', error);
         throw error;
       }
     }
     static async sendFCMNotification(feedback) {
      try {
        if (!feedback.fcmToken) {
          debug('No FCM token found for feedback:', feedback._id);
          return {
            success: false,
            message: 'No FCM token provided',
            error: 'Missing FCM token'
          };
        }
    
        const messagePayload = {
          notification: {
            title: 'Feedback Update',
            body: `Thank you for your feedback, ${feedback.customerName}!`
          },
          token: feedback.fcmToken
        };
    
        const response = await admin.messaging().send(messagePayload);
    
        // Log the successful FCM response
        await this.updateNotificationStatus(feedback._id, null, {
          success: true,
          messageId: response,
          timestamp: new Date()
        });
    
        debug('FCM notification sent successfully:', response);
    
        return {
          success: true,
          messageId: response
        };
      } catch (error) {
        debug('Error sending FCM notification:', error);
    
        // Log the failed FCM attempt
        await this.updateNotificationStatus(feedback._id, null, {
          success: false,
          error: error.message,
          timestamp: new Date()
        });
    
        return {
          success: false,
          error: error.message
        };
      }
    }
    
    static async updateNotificationStatus(feedbackId, smsResult, fcmResult) {
      try {
        const updateData = {};
        if (smsResult) {
          updateData.smsStatus = smsResult.status;
          updateData.smsResponse = smsResult;
        }
        if (fcmResult) {
          updateData.fcmStatus = fcmResult.success ? 'SENT' : 'FAILED';
          updateData.fcmResponse = fcmResult;
          updateData.fcmTimestamp = fcmResult.timestamp || new Date();
        }
    
        debug('Updating notification status in database:', { feedbackId, updateData });
    
        const result = await Feedback.findByIdAndUpdate(feedbackId, { $set: updateData }, { new: true });
        debug('Notification status updated successfully:', result);
      } catch (error) {
        debug('Error updating notification status in database:', error);
      }
    }
    
    
     static async sendNotifications(feedback) {
       try {
         const smsResult = feedback.phoneNumber ? await this.sendSMS(feedback.phoneNumber, `Thank you for your feedback, ${feedback.customerName}!`) : null;
         const fcmResult = feedback.fcmToken ? await this.sendFCMNotification(feedback) : null;
         await this.updateNotificationStatus(feedback._id, smsResult, fcmResult);
   
         return { smsResult, fcmResult };
       } catch (error) {
         debug('Error sending notifications:', error);
         throw error;
       }
     }
   }
   
   // Express Routes
   router.get('/', (req, res) => {
     res.json({ message: 'Notification routes are working' });
   });
   
   router.post('/send-notification', async (req, res) => {
    const { feedbackId } = req.body;
  
    if (!feedbackId) {
      return res.status(400).json({ error: 'Feedback ID is required' });
    }
  
    try {
      const feedback = await Feedback.findById(feedbackId);
      if (!feedback) {
        return res.status(404).json({ error: 'Feedback not found' });
      }
  
      const result = await NotificationService.sendNotifications(feedback);
  
      // Return a detailed response
      res.status(200).json({
        message: 'Notification process completed',
        notificationStatus: {
          smsStatus: result.smsResult ? result.smsResult.status : 'NOT_ATTEMPTED',
          fcmStatus: result.fcmResult ? (result.fcmResult.success ? 'SENT' : 'FAILED') : 'NOT_ATTEMPTED'
        },
        details: result
      });
    } catch (error) {
      debug('Error in /send-notification route:', error);
      res.status(500).json({ error: 'Internal server error', details: error.message });
    }
  });
   
   // Error Handling
   process.on('unhandledRejection', (error) => {
     debug('Unhandled Promise Rejection:', error);
   });
   
   process.on('uncaughtException', (error) => {
     debug('Uncaught Exception:', error);
   });
   
   module.exports = { NotificationService, router };
   