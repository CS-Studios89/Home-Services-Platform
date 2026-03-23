const express = require('express');
const router = express.Router();
const { getProfileInfo, updateProfileInfo } = require('../controllers/profileController');
const authenticate = require('../middleware/authMiddleware');

router.get('/', authenticate, getProfileInfo);
router.patch('/', authenticate, updateProfileInfo);

module.exports = router;
