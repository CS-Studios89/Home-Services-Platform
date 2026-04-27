const express = require('express');
const router = express.Router();
const { getBookings, 
    cancelBooking, 
    getBookingRequests, 
    acceptBooking, 
    rejectBooking,
    getProviderBookings } = require('../controllers/bookingsController');
const authenticate = require('../middleware/authMiddleware');

router.get('/', authenticate, getBookings); // for user
router.delete('/:bookingId', authenticate, cancelBooking);
router.get('/pending', authenticate, getBookingRequests); // provider receive booking request ( get all booking requests)
router.get('/provider', authenticate, getProviderBookings); // provider get all bookings (pending, accepted, rejected)
router.get('/:bookingId/accept', authenticate, acceptBooking); // provider accept booking
router.delete('/:bookingId/reject', authenticate, rejectBooking); // provider reject booking

module.exports = router;
