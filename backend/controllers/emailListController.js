const EmailReq = require("../models/emailList");

const giveUserEmail = async (req, res) => {
  try {

    await EmailReq.create(req.body);
    res.status(201).json({
      success: true,
      message: "Email added successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

module.exports = { giveUserEmail };