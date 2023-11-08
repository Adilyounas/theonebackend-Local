const express = require('express');
const { register, login, logout, forgotPass, resetPassword, getUserDetails, updatePassword, updateProfile, getAllUsers, getSingleUser, updateUserRole, deleteUser } = require('../controllers/userController');
const {isAuthenticated,authorizeRole} = require("../utils/auth")
const router = express.Router();


// *{<-------------Register user---------->}*
router.route("/register").post(register)

// *{<-------------login a user---------->}*
router.route("/login").post(login)

// *{<-------------LOGOUT user---------->}*
router.route("/logout").get(logout)

// *{<-------------Forgot Password---------->}*
router.route("/forgotPassword").post(forgotPass)

// *{<-------------Reset Password---------->}*
router.route("/resetPassword/:token").put(resetPassword)

// *{<-------------User gets his Details---------->}*
router.route("/myDetails").get(isAuthenticated,getUserDetails)

// *{<-------------Login user want to change the password---------->}*
router.route("/updatePassword").put(isAuthenticated,updatePassword)

// *{<-------------Login user want to update his Profile---------->}*
router.route("/updateProfile").put(isAuthenticated,updateProfile)



//TODO *{<-------------Admin Routes---------->}*

// *{<-------------Login admin want to fetch all users---------->}*
router.route("/admin/getAllUsers").get(isAuthenticated,authorizeRole("admin"),getAllUsers)

// *{<-------------Login admin want to fetch single user---------->}*
router.route("/admin/getSingleUser/:userId").get(isAuthenticated,authorizeRole("admin"),getSingleUser)

// *{<-------------Login admin want to Update user Role---------->}*
router.route("/admin/updateUserRole/:userId").put(isAuthenticated,authorizeRole("admin"),updateUserRole)


// *{<-------------Login admin want to delete a user---------->}*
router.route("/admin/deleteUser/:userId").delete(isAuthenticated,authorizeRole("admin"),deleteUser)

module.exports = router;