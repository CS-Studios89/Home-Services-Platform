const express = require('express');
const router = express.Router();
const { getOrders } = require('../controllers/ordersController');
const authenticate = require('../middleware/authMiddleware');

router.get('/', authenticate, getOrders);
// router.post('/', getOfferingsWithFilters); // post for receiving filters
// router.get('/available-time/:offeringId', getOfferingAvailableTime);

// router.get('/me', authenticate,  getProviderOffers);
// router.post('/me', authenticate,  createProviderOffer);
// router.patch('/:offeringId', authenticate,  editProviderOffer);
// router.delete('/:offeringId', authenticate, deleteProviderOffer);

module.exports = router;
