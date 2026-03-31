const express = require('express');
const router = express.Router();
const { getPayments, makePayment } = require('../controllers/paymentsController');
const authenticate = require('../middleware/authMiddleware');

router.get('/', authenticate, getPayments);
router.post('/', authenticate, makePayment);

module.exports = router;
