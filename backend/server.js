const app = require("./app.js");
const dotenv = require("dotenv");
const connectToDatabse = require("./database");
const cloudinary = require("cloudinary")
const Razorpay = require("razorpay")

// *{<-------------uncaught exception---------->}*
process.on("uncaughtException", (error) => {
  console.log(`Error: ${error.message}`);
  console.log(`Shutting down server due to uncaughtException`);
  process.exit(1);
});

// *{<-------------Config---------->}*
dotenv.config({ path: "backend/config/config.env" });

// *{<-------------Connecting to database---------->}*
connectToDatabse();



// *{<-------------Cloudinary Attachment && and before it express fileUploader also attacted---------->}*

cloudinary.config({
  cloud_name:process.env.CLOUDINARY_NAME,
  api_key:process.env.CLOUDINARY_API_KEY,
  api_secret:process.env.CLOUDINARY_API_SECRET,
})


// *{<-------------Razorpay attacted---------->}*
//  var instance = new Razorpay({
//   key_id: process.env.RAZORPAY_API_KEY,
//   key_secret: process.env.RAZORPAY_SECRET_KEY,
// });

 var instance = new Razorpay({
  key_id: "rzp_test_x3Xr1v6xOxFVbM",
  key_secret: "v32QzPGuz91pIaxo5kPFwWz2",
 });

module.exports = instance;


// *{<-------------Our App Main Server---------->}*

const server = app.listen(process.env.PORT, () => {
  console.log(`server is running on http://localhost:${process.env.PORT}`);
});

//unhandled promise rejection or mongodb url error
process.on("unhandledRejection", (error) => {
  console.log(`Error: ${error.message}`);
  console.log(`Shutting down server due to UnhandledRejection`);

  server.close(() => {
    process.exit(1);
  });
});
