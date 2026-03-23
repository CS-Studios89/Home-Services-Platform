const express = require('express');
const router = express.Router();
const { getProfileInfo } = require('../controllers/profileController');
const authenticate = require('../middleware/authMiddleware');

router.get('/', authenticate, getProfileInfo);

module.exports = router;
