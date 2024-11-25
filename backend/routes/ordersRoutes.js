const express = require('express');
const router = express.Router();
const ordersController = require('../Controllers/ordersController');

// Route to create a new order
router.post('/orders', ordersController.createOrder);

// Route to get all orders
router.get('/orders', ordersController.getOrders);

module.exports = router;
