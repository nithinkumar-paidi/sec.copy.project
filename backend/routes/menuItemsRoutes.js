const express = require('express');
const router = express.Router();
const menuItemsController = require('../Controllers/menuItemsController');

// Route to get all menu items
router.get('/menuitems', menuItemsController.getMenuItems);

// Route to add a new menu item
router.post('/menuitems', menuItemsController.addMenuItem);

module.exports = router;
