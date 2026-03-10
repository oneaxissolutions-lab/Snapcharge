const express = require("express");
const crypto = require("crypto");
const Razorpay = require("razorpay");
const Order = require("../models/Order");

const router = express.Router();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/* ================= DEBUG ROUTE ================= */

router.get("/debug-check", (req, res) => {
  return res.json({
    success: true,
    razorpayKeyIdPresent: !!process.env.RAZORPAY_KEY_ID,
    razorpayKeySecretPresent: !!process.env.RAZORPAY_KEY_SECRET,
    mongoUriPresent: !!process.env.MONGO_URI,
    jwtSecretPresent: !!process.env.JWT_SECRET,
    razorpayKeyIdPreview: process.env.RAZORPAY_KEY_ID
      ? process.env.RAZORPAY_KEY_ID.slice(0, 10)
      : null,
  });
});

/* ================= VALIDATION FUNCTIONS ================= */

const isValidIndianPhone = (phone) => {
  return /^[6-9]\d{9}$/.test(String(phone).trim());
};

const isValidPincode = (pincode) => {
  return /^\d{6}$/.test(String(pincode).trim());
};

/* ================= ONLINE PAYMENT ORDER ================= */

router.post("/create-order", async (req, res) => {
  try {
    const {
      userId,
      customerName,
      phone,
      address,
      city,
      state,
      pincode,
      productName,
      productId,
      productImage,
      variant,
      quantity,
      amount,
    } = req.body;

    console.log("===== CREATE ORDER REQUEST START =====");
    console.log("CREATE ORDER BODY:", req.body);
    console.log("ENV CHECK:", {
      razorpayKeyIdPresent: !!process.env.RAZORPAY_KEY_ID,
      razorpayKeySecretPresent: !!process.env.RAZORPAY_KEY_SECRET,
      mongoUriPresent: !!process.env.MONGO_URI,
      jwtSecretPresent: !!process.env.JWT_SECRET,
    });

    if (!customerName || !phone || !address || !productName || !amount) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    if (!isValidIndianPhone(phone)) {
      return res.status(400).json({
        success: false,
        message: "Only valid Indian phone numbers are allowed",
      });
    }

    if (!isValidPincode(pincode)) {
      return res.status(400).json({
        success: false,
        message: "We currently deliver only within India (invalid pincode)",
      });
    }

    const finalAmount = Number(amount) * 100;

    console.log("RAW AMOUNT:", amount);
    console.log("FINAL RAZORPAY AMOUNT:", finalAmount);

    if (!finalAmount || Number.isNaN(finalAmount) || finalAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment amount",
      });
    }

    const options = {
      amount: finalAmount,
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
    };

    console.log("RAZORPAY OPTIONS:", options);

    const razorpayOrder = await razorpay.orders.create(options);

    console.log("RAZORPAY ORDER CREATED:", razorpayOrder);

    const order = await Order.create({
      userId: userId || null,
      customerName,
      phone,
      address,
      city,
      state,
      pincode,
      productName,
      productId,
      productImage: productImage || "",
      variant,
      quantity: quantity || 1,
      amount,
      razorpayOrderId: razorpayOrder.id,
      paymentStatus: "created",
      paymentMethod: "ONLINE",
      orderStatus: "Pending",
    });

    console.log("ORDER SAVED IN DB:", order._id);
    console.log("===== CREATE ORDER REQUEST SUCCESS =====");

    return res.status(201).json({
      success: true,
      key: process.env.RAZORPAY_KEY_ID,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      razorpayOrderId: razorpayOrder.id,
      dbOrderId: order._id,
    });
  } catch (error) {
    console.log("===== CREATE ORDER REQUEST FAILED =====");
    console.log("ONLINE ORDER CREATE ERROR:", error);
    console.log("ONLINE ORDER CREATE ERROR MESSAGE:", error.message);
    console.log("ONLINE ORDER CREATE ERROR STATUS:", error.statusCode || null);
    console.log(
      "ONLINE ORDER CREATE ERROR DESCRIPTION:",
      error.description || null
    );

    return res.status(500).json({
      success: false,
      message: "Failed to create payment order",
      error: error.message,
    });
  }
});

/* ================= COD ORDER ================= */

router.post("/create-cod-order", async (req, res) => {
  try {
    console.log("===== COD ORDER REQUEST START =====");
    console.log("COD route hit:", req.body);

    const {
      userId,
      customerName,
      phone,
      address,
      city,
      state,
      pincode,
      productName,
      productId,
      productImage,
      variant,
      quantity,
      amount,
    } = req.body;

    if (!customerName || !phone || !address || !productName || !amount) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    if (!isValidIndianPhone(phone)) {
      return res.status(400).json({
        success: false,
        message: "Only Indian phone numbers allowed",
      });
    }

    if (!isValidPincode(pincode)) {
      return res.status(400).json({
        success: false,
        message: "We deliver only within India",
      });
    }

    const order = await Order.create({
      userId: userId || null,
      customerName,
      phone,
      address,
      city,
      state,
      pincode,
      productName,
      productId,
      productImage: productImage || "",
      variant,
      quantity: quantity || 1,
      amount,
      paymentStatus: "created",
      paymentMethod: "COD",
      orderStatus: "Pending",
    });

    console.log("COD ORDER SAVED:", order._id);
    console.log("===== COD ORDER REQUEST SUCCESS =====");

    return res.status(201).json({
      success: true,
      message: "COD order placed successfully",
      order,
    });
  } catch (error) {
    console.log("===== COD ORDER REQUEST FAILED =====");
    console.log("COD backend error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create COD order",
      error: error.message,
    });
  }
});

/* ================= VERIFY PAYMENT ================= */

router.post("/verify-payment", async (req, res) => {
  try {
    const {
      dbOrderId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    console.log("===== VERIFY PAYMENT START =====");
    console.log("VERIFY PAYMENT BODY:", req.body);

    const body = `${razorpay_order_id}|${razorpay_payment_id}`;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;

    console.log("PAYMENT SIGNATURE MATCH:", isAuthentic);

    if (!isAuthentic) {
      return res.status(400).json({
        success: false,
        message: "Payment verification failed",
      });
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      dbOrderId,
      {
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        paymentStatus: "paid",
        paymentMethod: "ONLINE",
        orderStatus: "Confirmed",
      },
      { new: true }
    );

    console.log("PAYMENT VERIFIED ORDER:", updatedOrder?._id);
    console.log("===== VERIFY PAYMENT SUCCESS =====");

    return res.status(200).json({
      success: true,
      message: "Payment verified successfully",
      order: updatedOrder,
    });
  } catch (error) {
    console.log("===== VERIFY PAYMENT FAILED =====");
    console.log("VERIFY PAYMENT ERROR:", error);
    console.log("VERIFY PAYMENT ERROR MESSAGE:", error.message);

    return res.status(500).json({
      success: false,
      message: "Verification failed",
      error: error.message,
    });
  }
});

module.exports = router;