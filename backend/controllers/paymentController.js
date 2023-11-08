const Razorpay = require("razorpay");
const crypto = require("crypto");
const Order = require("../models/orderModels");
var instance = new Razorpay({
  key_id: "rzp_test_x3Xr1v6xOxFVbM",
  key_secret: "v32QzPGuz91pIaxo5kPFwWz2",
});

// const instance = require("../server.js")

//it is like make things ready
const processPayment = async (req, res) => {
  try {
    const options = {
      amount: req.body.amount, // amount in the smallest currency unit
      currency: "PKR",
    };

    const order = await instance.orders.create(options);

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error,
    });
  }
};

//sending key
const sendAPiKEY = async (req, res) => {
  res.status(200).json({
    success: true,
    API_KEY: "rzp_test_x3Xr1v6xOxFVbM",
    RAZORPAY_SECRET_KEY: "v32QzPGuz91pIaxo5kPFwWz2",
  });
};

const paymentVerification = async (req, res) => {
  try {
    const {
      orderSummary,
      shippingInfo,
      cartItems,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      user,
    } = await req.body;

    const order = await Order.create({
      user: user._id, //done
      razorpay_order_id: razorpay_order_id,
      razorpay_payment_id: razorpay_payment_id,
      razorpay_signature_id: razorpay_signature,

      subTotal: orderSummary.subTotal,
      tax: orderSummary.tax,
      shippingTax: orderSummary.shippingTax,
      Total: orderSummary.Total,
      shippingInfo,
      cartItems,

      paidAt: Date.now(), //done
    });

    res.status(201).json({
      success: true,
      message:razorpay_order_id,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};




module.exports = {
  processPayment,
  paymentVerification,
  sendAPiKEY,
};
