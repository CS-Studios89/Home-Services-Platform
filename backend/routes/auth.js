const express = require('express');
const router = express.Router();
const { signup, login } = require('../controllers/authController');
const authenticate = require('../middleware/authMiddleware');

router.post('/login', login);
router.post('/signup', signup);

module.exports = router;
