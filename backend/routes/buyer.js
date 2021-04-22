const router = require('express').Router();
const auth = require("../middleware/auth");
let Farmer = require('../models/farmer.model');
const multer = require("multer");
const FileType = require('file-type');
var ab2str = require('arraybuffer-to-string');
const User = require('../models/user.model');
const Order = require('../models/order.model');
const Rating = require('../models/rating.model');
router.route('/order_lock').post(auth, async(req,res) => {
    try{
        const farmer_user = req.body.farmerusername;
        const farmer = await User.findOne({username:farmer_user});
        if(farmer == null){
            res.status(400).send();
        }
        const farmer_id = farmer._id;
        const buyer_username = req.user.username;
        const newo = new Order({farmer_id, buyer_username});
        newo.save();
        res.redirect('dashboard');
    }
    catch(e){
        res.status(400).json('error: ' + e);
    }
    
});

router.route('/buyer_orders').get(auth, async(req,res) => {
    try{
        const Cp = await Rating.find({buyer_id: req.user._id});
        var rating = [];
        var i;
        for(i=0; i<Cp.length;i+=2){
            if(Cp[i+1] != undefined)
                rating.push({1:Cp[i], 2:Cp[i+1]});
            else
                rating.push({1:Cp[i]});
        }
            res.render('buyer_orders', {rating});
        
    } catch(e){
        res.status(400).json('error: ' + e);
    }
});

router.route('/save_rating/:id').post(auth, async(req,res) => {
    try{
        var rating = await Rating.findOne({_id:req.params.id});
        const r = req.body.farmerrating;
        const user = await User.findOne({username: rating.farmer_username})
        const farmer = await Farmer.findById(user._id);
        rating.rating = r;
        rating.given = true;
        rating.save();
        if(farmer.rating != 0)
            farmer.rating = (farmer.rating + r)/2.0;
        else
            farmer.rating = r;
        farmer.save();
        res.redirect('/users/buyer_orders');
    }catch(e){
        res.status(400).json('error: ' + e);
    }
});

module.exports = router;