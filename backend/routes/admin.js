const express = require('express');
const router = express.Router();

const authenticate = require('../middleware/authMiddleware');
const requireAdmin = require('../middleware/requireAdmin');
const adminController = require('../controllers/adminController');

router.use(authenticate);
router.use(requireAdmin);  

// Users
router.get('/users', adminController.listUsers);
router.patch('/users/:userId/status', adminController.updateUserStatus);

// Providers
router.get('/providers', adminController.listProviders);
router.patch('/providers/:providerId/approval', adminController.setProviderApproval);
router.post('/providers/:providerId/disable', adminController.disableProvider);

// Services / service categories (same `services` table; offerings use service_id)
router.get('/services', adminController.listServices);
router.post('/services', adminController.createService);
router.patch('/services/:serviceId', adminController.updateService);
router.delete('/services/:serviceId', adminController.deleteService);


// Audit log
router.get('/audit', adminController.listAudit);

module.exports = router;

