const Order = require('../models/order');

// Create an order
const createOrder = async (req, res) => {
  const { orderedItems } = req.body;

  if (!orderedItems || orderedItems.length === 0) {
    return res.status(400).json({ error: 'Ordered items are required' });
  }

  try {
    const order = new Order({ orderedItems });
    await order.save();
    res.status(201).json({ orderId: order._id, orderedItems });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Fetch all orders
const getOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate('orderedItems.itemId');
    res.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  createOrder,
  getOrders
};
