const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Enter Product Name"],
    trim: true,
  },
  price: {
    type: Number,
    required: [true, "Enter Product Price"],
    maxLength: [8, "Price can't exceed 8 Figure Number"],
  },
  description: {
    type: String,
    required: [true, "Enter Product Description"],
  },
  category: {
    type: String,
    required: [true, "Enter Product Category"],
  },
  ratings: {
    type: Number,
    default: 0,
  },
  likes: {
    type: Number,
    default: 0,
  },
  userLikes: [
    {
      user: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: [true, "Enter Id Of User For like"],
      },
     
      productId: {
        type: mongoose.Schema.ObjectId,
        ref: "Product",
        required: [true, "Enter Id Of Product For like"],
      },
      like: {
        type: Boolean,
        default: false,
        required: [true, "Like or dislike From Frontend Is not clear"],
      },
    },
  ],

  stock: {
    type: Number,
    required: [true, "Enter Product Stock"],
    maxLength: [4, "Stock limit must be under 4 characters"],
  },
  numOfReview: {
    type: Number,
    default: 0,
  },
  reviews: [
    {
      user: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: [true, "Enter Id Of User"],
      },
      image: {
        type: String,
        required: true,
      },
      name: {
        type: String,
        required: [true, "Enter Product Name"],
      },
      rating: {
        type: Number,
        required: [true, "Enter Product Rating"],
      },
      comment: {
        type: String,
        required: [true, "Enter Product Comment"],
      },
    },
  ],

  images: [
    {
      public_id: {
        type: String,
        required: [true, "Enter Product Image public_id"],
      },
      url: {
        type: String,
        required: [true, "Enter Product Image URL"],
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  createdBy: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
});

module.exports = new mongoose.model("Product", productSchema);
