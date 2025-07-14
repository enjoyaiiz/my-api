const Menu = require('../models/Menu');

// GET all menu items
exports.getMenus = async (req, res) => {
  const menus = await Menu.find();
  res.json(menus);
};

// POST: Create new menu
exports.createMenu = async (req, res) => {
  const newMenu = new Menu(req.body);
  const saved = await newMenu.save();
  res.status(201).json(saved);
};

// PUT: Update
exports.updateMenu = async (req, res) => {
  const updated = await Menu.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updated);
};

// DELETE
exports.deleteMenu = async (req, res) => {
  await Menu.findByIdAndDelete(req.params.id);
  res.json({ message: 'Menu deleted' });
};
