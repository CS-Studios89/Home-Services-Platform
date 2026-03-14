const express = require('express');
const router = express.Router();
const { getServices } = require('../controllers/servicesController');

router.get('/', getServices);

module.exports = router;
