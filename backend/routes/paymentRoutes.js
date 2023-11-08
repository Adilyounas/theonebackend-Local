//router file in routes
const express = require("express")
const router = express.Router()
const {isAuthenticated} = require("../utils/auth")
const { processPayment, paymentVerification, sendAPiKEY } = require("../controllers/paymentController")



router.route("/paymentVerification").post(paymentVerification)
router.route("/payment/process").post(isAuthenticated,processPayment)
router.route("/razorApiKey").get(isAuthenticated,sendAPiKEY)


module.exports = router
