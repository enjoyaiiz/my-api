const mongoose = require('mongoose');

const menuSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  size: { type: String, enum: ['S', 'M', 'L'], required: true },
});

module.exports = mongoose.model('Menu', menuSchema);
