const mongoose = require('mongoose');

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

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;
