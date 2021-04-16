const router = require('express').Router();
const auth = require("../middleware/auth");
let Farmer = require('../models/farmer.model');
const multer = require("multer");
const FileType = require('file-type');
var ab2str = require('arraybuffer-to-string');
const User = require('../models/user.model');
const Order = require('../models/order.model');
router.route('/order_lock').post(auth, async(req,res) => {
    const farmer_user = req.body.farmerusername;
    const farmer = await User.findOne({username:farmer_user});
    if(farmer.length == 0){
        res.status(400).send();
    }
    const farmer_id = farmer._id;
    const buyer_username = req.user.username;
    const newo = new Order({farmer_id, buyer_username});
    newo.save();
    res.redirect('dashboard');
});
module.exports = router;