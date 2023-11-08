const express = require('express');
const { newOrder, getOrder, myOrders, getAllOrders, updateOrder, deleteOrder } = require('../controllers/orderController');
const {isAuthenticated,authorizeRole} = require("../utils/auth")

const router = express.Router()

// *{<-------------Login user create new order---------->}*
router.route("/createOrder").post(isAuthenticated,   newOrder)

// *{<-------------Login user want to see order---------->}*
router.route("/order/:orderId").get(isAuthenticated,getOrder)

// *{<-------------Login user want to his orders---------->}*
router.route("/myOrders").get(isAuthenticated,myOrders)

//TODO *{<-------------Login admin want to ---see all orders-- in database---------->}*
router.route("/admin/getAllOrders").get(isAuthenticated,authorizeRole("admin"),getAllOrders)

//TODO *{<-------------Login admin want to ---update order-- status---------->}*
router.route("/admin/updateOrder/:orderId").put(isAuthenticated,authorizeRole("admin"),updateOrder)

//TODO *{<-------------Login admin want to ---delete-- order---------->}*
router.route("/admin/deleteOrder/:orderId").delete(isAuthenticated,authorizeRole("admin"),deleteOrder)


module.exports = router