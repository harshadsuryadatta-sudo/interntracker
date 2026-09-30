const express = require('express');
const router = express.Router();
const exportController = require('../controllers/export.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { requireAdmin } = require('../middleware/role.middleware');

router.use(authenticate, requireAdmin);

router.get('/reports', exportController.exportReports);

module.exports = router;
