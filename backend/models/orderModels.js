const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
  subTotal: {
    type: Number,
    required: true,
  },
  tax: {
    type: Number,
    required: true,
  },
  shippingTax: {
    type: Number,
    required: true,
  },
  Total: {
    type: Number,
    required: true,
  },
  razorpay_order_id: {
    type: String,
    required: true,
  },

  razorpay_payment_id: {
    type: String,
    required: true,
  },

  razorpay_signature_id: {
    type: String,
    required: true,
  },

  orderStatus: {
    type: String,
    default:"Processing",
    required: true,
  },

  shippingInfo: {
    address: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    pinCode: {
      type: Number,
      required: true,
    },
    phone: {
      type: Number,
      required: true,
    },
  },

  cartItems: [
    {
    product: {
        type: mongoose.Schema.ObjectId,
        ref: "Product",
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      price: {
        type: Number,
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
      },
      image: {
        type: String,
        required: true,
      },
    },
  ],

  createdAt: {
    type: Date,
    default: Date.now,
  },
  paidAt:Date,
    
  diliveredAt:Date,
});

module.exports = new mongoose.model("Order", orderSchema);
