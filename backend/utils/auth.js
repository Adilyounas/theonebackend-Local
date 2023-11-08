const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
// *{<-------------IsAuthenticated / login or not---------->}*

const isAuthenticated = async (req, res, next) => {
  try {
    const token = req.cookies["token"];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Login First",
      });
    }
    const { id } = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ _id: id });

    req.user = user;
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// *{<-------------Role Authentication---------->}*

const authorizeRole = (...roles) => {
  return (req, res, next) => {
    if (roles.includes(req.user.role)) {
      next();
    } else {
      return res.status(403).json({
        success: false,
        message: `Role: ${req.user.role} is not allowed to access the resource`,
      });
    }
  };
};

module.exports = { isAuthenticated, authorizeRole };
