const express = require('express');

const router = express.Router();



const {

    getProviderDetails,

    createBusyTimeSlot,

    deleteBusyTimeSlot,

    getManualBusySlots  

} = require('../controllers/providersController');



const authenticate = require('../middleware/authMiddleware');





// Provider Availability



// Create manual busy slot

router.post('/me/busy-slots', authenticate, createBusyTimeSlot);



// Delete manual busy slot

router.delete('/me/busy-slots/:slotId', authenticate, deleteBusyTimeSlot);



// 🔥 NEW: List manual busy slots

router.get('/me/busy-slots/manual', authenticate, getManualBusySlots);





// Provider Info





router.get('/:providerId', getProviderDetails);



module.exports = router;

