const express = require('express');
const router = express.Router();
const { getOfferings } = require('../controllers/offeringsController');
const authenticate = require('../middleware/authMiddleware');

router.get('/', getOfferings);

module.exports = router;
