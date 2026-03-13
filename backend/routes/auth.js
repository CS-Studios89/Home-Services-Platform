const express = require('express');
const router = express.Router();
const { signup, login, logout, refresh } = require('../controllers/authController');
const authenticate = require('../middleware/authMiddleware');

router.post('/login', login);
router.post('/signup', signup);
router.post('/logout', authenticate,  logout); // check for valid JWT Token before execution
router.post('/refresh', authenticate,  refresh); // check for valid JWT Token before execution

module.exports = router;
