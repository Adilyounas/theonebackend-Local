const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please Enter your name"],
    maxLength: [30, "You can't exceed 30 characters"],
    minLength: [4, "Name should be more than 4 characters"],
  },
  email: {
    type: String,
    required: [true, "Please Enter your email"],
    unique: true,
    validate: [validator.isEmail, "Please enter a valid email"],
  },
  password: {
    type: String,
    required: [true, "Please Enter your password"],
    minLength: [8, "Password should be more than 8 characters"],
  },
  avatar: {
    public_id: {
      type: String,
      required: [true, "Enter User Image Profile Id"],
    },
    url: {
      type: String,
      required: [true, "Enter User Image Profile URL"],
    },
  },
  cover: {
    public_id: {
      type: String,
      required: [true, "Enter User Image Cover Id"],
    },
    url: {
      type: String,
      required: [true, "Enter User Cover URL"],
    },
  },
  role: {
    type: String,
    default: "user",
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// *{<-------------Hash password---------->}*
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  this.password = await bcrypt.hash(this.password, 10);
});

// *{<-------------JWT Token generating---------->}*
userSchema.methods.generatingGWT = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRATION,
  });
};

// *{<-------------Password matching while login---------->}*
userSchema.methods.isPasswordMatched = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// *{<-------------Forgot password Functionality---------->}*

userSchema.methods.ResetPasswordTokenGenerator = function () {
  //generating Token
  const resetToken = crypto.randomBytes(20).toString("hex");
  //Hashing and adding resetPasswordToken to userSchema
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.resetPasswordExpire = Date.now() + process.env.RESETPASSWORDEXPIRE * 60 * 1000;
  return resetToken;
};

module.exports = new mongoose.model("User", userSchema);
