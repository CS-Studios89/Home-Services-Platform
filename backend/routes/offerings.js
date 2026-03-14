const express = require('express');
const router = express.Router();
const { getOfferings, 
    getOfferingsWithFilters } = require('../controllers/offeringsController');
const authenticate = require('../middleware/authMiddleware');

router.get('/', getOfferings);
router.post('/', getOfferingsWithFilters); // post for receiving filters

module.exports = router;
