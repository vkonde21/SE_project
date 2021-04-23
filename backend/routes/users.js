const router = require('express').Router();
let User = require('../models/user.model');
let Farmer = require('../models/farmer.model');
let Investor = require('../models/investor.model');
let Buyer = require('../models/buyer.model');
let Institution = require('../models/institution.model');
let Crop = require('../models/crop.model');
let Order = require('../models/order.model');
let Deal = require('../models/deal.model');
let Chat = require('../models/chat.model');
let Connection = require('../models/connection.model');
let Admin = require('../models/admin.model');
const bcrypt = require('bcrypt');
const auth = require("../middleware/auth");
const multer = require("multer");
const FileType = require('file-type');
var ab2str = require('arraybuffer-to-string');
/* to avoid saving the file on the local file system remove the dest parameter from multer*/
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


router.route('/me').get(auth, (req, res) => {
    res.send(req.user);
});

router.get('/register', (req, res) => res.render('register'));
router.route('/registerfarmer').get((req, res) => {
    res.render('registerfarmer');
});



router.route('/registerfarmer').post(upload.fields([{
    name: 'landpaper', maxCount: 1
}, {
    name: 'certificate', maxCount: 1
}]), async (req, res) => {
    try {
       
        const username = req.body.username;
        const password = req.body.password;
        const fullname = req.body.registername;
        const hashedPassword = await bcrypt.hash(password, 8);
        const email = req.body.email;
        const type = "farmer";
        var buyer_req = req.body.buyeryes;
        if (buyer_req == undefined) {
            buyer_req = false;
        }
        else {
            buyer_req = true;
        }
        var investor_req = req.body.investoryes;
        if (investor_req == undefined) {
            investor_req = false;
        }
        else {
            investor_req = true;
        }
        const land_area = req.body.landarea;
        const location = req.body.location;
        const is_verified = false;
        const rating = 0;
        const deals = 0;
        const orders = 0;
        const land_doc = req.files["landpaper"][0].buffer;
        const certificate = req.files["certificate"][0].buffer;
        var f = await (FileType.fromBuffer(land_doc));
        const filetype1 = f.mime;
        f = await (FileType.fromBuffer(certificate));
        const filetype2 = f.mime;
        const bString1 = ab2str(land_doc.buffer, 'base64');
        const bString2 = ab2str(certificate.buffer, 'base64');
        const newUser = new User({ username, password: hashedPassword, email, type, is_verified });
        newUser.save();
        const user_id = newUser._id;
        const farmer = new Farmer({ _id: user_id, fullname, deals, orders, buyer_req, investor_req, rating, land_area, location, land_doc:bString1, certificate:bString2,land_doc_type:filetype1, certificate_type:filetype2 });
        farmer.save();
        res.redirect("success");
    }
    catch (err) {
        res.status(400).json('error: ' + err);
    }


});

router.route('/success').get((req, res) => {
    res.render('success');
});

router.route('/about').get((req, res) => {
    res.render('about');
});
router.route('/chat').get(auth, async(req, res) => {
    var connections = await Connection.find({chat_initiator:req.user.username, started:true});
    if(connections.length == 0){
        connections = await Connection.find({conn_user: req.user.username, started:true});
    }
    var i =0, j= 0, room, orders, deals, chat, time, unread;
    var buyer = [];
    var investor = [];
    var farmer = [];
    var institution = [];
    var crops = [];
    var c="";
    var x, u, b, inv, ins;
    for(i=0; i< connections.length; i++){
        x = connections[i];
        if(req.user.type == "farmer"){
            u = await User.findOne({username: x.chat_initiator});
            if(u != null && u.type == "buyer"){
                b = await Buyer.findById(u._id);
                b.room_id = connections[i]._id;
                unread = await Chat.find({sender:u.username, receiver:req.user.username, notified:false});
                b.notifs = unread.length;
                orders = await Order.find({farmer_id: req.user._id, buyer_username: u.username, farmer_locked:true});
                if(orders == null){
                    chat = await Chat.find({$or:[{sender:req.user.username, receiver:u.username}, {receiver:req.user.username, sender:u.username}]}).sort({time:1});
                    if(chat != null){
                       time = (Date.now() - chat[0].time)/60000;
                       if(time > 60){  //for testing 60 minutes
                            await Chat.delete({$or:[{sender:req.user.username, receiver:u.username}, {receiver:req.user.username, sender:u.username}]});
                            await Chat.save();
                            connections[i].started = false;
                            await connections[i].save();
                       }
                       else{
                        buyer.push(b);
                       }
                    }
                }
                else{
                    buyer.push(b);
                }
                
            }
            else if(u!= null && u.type == "investor"){
                inv = await Investor.findById(u._id);
                inv.room_id = connections[i]._id;
                deals = await Deal.find({farmer_id: req.user._id, other_username: u.username, farmer_locked:true});
                unread = await Chat.find({sender:u.username, receiver:req.user.username, notified:false});
                inv.notifs = unread.length;
                if(deals == null){
                    chat = await Chat.find({$or:[{sender:req.user.username, receiver:u.username}, {receiver:req.user.username, sender:u.username}]}).sort({time:1});
                    if(chat != null){
                       time = (Date.now() - chat[0].time)/60000;
                       if(time > 60){  //for testing 60 minutes
                            await Chat.delete({$or:[{sender:req.user.username, receiver:u.username}, {receiver:req.user.username, sender:u.username}]});
                            await Chat.save();
                            connections[i].started = false;
                            await connections[i].save();
                       }
                       else{
                        investor.push(inv);
                       }
                    }
                }
                else{
                    investor.push(inv);
                }
                
            }
            else{
                ins = await Institution.findById(u._id);
                ins.room_id = connections[i]._id;
                deals = await Deal.find({farmer_id: req.user._id, other_username: u.username, farmer_locked:true});
                unread = await Chat.find({sender:u.username, receiver:req.user.username, notified:false});
                ins.notifs = unread.length;
                if(deals == null){
                    chat = await Chat.find({$or:[{sender:req.user.username, receiver:u.username}, {receiver:req.user.username, sender:u.username}]}).sort({time:1});
                    if(chat != null){
                       time = (Date.now() - chat[0].time)/60000;
                       if(time > 60){  //for testing 60 minutes
                            await Chat.delete({$or:[{sender:req.user.username, receiver:u.username}, {receiver:req.user.username, sender:u.username}]});
                            await Chat.save();
                            connections[i].started = false;
                            await connections[i].save();
                       }
                       else{
                        institution.push(ins);
                       }
                    }
                }
                else{
                    institution.push(ins);
                }
            }
        }
        else {
            u = await User.findOne({username: x.conn_user});
            f = await Farmer.findById(u._id);
            crops = await Crop.find({user_id:u._id});
            f.room_id = connections[i]._id;
            c ="";
            for(j = 0; j<crops.length;j++){
                c += crops[j].cropname + " ";
            }
            f.crops = c;
            deals = await Deal.find({farmer_id: u._id, other_username: req.user.username, farmer_locked:true});
            orders = await Order.find({farmer_id: u._id, buyer_username: req.user.username, farmer_locked:true});
            unread = await Chat.find({sender:u.username, receiver:req.user.username, notified:false});
            f.notifs = unread.length;
                if(deals == null && orders == null){
                    chat = await Chat.find({$or:[{sender:req.user.username, receiver:u.username}, {receiver:req.user.username, sender:u.username}]}).sort({time:1});
                    if(chat != null){
                       time = (Date.now() - chat[0].time)/60000;
                       if(time > 60){  //for testing 60 minutes
                            await Chat.delete({$or:[{sender:req.user.username, receiver:u.username}, {receiver:req.user.username, sender:u.username}]});
                            await Chat.save();
                            connections[i].started = false;
                            await connections[i].save();
                       }
                       else{
                        farmer.push(f);
                       }
                    }
                }
                else{
                    farmer.push(f);
                }
            
        }
    }
    if(req.user.type == "farmer")
        res.render('chat_app_farmer', {buyer, investor, institution, user:req.user});
    else if(req.user.type == "buyer")
        res.render('chat_app_buyer', {farmer, user:req.user});
    else
        res.render('chat_app', {farmer, user:req.user});
});
router.route('/viewfarmers').get(auth, async (req, res) => {
    try{
        if(req.user.type == "investor" || req.user.type == "buyer" || req.user.type == "institution"){
            const users = await User.find({is_verified:true, type:"farmer"});
            var profiles = [];
            var crops, f1, f2;
            var c1 = "";
            var c2 = "";
            var i;
            for(i=0; i<users.length;i+=2){
                c1="";
                c2="";
                crops = await Crop.find({user_id:users[i]._id});
                f1 = await Farmer.findOne({_id:users[i]._id});
                for(var j=0; j < crops.length;  j++){
                    c1 += crops[j].cropname + ", ";
                }
                c1 = c1.substring(0, c1.length - 2);
            
                if(users[i+1] != undefined){
                    f2 = await Farmer.findOne({_id:users[i+1]._id});
                    crops = await Crop.find({user_id:users[i+1]._id});
                    for(var j=0; j < crops.length;  j++){
                        c2 += crops[j].cropname + ", ";
                    }
                    c2 = c2.substring(0, c2.length - 2);
                    
                    profiles.push({1:f1, 2:c1, 3:f2, 4:c2});
                }
                else
                    profiles.push({1:f1, 2:c1});
            }
                res.render('viewfarmers', {profiles, user:req.user});
        }
        else{
            throw new Error();
        }
    } 
    catch(err) {
        res.status(400).json('error: ' + err);
    } 
    
    
});



router.route('/help').get((req, res) => {
    res.render('help');
});
router.route('/help_farmer').get((req, res) => {
    res.render('help_farmer');
});
router.route('/help_investor').get((req, res) => {
    res.render('help_investor');
});
router.route('/help_institution').get((req, res) => {
    res.render('help_institution');
});
router.route('/help_buyer').get((req, res) => {
    res.render('help_buyer');
});

router.route('/registerinvestor').get((req, res) => {
    res.render('registerinvestor');
});

router.route('/registerinvestor').post(upload.single('incomestatement'), async (req, res) => {
    try{
        const username = req.body.username;
        const password = req.body.password;
        const fullname = req.body.registername;
        const hashedPassword = await bcrypt.hash(password, 8);
        const email = req.body.email;
        const start = req.body.startingrange;
        const end = req.body.endingrange;
        const pan_number = req.body.pannumber;
        const type = "investor";
        const is_verified = false;
        const deals = 0;
        const income_statement = req.file.buffer;
        const {ext, mime} = await (FileType.fromBuffer(income_statement));
        const filetype = mime;
        const bString = ab2str(income_statement.buffer, 'base64');
        const profit_share = 0;
        const newUser = new User({ username, password: hashedPassword, email, type, is_verified });
        newUser.save();
        const user_id = newUser._id;
        const investor = new Investor({ _id: user_id, fullname, deals,  income_statement:bString, income_statement_type:filetype,start, end, pan_number, profit_share});
        investor.save();
        res.redirect("success");
    }
    catch(err){
        res.status(400).json('error: ' + err);
    }
});
router.route('/registerinstitution').get((req, res) => {
    res.render('registerinstitution');
});
router.route('/registerinstitution').post(upload.single('businessproof'), async (req, res) => {
    try{
        const username = req.body.username;
        const password = req.body.password;
        const fullname = req.body.registername;
        const hashedPassword = await bcrypt.hash(password, 8);
        const email = req.body.email;
        const start = req.body.startingrange;
        const end = req.body.endingrange;
        const business_proof = req.file.buffer;
        const type = "institution";
        const is_verified = false;
        const deals = 0;
        const {ext, mime} = await (FileType.fromBuffer(business_proof));
        const filetype = mime;
        const bString = ab2str(business_proof.buffer, 'base64');
        const newUser = new User({ username, password: hashedPassword, email, type, is_verified });
        newUser.save();
        const user_id = newUser._id;
        const institution = new Institution({ _id: user_id, fullname, deals, business_proof:bString, business_proof_type:filetype,start, end});
        institution.save();
        res.redirect("success");
    }
    catch(err){
        res.status(400).json('error: ' + err);
    }
});
router.route('/registerbuyer').get((req, res) => {
    res.render('registerbuyer');
});

router.route('/registerbuyer').post(upload.single('pancard'), async (req, res) => {
    try{
        const username = req.body.username;
        const password = req.body.password;
        const fullname = req.body.registername;
        const hashedPassword = await bcrypt.hash(password, 8);
        const email = req.body.email;
        const pan_number = req.body.pannumber;
        const requirements = req.body.requirements;
        const type = "buyer";
        const is_verified = false;
        const orders = 0;
        const pan_card = req.file.buffer;
        const {ext, mime} = await (FileType.fromBuffer(pan_card));
        const filetype = mime;
        const bString = ab2str(pan_card.buffer, 'base64');
        const newUser = new User({ username, password: hashedPassword, email, type, is_verified });
        newUser.save();
        const user_id = newUser._id;
        const buyer = new Buyer({_id:user_id, fullname, pan_number, orders, pan_card:bString, pan_card_type:filetype, requirements });
        buyer.save();
        res.redirect("success");
    }
    catch(err){
        res.status(400).json('error: ' + err);
    }
});

router.route('/login').get((req, res) => {
    res.render('login');
});

router.route('/login').post(async (req, res) => {
    try {
        var user = await User.findByCredentials(req.body.username, req.body.password); /*user defined method; check user.model.js*/
        if(user == null || user == undefined)
            var admin = await Admin.findByCredentials(req.body.username, req.body.password);
        
        if(user != null && user != undefined && user.is_verified == true){
            const token = await user.generateAuthToken();
            res.cookie("jwt", token, { secure: true, httpOnly: true })
            res.redirect ('/users/dashboard');
        }
        else if(admin != null && admin != undefined){
            const token = await admin.generateAuthToken();
            res.cookie("jwt", token, { secure: true, httpOnly: true })
            res.redirect('/admin/dashboard');
        }
        else{
            
            res.redirect('/');
        }
        
    }
    catch (e) {
        res.status(400).send();
    }
});

router.route('/logout').get(auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token;
        });
        await req.user.save();
        res.redirect("/");
    }
    catch (e) {
        res.status(500).send({ error: "Logout failed!" });
    }

});

router.route('/logoutall').get(auth, async (req, res) => {
    try {
        req.user.tokens = [];
        await req.user.save();
        res.redirect("/");
    }
    catch (e) {
        res.status(500).send({ error: "Logout failed!" });
    }

});

router.route('/dashboard').get(auth, async(req,res) => {
    if(req.user.type == "farmer"){
        /*get all the crop names, deals etc and send it in the json format*/
        const Cp = await Crop.find({user_id:req.user._id});
        const farmer = await Farmer.findById(req.user._id);
        var Crops = [];
        var i;
        for(i=0; i<Cp.length;i+=2){
            if(Cp[i+1] != undefined)
                Crops.push({1:Cp[i], 2:Cp[i+1]});
            else
                Crops.push({1:Cp[i]});
        }
        if(Crops[0]!= undefined){
            res.render('farmer_dashboard', {Crops: Crops,farmer, user:req.user});
        }
            
        else{
            res.render('farmer_dashboard', {farmer, user:req.user});
        }
    }

    else if(req.user.type == "investor"){
        const investor = await Investor.findById(req.user._id);
        res.render('investor_dashboard', {investor, user:req.user});
    }

    else if(req.user.type == "institution"){
        const institution = await Institution.findById(req.user._id);
        res.render('institution_dashboard', {institution, user:req.user});
    }

    else if(req.user.type == "buyer"){
        const buyer = await Buyer.findById(req.user._id);
        res.render('buyer_dashboard', {buyer, user:req.user});
    }

});
router.route('/deal_lock').post(auth, async(req,res) => {
    const farmer_user = req.body.farmerusername;
    const farmer = await User.findOne({username:farmer_user});
    if(farmer.length == 0){
        res.status(400).send();
    }
    const farmer_id = farmer._id;
    const other_username = req.user.username;
    const farmer_locked = false;
    const newdeal = new Deal({farmer_id, other_username, farmer_locked});
    newdeal.save();
    res.redirect("dashboard");

});


router.route('/crop_requirements').post(auth, async(req, res) => {
    try{
        if(req.user.type == "buyer"){
            const buyer = await Buyer.findById(req.user._id);
            buyer.requirements = req.body.croprequirements;
            buyer.save();
        }
        else if(req.user.type == "institution"){
            const institution = await Institution.findById(req.user._id);
            institution.requirements = req.body.croprequirements;
            institution.save();
        }
        res.redirect('dashboard');
    }
    catch(err){
        res.status(400).json('error: ' + err);
    }
});

router.route('/updateprofile').get(auth, async(req, res) => {
    try{
        if(req.user.type == "investor"){
            const investor = await Investor.findById(req.user._id);
            res.render('investor_profile', {investor, user:req.user});
        }
    
        else if(req.user.type == "institution"){
            const institution = await Institution.findById(req.user._id);
            res.render('institution_profile', {institution, user:req.user});
        }
    
        else if(req.user.type == "buyer"){
            const buyer = await Buyer.findById(req.user._id);
            res.render('buyer_profile', {buyer, user:req.user});
        }

        else if(req.user.type == "farmer"){
            const farmer = await Farmer.findById(req.user._id);
            res.render('farmer_profile', {farmer, user:req.user});
        }
        else{
            throw new Error();
        }
    }
    catch(err){
        res.status(400).json('error: ' + err);
    }
});

router.route('/updateprofile').post(auth, async(req, res) => {
    try{
        if(req.user.type == "investor"){
            const investor = await Investor.findById(req.user._id);
            const user = await User.findById(req.user._id);
            const fullname = req.body.registername;
            const email = req.body.email;
            const start = req.body.startingrange;
            const end = req.body.endingrange;
            investor.fullname = fullname;
            investor.start = start;
            investor.end = end;
            user.email = email;
            investor.save();
            user.save();
        }
    
        else if(req.user.type == "institution"){
            const institution = await Institution.findById(req.user._id);
            const user = await User.findById(req.user._id);
            const fullname = req.body.registername;
            const email = req.body.email;
            const start = req.body.startingrange;
            const end = req.body.endingrange;
            institution.fullname = fullname;
            institution.start = start;
            institution.end = end;
            user.email = email;
            institution.save();
            user.save();
        }
    
        else if(req.user.type == "buyer"){
            const buyer = await Buyer.findById(req.user._id);
            const user = await User.findById(req.user._id);
            const fullname = req.body.registername;
            const email = req.body.email;
            const requirements = req.body.requirements
            buyer.fullname = fullname;
            buyer.requirements = requirements;
            user.email = email;
            buyer.save();
            user.save();
        }

        else if(req.user.type == "farmer"){
            const farmer = await Farmer.findById(req.user._id);
            const user = await User.findById(req.user._id);
            const fullname = req.body.registername;
            const email = req.body.email;
            var buyer_req = req.body.buyeryes;
            if (buyer_req == undefined) {
                buyer_req = false;
            }
            else {
                buyer_req = true;
            }
            var investor_req = req.body.investoryes;
            if (investor_req == undefined) {
                investor_req = false;
            }
            else {
                investor_req = true;
            }
            const land_area = req.body.landarea;
            farmer.fullname = fullname;
            farmer.buyer_req = buyer_req;
            farmer.investor_req = investor_req;
            farmer.land_area = land_area;
            user.email = email
            farmer.save();
            user.save();
        }
        else{
            throw new Error();
        }
        res.redirect('dashboard');
    }
    catch(err){
        res.status(400).json('error: ' + err);
    }
});
module.exports = router;