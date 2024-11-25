// // controllers/CustomerDisplayController.js
// const fs = require('fs');
// const path = require('path');
// const Feedback = require('../models/Feedback');

// class CustomerDisplayController {
//     static async generateCustomerList() {
//         try {
//             // Fetch all feedback data
//             const feedbacks = await Feedback.find({});
            
//             // Create content for the file
//             let content = 'Customer Contact Information\n';
//             content += '==========================\n\n';
            
//             feedbacks.forEach((feedback, index) => {
//                 content += `${index + 1}. Customer Name: ${feedback.customerName}\n`;
//                 content += `   Email: ${feedback.email}\n`;
//                 if (feedback.feedback) {
//                     content += `   Feedback: ${feedback.feedback}\n`;
//                 }
//                 content += '----------------------------\n';
//             });

//             // Define file path in your data folder
//             const filePath = path.join(__dirname, '../data/customer-list.txt');

//             // Create data directory if it doesn't exist
//             const dir = path.dirname(filePath);
//             if (!fs.existsSync(dir)) {
//                 fs.mkdirSync(dir, { recursive: true });
//             }

//             // Write to file
//             fs.writeFileSync(filePath, content);

//             return filePath;
//         } catch (error) {
//             console.error('Error generating customer list:', error);
//             throw error;
//         }
//     }

//     static async getCustomerList() {
//         try {
//             const filePath = path.join(__dirname, '../data/customer-list.txt');
            
//             if (!fs.existsSync(filePath)) {
//                 throw new Error('Customer list has not been generated yet');
//             }

//             return fs.readFileSync(filePath, 'utf8');
//         } catch (error) {
//             console.error('Error reading customer list:', error);
//             throw error;
//         }
//     }
// }

// module.exports = CustomerDisplayController;