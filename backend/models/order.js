const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderedItems: [{
    itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem' },
    quantity: { type: Number, required: true },
  }],
  createdAt: { type: Date, default: Date.now },
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
