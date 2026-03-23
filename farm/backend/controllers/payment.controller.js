const Payment = require('../models/payment.model');
const Subscription = require('../models/subscription.model');
const User = require('../models/user.model');
const crypto = require('crypto');

// Generate order ID
const generateOrderId = () => {
  return `FARM_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Create payment order
const createPaymentOrder = async (req, res) => {
  try {
    const { items, subscription, paymentMethod, paymentProvider } = req.body;
    const userId = req.user.id;

    // Calculate total amount
    const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // Create payment order
    const paymentOrder = new Payment({
      userId,
      orderId: generateOrderId(),
      amount: totalAmount,
      paymentMethod,
      paymentProvider,
      description: `Farm Management Portal - ${items.map(item => item.name).join(', ')}`,
      items,
      subscription,
      metadata: {
        farmId: req.body.farmId,
        location: req.body.location,
        farmerType: req.body.farmerType,
        deviceInfo: req.headers['user-agent']
      }
    });

    await paymentOrder.save();

    // Generate payment gateway specific data
    let gatewayData = {};
    
    if (paymentProvider === 'razorpay') {
      gatewayData = await generateRazorpayOrder(paymentOrder);
    } else if (paymentProvider === 'payu') {
      gatewayData = await generatePayuOrder(paymentOrder);
    } else if (paymentProvider === 'paytm') {
      gatewayData = await generatePaytmOrder(paymentOrder);
    }

    res.status(201).json({
      success: true,
      order: paymentOrder,
      gatewayData
    });

  } catch (error) {
    console.error('Error creating payment order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create payment order',
      error: error.message
    });
  }
};

// Generate Razorpay order
const generateRazorpayOrder = async (paymentOrder) => {
  const Razorpay = require('razorpay');
  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
  });

  const options = {
    amount: paymentOrder.amount * 100, // Convert to paise
    currency: paymentOrder.currency,
    receipt: paymentOrder.orderId,
    notes: {
      userId: paymentOrder.userId.toString(),
      description: paymentOrder.description
    }
  };

  try {
    const order = await razorpay.orders.create(options);
    return {
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID
    };
  } catch (error) {
    throw new Error('Failed to create Razorpay order');
  }
};

// Generate PayU order
const generatePayuOrder = async (paymentOrder) => {
  const crypto = require('crypto');
  const merchantKey = process.env.PAYU_MERCHANT_KEY;
  const merchantSalt = process.env.PAYU_MERCHANT_SALT;
  
  const hashString = `${merchantKey}|${paymentOrder.orderId}|${paymentOrder.amount}|${paymentOrder.description}|${paymentOrder.userId}|${merchantSalt}`;
  const hash = crypto.createHash('sha512').update(hashString).digest('hex');

  return {
    merchantKey,
    orderId: paymentOrder.orderId,
    amount: paymentOrder.amount,
    productInfo: paymentOrder.description,
    firstName: 'Farmer',
    email: 'farmer@example.com',
    hash,
    surl: `${process.env.CLIENT_ORIGIN}/payment/success`,
    furl: `${process.env.CLIENT_ORIGIN}/payment/failure`
  };
};

// Generate Paytm order
const generatePaytmOrder = async (paymentOrder) => {
  const PaytmChecksum = require('paytmchecksum');
  const merchantId = process.env.PAYTM_MERCHANT_ID;
  const merchantKey = process.env.PAYTM_MERCHANT_KEY;

  const paytmParams = {
    MID: merchantId,
    ORDER_ID: paymentOrder.orderId,
    CUST_ID: paymentOrder.userId.toString(),
    INDUSTRY_TYPE_ID: 'Retail',
    CHANNEL_ID: 'WEB',
    TXN_AMOUNT: paymentOrder.amount.toString(),
    WEBSITE: 'DEFAULT',
    CALLBACK_URL: `${process.env.CLIENT_ORIGIN}/payment/callback`
  };

  const checksum = await PaytmChecksum.generateSignature(paytmParams, merchantKey);

  return {
    ...paytmParams,
    CHECKSUMHASH: checksum
  };
};

// Verify payment
const verifyPayment = async (req, res) => {
  try {
    const { orderId, paymentId, signature, paymentProvider } = req.body;
    const userId = req.user.id;

    const payment = await Payment.findOne({ orderId, userId });
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment order not found'
      });
    }

    let isValid = false;

    if (paymentProvider === 'razorpay') {
      isValid = await verifyRazorpayPayment(payment, paymentId, signature);
    } else if (paymentProvider === 'payu') {
      isValid = await verifyPayuPayment(payment, req.body);
    } else if (paymentProvider === 'paytm') {
      isValid = await verifyPaytmPayment(payment, req.body);
    }

    if (isValid) {
      // Update payment status
      payment.status = 'completed';
      payment.paymentId = paymentId;
      payment.signature = signature;
      payment.completedAt = new Date();
      await payment.save();

      // Create subscription if applicable
      if (payment.subscription) {
        await createSubscription(payment);
      }

      res.json({
        success: true,
        message: 'Payment verified successfully',
        payment
      });
    } else {
      payment.status = 'failed';
      await payment.save();

      res.status(400).json({
        success: false,
        message: 'Payment verification failed'
      });
    }

  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({
      success: false,
      message: 'Payment verification failed',
      error: error.message
    });
  }
};

// Verify Razorpay payment
const verifyRazorpayPayment = async (payment, paymentId, signature) => {
  const crypto = require('crypto');
  const razorpaySecret = process.env.RAZORPAY_KEY_SECRET;
  
  const body = paymentId + '|' + payment.orderId;
  const expectedSignature = crypto
    .createHmac('sha256', razorpaySecret)
    .update(body)
    .digest('hex');

  return expectedSignature === signature;
};

// Verify PayU payment
const verifyPayuPayment = async (payment, paymentData) => {
  const crypto = require('crypto');
  const merchantSalt = process.env.PAYU_MERCHANT_SALT;
  
  const hashString = `${merchantSalt}|${paymentData.status}|||||||||||${paymentData.email}|${paymentData.firstname}|${paymentData.productinfo}|${paymentData.amount}|${paymentData.txnid}|${paymentData.key}`;
  const hash = crypto.createHash('sha512').update(hashString).digest('hex');

  return hash === paymentData.hash && paymentData.status === 'success';
};

// Verify Paytm payment
const verifyPaytmPayment = async (payment, paymentData) => {
  const PaytmChecksum = require('paytmchecksum');
  const merchantKey = process.env.PAYTM_MERCHANT_KEY;

  try {
    const isValid = await PaytmChecksum.verifySignature(paymentData, merchantKey, paymentData.CHECKSUMHASH);
    return isValid && paymentData.STATUS === 'TXN_SUCCESS';
  } catch (error) {
    return false;
  }
};

// Create subscription
const createSubscription = async (payment) => {
  try {
    const subscription = new Subscription({
      userId: payment.userId,
      planId: payment.subscription.planId,
      planName: payment.subscription.planName,
      duration: payment.subscription.duration,
      price: payment.amount,
      startDate: payment.subscription.startDate || new Date(),
      endDate: payment.subscription.endDate,
      autoRenew: payment.subscription.autoRenew || false,
      paymentMethod: payment.paymentMethod,
      features: getPlanFeatures(payment.subscription.planName)
    });

    await subscription.save();
    return subscription;
  } catch (error) {
    console.error('Error creating subscription:', error);
    throw error;
  }
};

// Get plan features
const getPlanFeatures = (planName) => {
  const features = {
    basic: [
      { name: 'basic_disease_info', limit: 10 },
      { name: 'hygiene_assessment', limit: 5 },
      { name: 'basic_notifications', limit: 50 }
    ],
    premium: [
      { name: 'advanced_disease_info', limit: -1 },
      { name: 'hygiene_assessment', limit: -1 },
      { name: 'voice_notifications', limit: -1 },
      { name: 'expert_consultation', limit: 2 },
      { name: 'marketplace_access', limit: -1 }
    ],
    enterprise: [
      { name: 'all_premium_features', limit: -1 },
      { name: 'unlimited_consultations', limit: -1 },
      { name: 'priority_support', limit: -1 },
      { name: 'custom_reports', limit: -1 },
      { name: 'api_access', limit: -1 }
    ],
    veterinary_pro: [
      { name: 'veterinary_dashboard', limit: -1 },
      { name: 'patient_management', limit: -1 },
      { name: 'prescription_tracking', limit: -1 },
      { name: 'client_communication', limit: -1 }
    ]
  };

  return features[planName] || features.basic;
};

// Get payment history
const getPaymentHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, status } = req.query;

    const query = { userId };
    if (status) {
      query.status = status;
    }

    const payments = await Payment.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('userId', 'name email');

    const total = await Payment.countDocuments(query);

    res.json({
      success: true,
      payments,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });

  } catch (error) {
    console.error('Error fetching payment history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment history',
      error: error.message
    });
  }
};

// Get subscription details
const getSubscription = async (req, res) => {
  try {
    const userId = req.user.id;

    const subscription = await Subscription.findOne({ userId, status: 'active' })
      .sort({ createdAt: -1 });

    if (!subscription) {
      return res.json({
        success: true,
        subscription: null,
        message: 'No active subscription found'
      });
    }

    res.json({
      success: true,
      subscription
    });

  } catch (error) {
    console.error('Error fetching subscription:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subscription',
      error: error.message
    });
  }
};

// Cancel subscription
const cancelSubscription = async (req, res) => {
  try {
    const userId = req.user.id;
    const { reason } = req.body;

    const subscription = await Subscription.findOne({ userId, status: 'active' });
    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'No active subscription found'
      });
    }

    subscription.status = 'cancelled';
    subscription.cancellation = {
      cancelledAt: new Date(),
      reason: reason || 'User requested cancellation'
    };

    await subscription.save();

    res.json({
      success: true,
      message: 'Subscription cancelled successfully',
      subscription
    });

  } catch (error) {
    console.error('Error cancelling subscription:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel subscription',
      error: error.message
    });
  }
};

module.exports = {
  createPaymentOrder,
  verifyPayment,
  getPaymentHistory,
  getSubscription,
  cancelSubscription
};
