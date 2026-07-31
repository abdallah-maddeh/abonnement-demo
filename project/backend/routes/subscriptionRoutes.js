const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscriptionController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.use(authenticateToken);
router.get('/', subscriptionController.getSubscriptions);
router.get('/options/lines', subscriptionController.getSubscriptionLines);
router.get('/options/types', subscriptionController.getSubscriptionTypes);
router.get('/options/price', subscriptionController.getSubscriptionPrice);
router.get('/:id', subscriptionController.getSubscriptionById);
router.post('/', subscriptionController.createSubscription);
router.put('/:id', subscriptionController.updateSubscription);
router.put('/:id/validate', subscriptionController.validateSubscription);
router.put('/:id/refuse', subscriptionController.refuseSubscription);
router.delete('/:id', subscriptionController.deleteSubscription);

module.exports = router;
