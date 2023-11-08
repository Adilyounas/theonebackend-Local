const Product = require("../models/productModel");
const ApiFeatures = require("../utils/apiFeatures");
const cloudinary = require("cloudinary");

//TODO *{<-------------Create a new product --admin ---------->}*
const createProduct = async (req, res) => {
  try {
    let images = [];

    if (typeof req.body.images === "string") {
      //if we received single image
      images.push(req.body.images);
    } else {
      //If we are recieving multiple images
      images = req.body.images;
    }

    const imagesLik = [];

    //sending individual image to cloudinary and after getting the proper url we push url into imagesLink

    for (let i = 0; i < images.length; i++) {
      const result = await cloudinary.v2.uploader.upload(images[i], {
        folder: "Products",
        resource_type: "auto",
        format: "avif",
      });

      imagesLik.push({
        public_id: result.public_id,
        url: result.secure_url,
      });
    }

    // now important is that you can change the req.body
    req.body.images = imagesLik;

    req.body.createdBy = req.user._id;
    const product = await Product.create(req.body);

    res.status(201).json({
      success: true,
      message: "Product created successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// *{<-------------get all prouducts with filters for --Users---------->}*

const getAllProducts = async (req, res) => {
  try {
    const resultPerPage = 6;
    const totalProductsCount = await Product.countDocuments();
    const apiFeatures = new ApiFeatures(Product.find(), req.query)
      .search()
      .filter()
      .pagination(resultPerPage);
    const product = await apiFeatures.query;

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      totalProductsCount,
      filtered: product.length,
      resultPerPage,
      product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// *{<-------------get all prouducts---------->}*

const getAllProducts_Admin = async (req, res) => {
  try {
    const products = await Product.find();

    if (!products) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,

      products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// *{<-------------get Single prouduct---------->}*

const getSingleProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "No product found with this id",
      });
    }

    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(500).json({
        success: false,
        message: "Invalid MongoDB ID",
      });
    }
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//TODO *{<-------------update a product --admin ---------->}*

const updateProduct = async (req, res) => {
  try {
    let product = await Product.findById(req.params.productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "No product found with this Id",
      });
    }

    //images updation start form here
    let images = [];
    if (typeof req.body.images === "string") {
      images.push(req.body.images);
    } else {
      images = req.body.images;
    }

    if (images !== undefined) {
      for (let i = 0; i < product.images.length; i++) {
        await cloudinary.v2.uploader.destroy(product.images[i].public_id);
      }

      const imagesLik = [];

      for (let i = 0; i < images.length; i++) {
        const result = await cloudinary.v2.uploader.upload(images[i], {
          folder: "Products",
        });

        imagesLik.push({
          public_id: result.public_id,
          url: result.secure_url,
        });
      }

      req.body.images = imagesLik;
    }

    product = await Product.findByIdAndUpdate(req.params.productId, req.body);

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(500).json({
        success: false,
        message: "Invalid MongoDB ID",
      });
    }
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//TODO *{<-------------delete a product --admin ---------->}*

const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "No product found",
      });
    }

    for (let i = 0; i < product.images.length; i++) {
      await cloudinary.v2.uploader.destroy(product.images[i].public_id,{
        folder:"Products"
      });
    }

    await product.deleteOne();

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(500).json({
        success: false,
        message: "Invalid MongoDB ID",
      });
    }
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// *{<-------------Giving Reviews ---------->}*
const createProductReview = async (req, res) => {
  try {
    const { rating, comment, productId } = req.body;
    if (!productId || !rating || !comment) {
      return res.status(400).json({
        success: false,
        message: "ProductId rating and comment are required",
      });
    }
    const review = {
      user: req.user._id,
      name: req.user.name,
      image: req.user.avatar.url,
      rating,
      comment,
    };
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "No product found With this Id",
      });
    }

    const isReviewed = product.reviews.find(
      (review) => review.user.toString() === req.user._id.toString()
    );

    if (isReviewed) {
      product.reviews.forEach((rev) => {
        if (rev.user.toString() === req.user._id.toString()) {
          rev.rating = rating;
          rev.comment = comment;
        }
      });
    } else {
      product.reviews.push(review);
      product.numOfReview = product.reviews.length;
    }

    let totalRating = 0;
    product.reviews.forEach((review) => {
      totalRating += review.rating;
    });

    product.ratings = totalRating / product.reviews.length;

    await product.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      message: "Review Added Successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// *{<-------------Getting All reviews Reviews ---------->}*
const getAllReviews = async (req, res) => {
  try {
    const product = await Product.findById(req.query.productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "No product found With This Id",
      });
    }

    res.status(200).json({
      success: true,
      reviews: product.reviews,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// *{<-------------Deleting Review ---------->}*
const deleteReviews = async (req, res) => {
  try {
    const product = await Product.findById(req.query.productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "No product found With This Id",
      });
    }

    console.log(req.query.id);
    if (!req.query.id) {
      return res.status(404).json({
        success: false,
        message: "No Review found With This Id",
      });
    }
    

    const filterReviews = product.reviews.filter(
      (rev) => rev._id.toString() !== req.query.id.toString()
    );

    product.reviews = filterReviews;
    product.numOfReview = product.reviews.length;

    let totalRating = 0;
    product.reviews.forEach((review) => {
      totalRating += review.rating;
    });

    if (product.reviews.length === 0) {
      product.ratings = 0;
    } else {
      product.ratings = totalRating / product.reviews.length;
    }

    await product.save({ validateBeforeSave: false });
    res.status(200).json({
      success: true,
      reviews: "Deleted Review Successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// *{<-------------like and dislike function ---------->}*
const likeAndDislike = async (req, res) => {
  try {
    const { productId, likeAndDislike } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "No product found With this Id",
      });
    }

    const isLiked = product.userLikes.find(
      (user) => user.user.toString() === req.user._id.toString()
    );

    let messageAlert = null;

    if (isLiked) {
      if (likeAndDislike === false) {
        product.userLikes.forEach((obj) => {
          if (obj.user.toString() === req.user._id.toString()) {
            if (product.likes > 1) {
              product.likes -= 1;
            }

            obj.like = false;
            messageAlert = false;
          }
        });
      }
    }

    if (isLiked) {
      if (likeAndDislike === true) {
        product.userLikes.forEach((obj) => {
          if (obj.user.toString() === req.user._id.toString()) {
            obj.like = true;
            messageAlert = true;
            product.likes += 1;
          }
        });
      }
    }

    if (!isLiked) {
      product.userLikes.push({ user: req.user._id, like: true, productId });
      product.likes += 1;
    }

    await product.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      message: messageAlert,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createProduct,
  getAllProducts,
  getAllProducts_Admin,
  getSingleProduct,
  updateProduct,
  deleteProduct,
  createProductReview,
  getAllReviews,
  deleteReviews,
  likeAndDislike,
};
