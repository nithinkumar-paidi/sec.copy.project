const MenuItem = require('../models/menuItem');

// Get all menu items
const getMenuItems = async (req, res) => {
  try {
    const items = await MenuItem.find();
    res.json(items);
  } catch (error) {
    console.error('Error fetching menu items:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Add a menu item
const addMenuItem = async (req, res) => {
  const { name, price, description } = req.body;

  if (!name || !price || !description) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const menuItem = new MenuItem({ name, price, description });
    await menuItem.save();
    res.status(201).json(menuItem);
  } catch (error) {
    console.error('Error adding menu item:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getMenuItems,
  addMenuItem
};
