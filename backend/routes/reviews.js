const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authMiddleware');

const {
  createReview,
  getReviewByBookingId,
  listReviewsForProvider,
  listReviewsForOffering
} = require('../controllers/reviewsController');

// Public reads
router.get('/provider/:providerId', listReviewsForProvider);
router.get('/offering/:offeringId', listReviewsForOffering);
router.get('/booking/:bookingId', getReviewByBookingId);

// Auth write
router.post('/', authenticate, createReview);

module.exports = router;

