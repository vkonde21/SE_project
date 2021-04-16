const router = require('express').Router();
const auth = require("../middleware/auth");
let Farmer = require('../models/farmer.model');
let Crop = require('../models/crop.model');
let Deal = require('../models/deal.model');
const multer = require("multer");
const FileType = require('file-type');
var ab2str = require('arraybuffer-to-string');
const Investor = require('../models/investor.model');
const User = require('../models/user.model');
const Institution = require('../models/institution.model');
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

router.route('/notifications').get(auth, async (req, res) => {
    const deals = await Deal.find({farmer_id:req.user._id, notified:false});
    var notifications = [];
        var i;
        for(i=0; i<deals.length;i+=2){
            if(deals[i+1] != undefined)
                notifications.push({1:deals[i], 2:deals[i+1]});
            else
                notifications.push({1:deals[i]});
        }
    res.render('notifications', {notifications});
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
module.exports = router;