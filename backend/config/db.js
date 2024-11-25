// const mongoose = require('mongoose');

// const connectDB = async () => {
//   try {
//     await mongoose.connect(process.env.MONGO_URI, {
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//     });
//     console.log('MongoDB Connected');
//   } catch (error) {
//     console.error('MongoDB Connection Error:', error);
//     process.exit(1);
//   }
// };

// module.exports = connectDB;


const mongoose = require('mongoose');
const debug = require('debug')('app:database');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    debug(' MongoDB connected successfully');
  } catch (error) {
    debug(' MongoDB connection error:', error);
    process.exit(1);
  }
};

module.exports = connectDB;