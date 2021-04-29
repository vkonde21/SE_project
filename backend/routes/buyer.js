const router = require('express').Router();
const auth = require("../middleware/auth");
let Farmer = require('../models/farmer.model');
const multer = require("multer");
const FileType = require('file-type');
var ab2str = require('arraybuffer-to-string');
const User = require('../models/user.model');
const Order = require('../models/order.model');
const Rating = require('../models/rating.model');
const { Error } = require('mongoose');
router.route('/order_lock').post(auth, async(req,res) => {
    try{
        const farmer_user = req.body.farmerusername;
        const farmer = await User.findOne({username:farmer_user});
        if(farmer == null){
            req.flash('messageFailure', 'Farmer with this username does not exist');
            throw new Error();
        }
        const farmer_id = farmer._id;
        const buyer_username = req.user.username;
        const newo = new Order({farmer_id, buyer_username});
        await newo.save();
        req.flash('messageSuccess', 'Order request sent successfully');
        res.redirect('dashboard');
    }
    catch(e){
        res.redirect('dashboard');
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
            res.render('buyer_orders', {rating, user:req.user});
        
    } catch(e){
        req.flash('messageFailure', 'Failed to fetch orders');
        res.redirect('dashboard');
    }
});

router.route('/save_rating/:id').post(auth, async(req,res) => {
    try{
        var rating = await Rating.findOne({_id:req.params.id});
        const r = req.body.farmerrating;
        if(r < 0 || r > 5){
            req.flash('messageFailure', 'Enter a rating between 0 and 5. ');
            throw new Error();
        }
        const user = await User.findOne({username: rating.farmer_username})
        const farmer = await Farmer.findById(user._id);
        rating.rating = r;
        rating.given = true;
        console.log(rating.rating, farmer.rating);
        await rating.save();
        if(farmer.rating != 0)
            farmer.rating = (farmer.rating + rating.rating)/2.0;
        else
            farmer.rating = r;
        console.log(farmer.rating);
        await farmer.save();
        req.flash('messageSuccess', 'Rating saved successfully');
        res.redirect('/users/buyer_orders');
    }catch(e){
        req.flash('messageFailure', 'Rating could not be saved');
        res.redirect('/users/buyer_orders');
    }
});

module.exports = router;