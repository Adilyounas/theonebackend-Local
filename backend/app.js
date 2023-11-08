const express = require('express')
const app = express()
const cookieParser = require('cookie-parser')
const cors =require("cors")
const expressFileUpload = require("express-fileupload")

// *{<-------------Aquiring Routes---------->}*
const productRoutes = require("./routes/productRoutes")
const userRoutes = require("./routes/userRoutes")
const orderRoutes = require("./routes/orderRoutes")
const sendEmailForSaleRoutes = require("./routes/emailReqRoutes")
const paymentRoutes = require("./routes/paymentRoutes")





// *{<-------------To read json data---------->}*
app.use(express.json())
// *{<-------------To read cookie data---------->}*
app.use(cookieParser())
// *{<-------------To use proxy for development---------->}*
// !{<-------------when you use res.redirect to frontend page a axios network error will appear to conqur it use cors options---------->}*
// app.use((req, res, next) => {
//   // Set the allowed origin to the frontend's domain
//   res.header('Access-Control-Allow-Origin', 'https://warriordev.tech');

//   // Allow credentials (cookies) to be sent
//   res.header('Access-Control-Allow-Credentials', 'true');

//   // Allow specific HTTP methods for cross-origin requests (e.g., GET, POST, PUT, DELETE, etc.)
//   res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');

//   // Allow specific headers for cross-origin requests
//   res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

//   // Continue to the next middleware
//   next();
// });



app.use(cors())
// *{<-------------This may Help To upload file---------->}*
app.use(expressFileUpload())


// !{<-------------To resolve the upload error could not decoded base 64 data---------->}*
// use File size less than 1MB


// *{<-------------Use of Routes---------->}*
app.use("/api/v1", productRoutes)
app.use("/api/v1", userRoutes)
app.use("/api/v1", orderRoutes)
app.use("/api/v1", sendEmailForSaleRoutes)
app.use("/api/v1", paymentRoutes)






module.exports = app