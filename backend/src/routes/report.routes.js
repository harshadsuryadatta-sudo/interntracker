const express = require('express');
const router = express.Router();
const reportController = require('../controllers/report.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.use(authenticate);

router.get('/', reportController.getReports);
router.get('/calendar', reportController.getCalendar);
router.get('/:id', reportController.getReportById);
router.post('/', reportController.saveReport);
router.put('/:id', reportController.updateReport);
router.delete('/:id', reportController.deleteReport);

module.exports = router;
