import * as paymentService from '../services/paymentService.js';
import asyncHandler from '../middlewares/asyncHandler.js';
import ProductAnalytics from '../models/ProductAnalytics.js';
import Order from '../models/Order.js';

/**
 * Payment Controller
 * Handle Razorpay payment operations
 */

/**
 * @desc    Create Razorpay order
 * @route   POST /api/payments/create-order
 * @access  Private (Customer)
 */
export const createOrder = asyncHandler(async (req, res) => {
    const { orderId } = req.body;

    if (!orderId) {
        return res.status(400).json({
            success: false,
            error: 'Order ID is required',
        });
    }

    const order = await Order.findById(orderId);
    if (!order) {
        return res.status(404).json({ success: false, error: 'Order not found' });
    }

    // Ensure order belongs to caller or caller is admin
    if (order.customerId.toString() !== req.user.userId && req.user.role !== 'admin') {
        return res.status(403).json({ success: false, error: 'Unauthorized access to this order' });
    }

    if (order.paymentStatus === 'paid') {
        return res.status(400).json({ success: false, error: 'Order is already paid' });
    }

    // Take amount strictly from server order (prevent client tampering)
    const amount = order.totalAmount;
    const razorpayOrder = await paymentService.createRazorpayOrder(amount, orderId);

    // Store razorpayOrderId on the order
    order.payment = {
        ...order.payment,
        razorpayOrderId: razorpayOrder.id,
    };
    await order.save();

    res.status(200).json({
        success: true,
        data: {
            orderId: razorpayOrder.id,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
            keyId: process.env.RAZORPAY_KEY_ID,
        },
        message: 'Razorpay order created successfully',
    });
});

/**
 * @desc    Verify payment
 * @route   POST /api/payments/verify
 * @access  Private (Customer)
 */
export const verifyPayment = asyncHandler(async (req, res) => {
    const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    if (!orderId || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
        return res.status(400).json({
            success: false,
            error: 'Missing payment verification data',
        });
    }

    const order = await Order.findById(orderId);
    if (!order) {
        return res.status(404).json({ success: false, error: 'Order not found' });
    }

    // Verify caller ownership
    if (order.customerId.toString() !== req.user.userId && req.user.role !== 'admin') {
        return res.status(403).json({ success: false, error: 'Unauthorized to verify this order' });
    }

    // Verify razorpayOrderId matches what was stored on the order
    if (order.payment?.razorpayOrderId && order.payment.razorpayOrderId !== razorpayOrderId) {
        return res.status(400).json({ success: false, error: 'Razorpay order ID mismatch' });
    }

    const updatedOrder = await paymentService.processSuccessfulPayment(orderId, {
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
    });

    // Track purchase analytics for each item (fire-and-forget)
    if (updatedOrder?.items) {
        for (const item of updatedOrder.items) {
            ProductAnalytics.recordPurchase(
                item.productId,
                item.quantity,
                item.price * item.quantity
            ).catch(() => {});
        }
    }

    res.status(200).json({
        success: true,
        data: updatedOrder,
        message: 'Payment verified successfully',
    });
});

/**
 * @desc    Handle payment failure
 * @route   POST /api/payments/failed
 * @access  Private (Customer)
 */
export const paymentFailed = asyncHandler(async (req, res) => {
    const { orderId } = req.body;

    if (!orderId) {
        return res.status(400).json({
            success: false,
            error: 'Order ID is required',
        });
    }

    const order = await paymentService.processFailedPayment(orderId);

    res.status(200).json({
        success: true,
        data: order,
        message: 'Payment failure recorded',
    });
});

/**
 * @desc    Get payment details
 * @route   GET /api/payments/:paymentId
 * @access  Private
 */
export const getPaymentDetails = asyncHandler(async (req, res) => {
    const { paymentId } = req.params;

    const payment = await paymentService.getPaymentDetails(paymentId);
    if (!payment) {
        return res.status(404).json({ success: false, error: 'Payment details not found' });
    }

    res.status(200).json({
        success: true,
        data: payment,
        message: 'Payment details retrieved successfully',
    });
});
