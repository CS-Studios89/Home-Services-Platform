const express = require('express');
const router = express.Router();
const { getPayments } = require('../controllers/paymentsController');
const authenticate = require('../middleware/authMiddleware');

router.get('/', authenticate, getPayments);

module.exports = router;
