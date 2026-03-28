const express = require('express');
const router = express.Router();
const { getCartItems, 
    addCartItem,
    editCartItem,
    deleteCartItem } = require('../controllers/cartsController');
const authenticate = require('../middleware/authMiddleware');

router.get('/', authenticate,  getCartItems);
router.post('/', authenticate,  addCartItem);
router.patch('/:cartItemId', authenticate,  editCartItem);
router.delete('/:cartItemId', authenticate, deleteCartItem);

module.exports = router;