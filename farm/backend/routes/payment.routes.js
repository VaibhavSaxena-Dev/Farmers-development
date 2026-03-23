const express = require('express');
const router = express.Router();
const {
  createPaymentOrder,
  verifyPayment,
  getPaymentHistory,
  getSubscription,
  cancelSubscription
} = require('../controllers/payment.controller');
const { auth } = require('../middleware/auth');

// All payment routes require authentication
router.use(auth);

// Create payment order
router.post('/create-order', createPaymentOrder);

// Verify payment
router.post('/verify', verifyPayment);

// Get payment history
router.get('/history', getPaymentHistory);

// Get subscription details
router.get('/subscription', getSubscription);

// Cancel subscription
router.post('/subscription/cancel', cancelSubscription);

module.exports = router;
