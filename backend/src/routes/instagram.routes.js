const express = require('express');
const router = express.Router();
const instagramController = require('../controllers/instagram.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { requireAdmin } = require('../middleware/role.middleware');

router.use(authenticate);

router.get('/accounts', instagramController.getAccounts);
router.get('/accounts/:id', instagramController.getAccountById);
router.post('/accounts', requireAdmin, instagramController.createAccount);
router.put('/accounts/:id', requireAdmin, instagramController.updateAccount);
router.delete('/accounts/:id', requireAdmin, instagramController.deleteAccount);
router.post('/sync', requireAdmin, instagramController.syncNow);

module.exports = router;

