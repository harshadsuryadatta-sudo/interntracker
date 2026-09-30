const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendance.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { requireAdmin } = require('../middleware/role.middleware');

router.use(authenticate);

router.get('/today', attendanceController.getToday);
router.post('/check-in', attendanceController.checkIn);
router.post('/check-out', attendanceController.checkOut);
router.get('/', attendanceController.getAttendance);
router.put('/:id', requireAdmin, attendanceController.updateAttendanceRecord);

module.exports = router;
