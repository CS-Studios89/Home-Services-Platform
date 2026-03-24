const express = require('express');
const router = express.Router();
const { getProviderDetails } = require('../controllers/providersController');

router.get('/:providerId', getProviderDetails);

module.exports = router;
