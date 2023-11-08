const sendJWT = async (user, res, statusCode, message) => {
  const token = await user.generatingGWT();
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Token not Generated",
    });
  }

  const options = {
    expires: new Date(
      Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: true,
  };

  res.status(statusCode).cookie("token",token,options) .json({
    success: true,
    message,
   token
    
  });

 
};

module.exports = sendJWT;
