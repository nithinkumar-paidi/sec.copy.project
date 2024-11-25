// // scheduled-tasks/followUpScheduler.js
// const cron = require('node-cron');
// const FeedbackController = require('../Controllers/feedbackController');

// cron.schedule('*/1 * * * * ', async () => {
//   console.log('Running scheduled follow-up checks...');
//   try {
//     await FeedbackController.processFollowUps();
//     console.log('Follow-up processing completed successfully');
//   } catch (error) {
//     console.error('Error in scheduled follow-up processing:', error);
//   }
// });

/////
                                      //////runing one///

// const cron = require('node-cron');
// const FeedbackController = require('../Controllers/feedbackController');
// const NotificationService = require('../services/notificationService'); // Assuming NotificationService is in services folder
// const moment = require('moment');

// // Immediate Notification Functionality
// async function sendNotificationNow(feedbackId) {
//   try {
//     console.log(`Sending notification immediately for feedbackId: ${feedbackId}`);
//     await NotificationService.sendNotificationsById(feedbackId);
//     console.log(`Notification sent immediately for feedbackId: ${feedbackId}`);
//   } catch (error) {
//     console.error('Error sending immediate notification:', error);
//   }
// }

// // Schedule Notification for a Future Time
// async function scheduleNotification(feedbackId, sendTime) {
//   try {
//     const now = moment();
//     const delayInMilliseconds = moment(sendTime).diff(now);

//     if (delayInMilliseconds <= 0) {
//       console.error('Scheduled time is in the past. Sending notification immediately.');
//       return sendNotificationNow(feedbackId);
//     }

//     console.log(`Scheduling notification for feedbackId: ${feedbackId} at ${sendTime}`);
//     setTimeout(async () => {
//       try {
//         await NotificationService.sendNotificationsById(feedbackId);
//         console.log(`Notification sent for feedbackId: ${feedbackId} at ${moment().toISOString()}`);
//       } catch (error) {
//         console.error('Error sending scheduled notification:', error);
//       }
//     }, delayInMilliseconds);
//   } catch (error) {
//     console.error('Error scheduling notification:', error);
//   }
// }

// // Cron Job to Check for Pending Follow-Ups
// cron.schedule('/1 * * * *', async () => {
//   console.log('Checking for pending follow-ups...');
//   try {
//     await FeedbackController.processFollowUps();
//     console.log('Follow-up processing completed');
//   } catch (error) {
//     console.error('Error in follow-up processing:', error);
//   }
// });

// module.exports = {
//   sendNotificationNow,
//   scheduleNotification
// };


const cron = require('node-cron');
const FeedbackController = require('../Controllers/feedbackController');
const NotificationService = require('../services/notificationService'); // Assuming NotificationService is in services folder
const moment = require('moment');

// Immediate Notification Functionality
async function sendNotificationNow(feedbackId) {
  try {
    console.log(`Sending notification immediately for feedbackId: ${feedbackId}`);
    await NotificationService.sendNotificationsById(feedbackId);
    console.log(`Notification sent immediately for feedbackId: ${feedbackId}`);
  } catch (error) {
    console.error('Error sending immediate notification:', error);
  }
}

// Schedule Notification for Future Time
async function scheduleNotification(feedbackId, sendAfterMinutes = 5) {
  try {
    const now = moment();
    const sendTime = now.add(sendAfterMinutes, 'minutes'); // Calculate the time 5 minutes from now
    const delayInMilliseconds = moment(sendTime).diff(now);

    console.log(`Scheduling notification for feedbackId: ${feedbackId} in ${sendAfterMinutes} minutes (at ${sendTime.toISOString()})`);

    setTimeout(async () => {
      try {
        await NotificationService.sendNotificationsById(feedbackId);
        console.log(`Notification sent for feedbackId: ${feedbackId} at ${moment().toISOString()}`);
      } catch (error) {
        console.error('Error sending scheduled notification:', error);
      }
    }, delayInMilliseconds);
  } catch (error) {
    console.error('Error scheduling notification:', error);
  }
}

// Cron Job to Check for Pending Follow-Ups
// Runs every minute
cron.schedule('* * * * *', async () => {
  console.log('Checking for pending follow-ups...');
  try {
    await FeedbackController.processFollowUps(); // Ensure this processes pending follow-ups appropriately
    console.log('Follow-up processing completed');
  } catch (error) {
    console.error('Error in follow-up processing:', error);
  }
});

// Example: Dynamic Follow-Up Notification
async function followUpInFiveMinutes(feedbackId) {
  console.log(`Scheduling follow-up for feedbackId: ${feedbackId} in 5 minutes.`);
  await scheduleNotification(feedbackId, 5); // Calls scheduleNotification to trigger in 5 minutes
}

module.exports = {
  sendNotificationNow,
  scheduleNotification,
  followUpInFiveMinutes
};
