const express = require('express');
const router = express.Router();
const { getProviderDetails, createBusyTimeSlot, deleteBusyTimeSlot } = require('../controllers/providersController');
const authenticate = require('../middleware/authMiddleware');

router.post('/me/busy-slots', authenticate, createBusyTimeSlot);
router.delete('/me/busy-slots/:slotId', authenticate, deleteBusyTimeSlot);

router.get('/:providerId', getProviderDetails);

module.exports = router;
