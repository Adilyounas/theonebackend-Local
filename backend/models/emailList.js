const mongoose = require("mongoose");
const validator = require("validator");

const emailReqSchema = new mongoose.Schema({

  email: {
    type: String,
    required: [true, "Please Enter your email"],
    unique: true,
    validate: [validator.isEmail, "Please enter a valid email"],
  },
});

module.exports = new mongoose.model("EmailReq", emailReqSchema);
