const User = require("../models/userModel");
const sendJWT = require("../utils/jwt");
const nodeMailer = require("nodemailer");
const crypto = require("crypto");
const cloudinary = require("cloudinary");
// *{<-------------register a user---------->}*

const register = async (req, res) => {
  try {
    const myCloudAvatar = await cloudinary.v2.uploader.upload(req.body.avatar, {
      folder: "Avatars",
      resource_type: "auto",
      format: "avif",
      quality: 20,
    });

    const myCloudCover = await cloudinary.v2.uploader.upload(req.body.cover, {
      folder: "Covers",
      resource_type: "auto",
      format: "avif",
      quality: 20,
    });

    const { name, email, password } = req.body;
    const user = await User.create({
      name,
      email,
      password,
      avatar: {
        public_id: myCloudAvatar.public_id,
        url: myCloudAvatar.secure_url,
      },
      cover: {
        public_id: myCloudCover.public_id,
        url: myCloudCover.secure_url,
      },
    });

    // *{<-------------using jwt file function---------->}*

    const message = "Register Successfully";
    sendJWT(user, res, 201, message);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(403).json({
        success: false,
        //TODO *{<-------------important Thing to remember---------->}*
        //Example
        // const myObject = {
        //   name: 'John',
        //   age: 30,
        //   job: 'developer'
        // };
        // const keys = Object.keys(myObject);
        // console.log(keys); // Output: ['name', 'age', 'job']

        message: `Dublicate ${Object.keys(error.keyValue)} Entered`,
      });
    }
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// *{<-------------login---------->}*
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(401).json({
        success: false,
        message: "Enter email and password Both",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const isPasswordMatched = await user.isPasswordMatched(password);
    if (!isPasswordMatched) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // *{<-------------using jwt file function---------->}*

    const message = "login Successfully";
    sendJWT(user, res, 200, message);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// *{<-------------logOut---------->}*
const logout = async (req, res) => {
  try {
    const options = {
      expires: new Date(Date.now()),

      httpOnly: true,
    };

    res.status(200).cookie("token", null, options).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// *{<-------------Forgot Password---------->}*
const forgotPass = async (req, res) => {
  let user;
  try {

    user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Invalid email",
      });
    }

    const resetToken = await user.ResetPasswordTokenGenerator();
    if (!resetToken) {
      return res.status(500).json({
        success: false,
        message: "Reset Password Token is Not Generated",
      });
    }

    await user.save({ validateBeforeSave: false });

    // const resetPasswordURL = `${req.protocol}://${req.get(
    //   "host"
    // )}/api/v1/resetPassword/${resetToken}`;

    const resetPasswordURL = `${process.env.FRONTEND_URL}/api/v1/resetPassword/${resetToken}`;

    const message = `Your Password Reset Token is :- \n\n ${resetPasswordURL} \n\n If you want to reset your password Then Click it OtherWise ignore It`;

    const transporter = nodeMailer.createTransport({
      host: process.env.SMPT_HOST,
      port: process.env.SMPT_PORT,
      secure: true,
      auth: {
        user: process.env.SMPT_USER,
        pass: process.env.SMPT_PASS,
      },
    });

    const mailOptions = {
      from: process.env.SMPT_USER,
      to: user.email,
      subject: "One Project Password Recovery",
      text: message,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({
      success: true,
      message: `Sent to ${user.email} successfully`,
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// *{<-------------Reset Password---------->}*

const resetPassword = async (req, res) => {
  try {
    const { password, confirmPassword } = req.body;
    if (!password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Enter Password and Confirm Password Both",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Password and Confirm Password should be the same",
      });
    }

    //Creating Token hash
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Token is Expired or Invalid, Try Again🙄",
      });
    }
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    user.password = password;

    await user.save();

    // *{<-------------using jwt file function---------->}*

    const message = "Password Reset Successfully";
    sendJWT(user, res, 200, message);
  } catch (error) {
    //Here cast error not happaning becasue findById() does not find user because of invalid id
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// *{<-------------User Details---------->}*

const getUserDetails = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// *{<-------------login user want to change the password---------->}*
const updatePassword = async (req, res) => {
  try {
    const { oldPassword, password, confirmPassword } = req.body;
    if (!oldPassword || !password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Please Fill All Fields",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Password and Confirm Password should be the same",
      });
    }
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User Not Found",
      });
    }

    const isPasswordMatched = await user.isPasswordMatched(oldPassword);
    if (!isPasswordMatched) {
      return res.status(400).json({
        success: false,
        message: "Old Password Is Invalid",
      });
    }

    user.password = confirmPassword;
    await user.save();

    // *{<-------------using jwt file function---------->}*

    const message = "✔ Update Password Successfully";
    sendJWT(user, res, 200, message);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// *{<-------------Login User want to update his details except password---------->}*

const updateProfile = async (req, res) => {
  try {
    const updateUser = {
      name: req.body.name,
      email: req.body.email,
    };

    if (req.body.avatar !== "") {
      const user = await User.findById(req.user._id);
      const avatarId = user.avatar.public_id;

      await cloudinary.v2.uploader.destroy(avatarId);

      const myCloudAvatar = await cloudinary.v2.uploader.upload(
        req.body.avatar,
        {
          folder: "Avatars",
          resource_type: "auto",
          format: "avif",
          quality: 20,
        }
      );

      updateUser.avatar = {
        public_id: myCloudAvatar.public_id,
        url: myCloudAvatar.secure_url,
      };
    }

    if (req.body.cover !== "") {
      const user = await User.findById(req.user._id);
      const coverId = user.cover.public_id;

      await cloudinary.v2.uploader.destroy(coverId);

      const myCloudCover = await cloudinary.v2.uploader.upload(req.body.cover, {
        folder: "Covers",
        resource_type: "auto",
        format: "avif",
        quality: 30,
      });

      updateUser.cover = {
        public_id: myCloudCover.public_id,
        url: myCloudCover.secure_url,
      };
    }

    const user = await User.findByIdAndUpdate(req.user._id, updateUser);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User Not Found",
      });
    }

    const message = "✔ Update Profile Successfully";
    sendJWT(user, res, 200, message);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//TODO *{<------------- (Admin ) --Login Admin Want to know that how many user are there in DataBase---------->}*

const getAllUsers = async (req, res) => {
  try {
    const user = await User.find();
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "🚷There are no Users, available",
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//TODO *{<------------- (Admin ) --Login Admin Want to know that how many user are there in DataBase---------->}*

const getSingleUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: `User does not exist with this ${req.params.userId} Id`,
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//TODO *{<-------------Login admin want to update Some User role---------->}*

const updateUserRole = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: `User does not exist with this ${req.params.userId} Id`,
      });
    }
     await User.findByIdAndUpdate(req.params.userId, req.body);

    res.status(200).json({
      success: true,
      message: "✔ Update User Successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//TODO *{<-------------Login admin want to delete Some User---------->}*

const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: `User does not exist with this ${req.params.userId} Id`,
      });
    }

    const avatarId = user.avatar.public_id;
    const coverId = user.cover.public_id;

    await cloudinary.v2.uploader.destroy(avatarId,{
      folder:"Avatars",
    })
    await cloudinary.v2.uploader.destroy(coverId,{
      folder:"Covers",
    })



    //we will remove cloudinary
    await user.deleteOne();
    res.status(200).json({
      success: true,
      message: "✔ Delete User Successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// *{<-------------Export Routes---------->}*
module.exports = {
  register,
  login,
  logout,
  forgotPass,
  resetPassword,
  getUserDetails,
  updatePassword,
  updateProfile,
  getAllUsers,
  getSingleUser,
  updateUserRole,
  deleteUser,
};
