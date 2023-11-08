const express = require('express');
const { giveUserEmail } = require('../controllers/emailListController');
const router = express.Router();


router.route("/sendEamilForSale").post(giveUserEmail)


module.exports = router;