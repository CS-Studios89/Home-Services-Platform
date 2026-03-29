const express = require('express');
const router = express.Router();
const { getOrders, getOrderItems, cancelOrder } = require('../controllers/ordersController');
const authenticate = require('../middleware/authMiddleware');

router.get('/', authenticate, getOrders);
router.get('/:orderId/items', authenticate, getOrderItems);
router.delete('/:orderId', authenticate, cancelOrder);

module.exports = router;
