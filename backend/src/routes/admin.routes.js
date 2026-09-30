const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { requireAdmin } = require('../middleware/role.middleware');

router.use(authenticate, requireAdmin);

router.get('/dashboard', adminController.getDashboardStats);
router.get('/analytics', adminController.getAnalytics);
router.get('/audit-logs', adminController.getAuditLogs);

module.exports = router;
