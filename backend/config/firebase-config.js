// // config/firebase-config.js
// const admin = require('firebase-admin');
// const serviceAccount = require('../path-to-your-firebase-service-account.json');

// admin.initializeApp({
//     credential: admin.credential.cert(serviceAccount)
// });

// module.exports = admin;



// // config/firebase-config.js
// const admin = require('firebase-admin');
// const serviceAccount = require('../config/firebase-service-account.json'); // Path to your Firebase service account JSON file

// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
// });

// module.exports = admin;



const admin = require('firebase-admin');

const firebaseConfig = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL
};

admin.initializeApp({
  credential: admin.credential.cert(firebaseConfig)
});

module.exports = admin;

