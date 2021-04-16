const router = require('express').Router();
const auth = require("../middleware/auth");
let Farmer = require('../models/farmer.model');
let Crop = require('../models/crop.model');
let Deal = require('../models/deal.model');
let Order = require('../models/order.model');
let Buyer = require('../models/buyer.model');
const Investor = require('../models/investor.model');
const User = require('../models/user.model');
const Institution = require('../models/institution.model');
const multer = require("multer");
const FileType = require('file-type');
var ab2str = require('arraybuffer-to-string');

const upload = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        
            if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
                return cb(new Error('Please upload an image'))
            }
            cb(undefined, true)
    }
})
router.route('/addcrops').get(auth, async(req,res) => {
    res.render('addcrops');
});

router.route('/addcrops').post(auth, upload.single('cropimage'), async(req,res) => {
    try{
        const cropname = req.body.cropname;
        const dev_stage = req.body.dev_stage;
        const cropimage = req.file.buffer;
        const user_id = req.user._id;
        const {ext, mime} = await (FileType.fromBuffer(cropimage));
        const filetype = mime;
        const bString = ab2str(cropimage.buffer, 'base64');
        //console.log(user_id);
        const crop = new Crop({cropname, user_id, dev_stage, cropimage, filetype, bString})
        crop.save();
        res.redirect('dashboard');
    }
    catch(e){
        res.status(400).json('error: ' + e);
    }
    
});

router.route('/updatecrops/:id').get(auth, async(req, res) => {
    try{
        const id = req.params.id;
        const crop = await Crop.findById(id);
        
        if(crop.user_id.equals(req.user._id)){
            res.render('updatecrops', {crop});
            
        }
        else
            throw new Error();
        
    }catch(e){
        res.status(400).json('error: ' + e);
    } 
});

router.route('/updatecrops/:id').post(auth, upload.single('cropimage'),async(req, res) => {
    try{
        const id = req.params.id;
        const crop = await Crop.findById(id);
        if(crop.user_id.equals(req.user._id)){
            const cropname = req.body.cropname;
            const dev_stage = req.body.dev_stage;
            const cropimage = req.file.buffer;
            const {ext, mime} = await (FileType.fromBuffer(cropimage));
            const filetype = mime;
            const bString = ab2str(cropimage, 'base64');
            crop.filetype = filetype;
            crop.bString = bString;
            crop.cropname = cropname;
            crop.dev_stage = dev_stage;
            crop.cropimage = cropimage;
            await crop.save();
            res.redirect('/users/dashboard');
        }
        else{
            throw new Error();
        }
        
    }catch(e){
        res.status(400).json('error: ' + e);
    } 
});

router.route('/deletecrops/:id').get(auth,async(req, res) => {
    try{
        const id = req.params.id;
        const crop = await Crop.findById(id);
        if(crop.user_id.equals(req.user._id)){
            await Crop.deleteOne({_id:id});
            res.redirect('/users/dashboard');
        }
        else{
            throw new Error();
        }
    }catch(e){
        res.status(400).json('error: ' + e);
    }
});
router.route('/notifications').get(auth, async (req, res) => {
    const deals = await Deal.find({farmer_id:req.user._id, notified:false});
    const orders = await Order.find({farmer_id:req.user._id, notified:false});
    var notifications = [];
    var not_orders = [];
        var i;
        for(i=0; i<deals.length;i+=2){
            if(deals[i+1] != undefined)
                notifications.push({1:deals[i], 2:deals[i+1]});
            else
                notifications.push({1:deals[i]});
        }
        for(i=0; i<orders.length;i+=2){
            if(orders[i+1] != undefined)
                not_orders.push({1:orders[i], 2:orders[i+1]});
            else
                not_orders.push({1:orders[i]});
        }
    res.render('notifications', {notifications, not_orders});
});

router.route('/deal_decision').post(auth, async(req, res) => {
    var deal_id;
    var other;
    try{
        if(req.body.accept != undefined){
            if(req.body.dealid1 != undefined){
                deal_id = req.body.dealid1;  
            }
            else{
                deal_id = req.body.dealid2;
            }
            const deal = await Deal.findById(deal_id);
            deal.notified = true;
            deal.farmer_locked = true;
            deal.save();
            const farmer = await Farmer.findOne({_id:req.user._id});
            farmer.deals += 1;
            farmer.save();
            o = await User.findOne({username:deal.other_username});
            if(o.type == "investor"){
                other = await Investor.findOne({_id:o._id});
            }
            else if(o.type == "institution"){
                other = await Institution.findOne({_id:o._id});
            }
            other.deals += 1;
            other.save();

        }
        else if(req.body.accept == undefined){
            if(req.body.dealid1 != undefined){
                deal_id = req.body.dealid1;  
            }
            else{
                deal_id = req.body.dealid2;
            }
            const deal = await Deal.findById(deal_id);
            deal.notified = true;
            deal.save();
        }
        res.redirect('notifications');
    }
    catch(e){
        res.status(400).json('error: ' + e);
    }
    
});

router.route('/order_decision').post(auth, async(req, res) => {
    var order_id;
    var other;
    try{
        if(req.body.accept != undefined){
            if(req.body.orderid1 != undefined){
                order_id = req.body.orderid1;  
            }
            else{
                order_id = req.body.orderid2;
            }
            const order = await Order.findById(order_id);
            order.notified = true;
            order.farmer_locked = true;
            order.save();
            const farmer = await Farmer.findOne({_id:req.user._id});
            farmer.orders += 1;
            farmer.save();
            o = await User.findOne({username:order.buyer_username}); 
            other = await Buyer.findOne({_id:o._id});
            other.orders += 1;
            other.save();

        }
        else if(req.body.accept == undefined){
            if(req.body.orderid1 != undefined){
                order_id = req.body.orderid1;  
            }
            else{
                order_id = req.body.orderid2;
            }
            const order = await Order.findById(order_id);
            order.notified = true;
            order.save();
        }
        res.redirect('notifications');
    }
    catch(e){
        res.status(400).json('error: ' + e);
    }
    
});
module.exports = router;