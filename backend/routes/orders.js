const express = require('express');
const router = express.Router();
const { getOrders, cancelOrder } = require('../controllers/ordersController');
const authenticate = require('../middleware/authMiddleware');

router.get('/', authenticate, getOrders);
router.delete('/:orderId', authenticate, cancelOrder);

module.exports = router;
