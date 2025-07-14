const express = require('express');
const router = express.Router();
const menuCtrl = require('../controllers/menuController');

router.get('/', menuCtrl.getMenus);
router.post('/', menuCtrl.createMenu);
router.put('/:id', menuCtrl.updateMenu);
router.delete('/:id', menuCtrl.deleteMenu);

module.exports = router;
