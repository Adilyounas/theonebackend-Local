const Order = require("../models/orderModels");
const Product = require("../models/productModel");

// *{<-------------Login user want to Creating Order ---------->}*
const newOrder = async (req, res) => {
  try {
    const {
      shippingInfo,
      orderItems,
      paymentInfo,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature_id,
    } = req.body;

    const order = await Order.create({
      shippingInfo,
      orderItems,
      paymentInfo,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      user: req.user._id,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature_id,
    });

    res.status(201).json({
      success: true,
      message: "Order Created Successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// *{<-------------Get single order---------->}*

const getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId).populate(
      "user",
      "name email"
    );
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order Not Found",
      });
    }
    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// *{<-------------Login user only want to see his own orders---------->}*

const myOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id });
    if (!orders) {
      return res.status(404).json({
        success: false,
        message: "Orders Not Found",
      });
    }
    res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//TODO *{<-------------Login admin want to see all order---------->}*

const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find();
    if (!orders) {
      return res.status(404).json({
        success: false,
        message: "Orders Not Found",
      });
    }

    let totalAmount = 0;

    orders.forEach((order) => {
      totalAmount += order.Total;
    });

    res.status(200).json({
      success: true,
      totalAmount,
      orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//TODO *{<-------------Login admin want to update order status---------->}*

const updateStock = async (id, quantity) => {
  const product = await Product.findById(id);
  if (!product) {
    return console.log("Product not found for updation");
  }
  product.stock -= quantity;
  await product.save({ validateBeforeSave: false });
};

const updateOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order Not Found with This Id",
      });
    }

    if (order.orderStatus === "Delivered") {
      return res.status(400).json({
        success: false,
        message: "Order is already delivered",
      });
    }

    if (req.body.orderStatus === "Shipped") {
      order.cartItems.forEach(async (item) => {
        await updateStock(item.product, item.quantity);
      });
    }
    if (req.body.orderStatus === "Delivered") {
      order.diliveredAt = Date.now();
    }

    order.orderStatus = req.body.orderStatus;
    await order.save({ validdateBeforeSave: false });

    res.status(200).json({
      success: true,
      message: "Order Updated Successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//TODO *{<-------------Login admin want to delete order ---------->}*
const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order Not Found with this Id",
      });
    }
    await order.deleteOne();
    res.status(200).json({
      success: true,
      message: "Order Deleted Successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// *{<-------------Exporting Functions---------->}*
module.exports = {
  newOrder,
  getOrder,
  myOrders,
  getAllOrders,
  updateOrder,
  deleteOrder,
};
