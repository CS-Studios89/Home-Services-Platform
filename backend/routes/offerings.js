const express = require('express');
const router = express.Router();
const { getOfferings, 
    getOfferingsWithFilters,
    getProviderOffers, 
    createProviderOffer, 
    editProviderOffer, 
    deleteProviderOffer,
    getOfferingAvailableTime } = require('../controllers/offeringsController');
const authenticate = require('../middleware/authMiddleware');

router.get('/', getOfferings);
router.post('/', getOfferingsWithFilters); // post for receiving filters
router.get('/available-time/:offeringId', getOfferingAvailableTime);

router.get('/me', authenticate,  getProviderOffers);
router.post('/me', authenticate,  createProviderOffer);
router.patch('/:offeringId', authenticate,  editProviderOffer);
router.delete('/:offeringId', authenticate, deleteProviderOffer);

module.exports = router;
