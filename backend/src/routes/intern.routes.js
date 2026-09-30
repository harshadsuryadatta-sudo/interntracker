const express = require('express');
const router = express.Router();
const internController = require('../controllers/intern.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { requireAdmin } = require('../middleware/role.middleware');

// All intern management routes are restricted to Admin
router.use(authenticate, requireAdmin);

router.get('/', internController.getInterns);
router.post('/', internController.createIntern);
router.get('/:id', internController.getInternById);
router.put('/:id', internController.updateIntern);
router.delete('/:id', internController.deleteIntern);
router.post('/:id/reset-password', internController.resetPassword);

module.exports = router;
