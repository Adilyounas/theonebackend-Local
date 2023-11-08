const express = require('express');
const { getAllProducts, createProduct, updateProduct, deleteProduct, getSingleProduct, createProductReview, getAllReviews, deleteReviews, likeAndDislike, getAllProducts_Admin } = require('../controllers/productController');
const {isAuthenticated,authorizeRole} = require("../utils/auth")
const router = express.Router();

//TODO *{<-------------Create a new product ---admin ---------->}*
router.route("/admin/createProduct").post(isAuthenticated,authorizeRole("admin"),createProduct)

// *{<-------------Get all product---------->}*
router.route("/allProducts").get( getAllProducts)

// *{<-------------Get all product---------->}*
router.route("/admin/allProducts").get( isAuthenticated,authorizeRole("admin"),getAllProducts_Admin )


// *{<-------------Get single product---------->}*
router.route("/singleProduct/:productId").get(getSingleProduct)

//TODO *{<-------------Update product ---admin ---------->}*
router.route("/admin/updateProduct/:productId").put(isAuthenticated,authorizeRole("admin"),updateProduct)

//TODO *{<-------------delete product ---admin ---------->}*
router.route("/admin/deleteProduct/:productId").delete(isAuthenticated,authorizeRole("admin"),deleteProduct)

// *{<-------------give Review or update it by user ---------->}*
router.route("/Review/new").put(isAuthenticated,createProductReview)

// *{<-------------Get all Reveiws---------->}*
router.route("/allReviews").get(getAllReviews)

//TODO *{<-------------Delete Review---------->}*
router.route("/admin/deleteReview").delete(isAuthenticated,authorizeRole("admin"), deleteReviews)

// *{<-------------Like and Dislike---------->}*
router.route("/likeAndDislike").put(isAuthenticated, likeAndDislike)



module.exports = router