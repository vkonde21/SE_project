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
    fileFilter(req, file, cb) {
        cb(undefined, true); 
    }
})

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
        const username_regex = /^[A-Za-z0-9_]*$/;
        if(username.match(username_regex) == null || username.length < 3){
            req.flash('messageFailure', 'Username length should be atleast 3 and it should contain only alphanumeric and _ characters');
            throw new Error();
        }
        const password = req.body.password;
        const password2 = req.body.password2;
        if(password != password2){
            req.flash('messageFailure', 'Please enter same password in both fields');
            throw new Error();
        }
        if(password.length < 6){
            req.flash('messageFailure', 'Please enter a password with atleast 6 characters');
            throw new Error();
        }
        const fullname = req.body.registername;
        if(fullname.match('^[\.a-zA-Z ]*$') == null){
            req.flash('messageFailure', 'Fullname should contain only alphabets and spaces');
            throw new Error();
        }
        const hashedPassword = await bcrypt.hash(password, 8);
        const email = req.body.email;
        const type = "farmer";
        var buyer_req = req.body.buyer;
        if (buyer_req == 0) {
            buyer_req = false;
        }
        else {
            buyer_req = true;
        }
        var investor_req = req.body.investor;
        if (investor_req == 0) {
            investor_req = false;
        }
        else {
            investor_req = true;
        }
        const land_area = req.body.landarea;
        if(land_area < 0){
            req.flash('messageFailure', "Enter a valid number for land_area");
            throw new Error();
        }
        const location = req.body.location;
        if(location.match('^[\.a-zA-Z ]*$') == null){
            req.flash('messageFailure', 'District name should contain only alphabets and spaces');
            throw new Error();
        }
        const is_verified = false;
        const rating = 0;
        const deals = 0;
        const orders = 0;
        const land_doc = req.files["landpaper"][0].buffer;
        const certificate = req.files["certificate"][0].buffer;
        if (!req.files["landpaper"][0].originalname.match(/\.(jpg|jpeg|png)$/) || !req.files["landpaper"][0].size > 1000000) {
            req.flash('messageFailure', "Please upload a jpg/jpeg/png image with max size 1MB");
            throw new Error();
        }
        if (!req.files["certificate"][0].originalname.match(/\.(jpg|jpeg|png)$/) || !req.files["certificate"][0].size > 1000000) {
            req.flash('messageFailure', "Please upload a jpg/jpeg/png image with max size 1MB");
            throw new Error();
        }
        var f = await (FileType.fromBuffer(land_doc));
        const filetype1 = f.mime;
        f = await (FileType.fromBuffer(certificate));
        const filetype2 = f.mime;
        const bString1 = ab2str(land_doc.buffer, 'base64');
        const bString2 = ab2str(certificate.buffer, 'base64');
        const newUser = new User({ username, password: hashedPassword, email, type, is_verified });
        await newUser.save();
        const user_id = newUser._id;
        const farmer = new Farmer({ _id: user_id, fullname, deals, orders, buyer_req, investor_req, rating, land_area, location, land_doc:bString1, certificate:bString2,land_doc_type:filetype1, certificate_type:filetype2 });
        await farmer.save();
        res.redirect("success");
    }
    catch (err) {
        if(err.code == 11000)
            req.flash('messageFailure', "Username or email ID already exists");
        res.redirect('/users/registerfarmer');
    }


});

router.route('/success').get((req, res) => {
    res.render('success');
});

router.route('/about').get((req, res) => {
    res.render('about');
});
router.route('/chat').get(auth, async(req, res) => {
    var connections = await Connection.find({chat_initiator:req.user.username, started:true, blocked:false});
    if(connections.length == 0){
        connections = await Connection.find({conn_user: req.user.username, started:true, blocked:false});
    }
    var i =0, j= 0, room, orders, deals, chat, time, unread;
    var buyer = [];
    var investor = [];
    var farmer = [];
    var institution = [];
    var crops = [];
    var c="";
    var x, u, b, inv, ins, block;
    var blocked = [];
    var blocked_chats = [];
    blocked_chats = await Connection.find({chat_initiator:req.user.username, started:true, blocked:true, blocked_by: req.user.username});
    blocked_chats = blocked_chats.concat(await Connection.find({conn_user:req.user.username, started:true, blocked:true, blocked_by: req.user.username}));
    
    for(i=0; i<blocked_chats.length;i++){
        x = blocked_chats[i];

        if(x.chat_initiator == req.user.username )
            u = await User.findOne({username: x.conn_user});
        else{
            u = await User.findOne({username: x.chat_initiator});
        }
        
        if(req.user.type == "farmer"){
            if(u != null && u.type == "buyer"){
                block = await Buyer.findById(u._id);
                
            }
            else if(u != null && u.type == "investor"){
                block = await Investor.findById(u._id);
            }
            else if(u != null && u.type == "institution"){
                block = await Institution.findById(u._id);
            }
        
            if(block != undefined)
                block.room_id = blocked_chats[i]._id;
        }

        else {
            block = await Farmer.findById(u._id);
            crops = await Crop.find({user_id:u._id});
            block.room_id = blocked_chats[i]._id;
            c ="";
            for(j = 0; j<crops.length;j++){
                c += crops[j].cropname + " ";
            }
            block.crops = c;
        }
        
        if(block != null)
            blocked.push(block);
    }
    for(i=0; i< connections.length; i++){
        x = connections[i];
        if(req.user.type == "farmer"){
            u = await User.findOne({username: x.chat_initiator});
            if(u != null && u.type == "buyer"){
                b = await Buyer.findById(u._id);
                b.room_id = connections[i]._id;
                unread = await Chat.find({sender:u.username, receiver:req.user.username, notified:false});
                b.notifs = unread.length;
                buyer.push(b);
            }
            else if(u!= null && u.type == "investor"){
                inv = await Investor.findById(u._id);
                inv.room_id = connections[i]._id;
                deals = await Deal.find({farmer_id: req.user._id, other_username: u.username, farmer_locked:true});
                unread = await Chat.find({sender:u.username, receiver:req.user.username, notified:false});
                inv.notifs = unread.length;
                investor.push(inv);  
            }
            else{
                ins = await Institution.findById(u._id);
                ins.room_id = connections[i]._id;
                deals = await Deal.find({farmer_id: req.user._id, other_username: u.username, farmer_locked:true});
                unread = await Chat.find({sender:u.username, receiver:req.user.username, notified:false});
                ins.notifs = unread.length;
                institution.push(ins);
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
            farmer.push(f);   
        }
    }

    if(req.user.type == "farmer")
        res.render('chat_app_farmer', {buyer, investor, institution, user:req.user, blocked});
    else if(req.user.type == "buyer")
        res.render('chat_app_buyer', {farmer, user:req.user, blocked});
    else
        res.render('chat_app', {farmer, user:req.user, blocked});
});

router.route('/chat/block/:id').get(auth, async(req, res) => {
    try{
       
        const user = req.user;
        const other_user = await User.findById(req.params.id);
        if(other_user == null){
            req.flash('messageFailure', 'No such user');
            throw new Error();
        }
        var conn = await Connection.findOne({chat_initiator:user.username, conn_user: other_user.username, started:true, blocked:false});
        
        if(conn == null){
            conn = await Connection.findOne({chat_initiator:other_user.username, conn_user: user.username, started:true, blocked:false});
        }
        
        if(conn == null){
            req.flash('messageFailure', 'Cannot block this user');
            throw new Error();
        }
        conn.blocked = true;
        conn.blocked_by = req.user.username;
        await conn.save();
        req.flash('messageSuccess', 'User blocked');
        res.redirect('/users/chat');
    }catch(e){
        res.redirect('/users/chat');
    }
});

router.route('/chat/unblock/:id').get(auth, async(req, res) => {
    
    try{
        var other_user = await User.findById(req.params.id);
        if(other_user == null){
            req.flash('messageFailure', 'This user does not exists');
            throw new Error();
        }
        var conn = await Connection.findOne({chat_initiator:req.user.username, conn_user: other_user.username,started:true, blocked:true, blocked_by:req.user.username });
        if(conn == null){
            conn = await Connection.findOne({chat_initiator:other_user.username, conn_user: req.user.username,started:true, blocked:true, blocked_by:req.user.username });
        }
        if(conn == null){
            req.flash('messageFailure', 'This chat cannot be unblocked');
            throw new Error();
        }
        conn.blocked = false;
        conn.blocked_by = "";
        await conn.save();
        req.flash('messageSuccess', 'User unblocked!');
        res.redirect('/users/chat/');
    }
    catch(e){
        res.redirect('/users/chat');
    }
});

router.route('/viewfarmers').get(auth, async (req, res) => {
    try{
        if(req.user.type == "investor" || req.user.type == "buyer" || req.user.type == "institution"){
            var users, farmers;
            farmers = await User.find({is_verified:true, type:"farmer"});
            var profiles = [], users = [];
            var crops, f1, f2;
            var c1 = "";
            var c2 = "";
            var i;
            for(i=0; i<farmers.length; i++){
                if(req.user.type == "investor" || req.user.type == "institution")
                    f1 = await Farmer.findOne({_id:farmers[i]._id, investor_req:true});
                else
                    f1 = await Farmer.findOne({_id:farmers[i]._id, buyer_req:true});
                if(f1 != null)
                    users.push(f1);
            }
            users.sort((a,b) => {
                if(a.rating > b.rating)
                    return -1;
                else
                    return 1;
            })
            for(i=0; i<users.length;i+=2){
                c1="";
                c2="";
                crops = await Crop.find({user_id:users[i]._id});
                for(var j=0; j < crops.length;  j++){
                    c1 += crops[j].cropname + ", ";
                }
                c1 = c1.substring(0, c1.length - 2);
                if(users[i+1] != undefined){
                    crops = await Crop.find({user_id:users[i+1]._id});
                    for(var j=0; j < crops.length;  j++){
                        c2 += crops[j].cropname + ", ";
                    }
                    c2 = c2.substring(0, c2.length - 2);
                    
                    profiles.push({1:users[i], 2:c1, 3:users[i+1], 4:c2});
                }
                else
                    profiles.push({1:users[i], 2:c1});
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

router.route('/filter').post(auth, async (req, res) => {
    var users, farmers=[], profiles = [], hashmap = new Object();;
    try{
        var criteria = req.body.sortby;
        if(criteria == "username"){
            var username = req.body.search;
            
            users = await User.findOne({username, type:"farmer"});
            if(users == null){
                req.flash('messageFailure', 'No such user found');
                throw new Error();
            }
            farmers = await Farmer.find({_id:users._id});
            if(users == null){
                req.flash('messageFailure', 'No match found');
                throw new Error();
            }
        }
        else if(criteria == "location"){
            var location = req.body.search;
            farmers = await Farmer.find({location:{$regex:location, $options:'i'}});
            if(farmers.length == 0){
                req.flash('messageFailure', 'No match found');
                throw new Error();
            }   
        }
        else if(criteria == "rating"){
            var rating = req.body.search;
                farmers = await Farmer.find({rating:{$gte:rating}});
                if(farmers.length == 0){
                    req.flash('messageFailure', 'No match found');
                    throw new Error();
                }   
        }
        else if(criteria == "area"){
            var land_area = req.body.search;
            
                farmers = await Farmer.find({land_area:{$gte:land_area}});
                if(farmers.length == 0){
                    req.flash('messageFailure', 'No match found');
                    throw new Error();
                } 
        }
        else if(criteria == "crops"){
            var crop = req.body.search;
            var crops = crop.split(' ');
            if(crops.length == 1){
                crops = crop.split(',');
            }
            for(var i=0; i< crops.length; i++){
                crops_array = await Crop.find({cropname: { $regex: new RegExp(crops[i].replace(/(?:es|[sx])$/, '') + '(?:es|[sx])?'), $options: 'i' }});/*for singular and plural values*/
                for(var j=0; j < crops_array.length;j++){
                    users = await Farmer.findById(crops_array[j].user_id);
                    if(users != undefined && users != null){
                        hashmap[users._id] = users;
                    }
                        
                }
            }
            for(var i in hashmap){
                farmers.push(hashmap[i]);
            }
        }
        else if(criteria == "deals"){
            var deals = req.body.search;
                farmers = await Farmer.find({deals:{$gte:deals}});
                if(farmers.length == 0){
                    req.flash('messageFailure', 'No match found');
                    throw new Error();
                }
            
                
        }
        else if(criteria == "orders"){
            var orders = req.body.search;
                farmers = await Farmer.find({orders:{$gte:orders}});
                if(farmers.length == 0){
                    req.flash('messageFailure', 'No match found');
                    throw new Error();
                }
            
        }
        if(req.user.type == "investor" || req.user.type == "institution"){
            farmers = farmers.filter( (f) => {
                 return f.investor_req == true;
             })
         }
         else{
             farmers = farmers.filter( (f) => {
                 return f.buyer_req == true;
             })
         }
        for(var i=0; i<farmers.length;i+=2){
            c1="";
            c2="";
            crops = await Crop.find({user_id:farmers[i]._id});
            for(var j=0; j < crops.length;  j++){
                c1 += crops[j].cropname + ", ";
            }
            c1 = c1.substring(0, c1.length - 2);
            if(farmers[i+1] != undefined){
                crops = await Crop.find({user_id:farmers[i+1]._id});
                for(var j=0; j < crops.length;  j++){
                    c2 += crops[j].cropname + ", ";
                }
                c2 = c2.substring(0, c2.length - 2);
                
                profiles.push({1:farmers[i], 2:c1, 3:farmers[i+1], 4:c2});
            }
            else
                profiles.push({1:farmers[i], 2:c1});
        }
        res.render('viewfarmers', {profiles, user:req.user});
    }
    catch(e){
        res.redirect('/users/viewfarmers');
    }
});
router.route('/viewfullprofile').get((req, res) => {
    res.render('viewfullprofile');
});

router.route('/viewfullprofile/:id').get(auth, async (req, res) => {
    try{
        const user = req.user;
        const farmer = await Farmer.findById(req.params.id);
        
        if(farmer == null){
            req.flash('messageFailure', "No such farmer");
            throw new Error();
        }
        const crops = await Crop.find({user_id:farmer._id});
        res.render('viewfullprofile', {farmer, user, crops});
    }
    catch(e){
        res.redirect('viewfarmers');
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
        const username_regex = /^[A-Za-z0-9_]*$/;
        if(username.match(username_regex) == null || username.length < 3){
            req.flash('messageFailure', 'Username length should be atleast 3 and it should contain only alphanumeric and _ characters');
            throw new Error();
        }
        const password = req.body.password;
        const password2 = req.body.password2;
        if(password != password2){
            req.flash('messageFailure', 'Please enter same password in both fields');
            throw new Error();
        }
        if(password.length < 6){
            req.flash('messageFailure', 'Please enter a password with atleast 6 characters');
            throw new Error();
        }
        const fullname = req.body.registername;
        if(fullname.match('^[\.a-zA-Z ]*$') == null){
            req.flash('messageFailure', 'Fullname should contain only alphabets and spaces');
            throw new Error();
        }
        const hashedPassword = await bcrypt.hash(password, 8);
        const email = req.body.email;
        const start = req.body.startingrange;
        const end = req.body.endingrange;
        if(start > end){
            req.flash('messageFailure', "Please enter valid starting and ending amount");
            throw new Error();
        }
        const pan_number = req.body.pannumber;
        var regpan = /^([A-Z]){5}([0-9]){4}([A-Z]){1}?$/;
        if(!regpan.test(pan_number)){
            req.flash('messageFailure', "Please enter valid PAN number");
            throw new Error();
        }
        const type = "investor";
        const is_verified = false;
        const deals = 0;
        const income_statement = req.file.buffer;
        if (!req.file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            req.flash('messageFailure', "Please upload a jpg/jpeg/png image with max size 1MB");
            throw new Error();
        }
        const {ext, mime} = await (FileType.fromBuffer(income_statement));
        const filetype = mime;
        const bString = ab2str(income_statement.buffer, 'base64');
        const profit_share = 0;
        const newUser = new User({ username, password: hashedPassword, email, type, is_verified });
        await newUser.save();
        const user_id = newUser._id;
        const investor = new Investor({ _id: user_id, fullname, deals,  income_statement:bString, income_statement_type:filetype,start, end, pan_number, profit_share});
        await investor.save();
        res.redirect("success");
    }
    catch(err){
        if(err.code == 11000)
            req.flash('messageFailure', "Username or email ID already exists");
        res.redirect('/users/registerinvestor');
    }
});


router.route('/registerinstitution').get((req, res) => {
    res.render('registerinstitution');
});

router.route('/registerinstitution').post(upload.single('businessproof'), async (req, res) => {
    try{
        const username = req.body.username;
        const username_regex = /^[A-Za-z0-9_]*$/;;
        if(username.match(username_regex) == null || username.length < 3){
            req.flash('messageFailure', 'Username length should be atleast 3 and it should contain only alphanumeric and _ characterss');
            throw new Error();
        }
        const password = req.body.password;
        const password2 = req.body.password2;
        if(password != password2){
            req.flash('messageFailure', 'Please enter same password in both fields');
            throw new Error();
        }
        if(password.length < 6){
            req.flash('messageFailure', 'Please enter a password with atleast 6 characters');
            throw new Error();
        }
        const fullname = req.body.registername;
        if(fullname.match('^[\.a-zA-Z ]*$') == null || username.length < 3){
            req.flash('messageFailure', 'Fullname should contain only alphabets and spaces');
            throw new Error();
        }
        const hashedPassword = await bcrypt.hash(password, 8);
        const email = req.body.email;
        const start = req.body.startingrange;
        const end = req.body.endingrange;
        if(start > end){
            req.flash('messageFailure', "Please enter valid starting and ending amount");
            throw new Error();
        }
        const business_proof = req.file.buffer;
        if (!req.file.originalname.match(/\.(jpg|jpeg|png)$/) || !req.file.size > 1000000) {
            req.flash('messageFailure', "Please upload a jpg/jpeg/png image with max size 1MB");
            throw new Error();
        }
        const type = "institution";
        const is_verified = false;
        const deals = 0;
        const {ext, mime} = await (FileType.fromBuffer(business_proof));
        const filetype = mime;
        const bString = ab2str(business_proof.buffer, 'base64');
        const newUser = new User({ username, password: hashedPassword, email, type, is_verified });
        await newUser.save();
        const user_id = newUser._id;
        const institution = new Institution({ _id: user_id, fullname, deals, business_proof:bString, business_proof_type:filetype,start, end});
        await institution.save();
        res.redirect("success");
    }
    catch(err){
        if(err.code == 11000)
            req.flash('messageFailure', "Username or email ID already exists");
        res.redirect('/users/registerinstitution');
    }
});


router.route('/registerbuyer').get((req, res) => {
    res.render('registerbuyer');
});

router.route('/registerbuyer').post(upload.single('pancard'), async (req, res) => {
    try{
        const username = req.body.username;
        const username_regex = /^[A-Za-z0-9_]*$/;
        if(username.match(username_regex) == null || username.length < 3){
            req.flash('messageFailure', 'Username length should be atleast 3 and it should contain only alphanumeric and _ characters');
            throw new Error();
        }
        const password = req.body.password;
        const password2 = req.body.password2;
        if(password != password2){
            req.flash('messageFailure', 'Please enter same password in both fields');
            throw new Error();
        }
        if(password.length < 6){
            req.flash('messageFailure', 'Please enter a password with atleast 6 characters');
            throw new Error();
        }
        const fullname = req.body.registername;
        if(fullname.match('^[\.a-zA-Z ]*$') == null){
            req.flash('messageFailure', 'Fullname should contain only alphabets and spaces');
            throw new Error();
        }
        const hashedPassword = await bcrypt.hash(password, 8);
        const email = req.body.email;
        const pan_number = req.body.pannumber;
        var regpan = /^([A-Z]){5}([0-9]){4}([A-Z]){1}?$/;
        if(!regpan.test(pan_number)){
            req.flash('messageFailure', "Please enter valid PAN number");
            throw new Error();
        }
        const requirements = req.body.requirements;
        const type = "buyer";
        const is_verified = false;
        const orders = 0;
        const pan_card = req.file.buffer;
        if (!req.file.originalname.match(/\.(jpg|jpeg|png)$/) || !req.file.size > 1000000) {
            req.flash('messageFailure', "Please upload a jpg/jpeg/png image with max size 1MB");
            throw new Error();
        }
        const {ext, mime} = await (FileType.fromBuffer(pan_card));
        const filetype = mime;
        const bString = ab2str(pan_card.buffer, 'base64');
        const newUser = new User({ username, password: hashedPassword, email, type, is_verified });
        await newUser.save();
        const user_id = newUser._id;
        const buyer = new Buyer({_id:user_id, fullname, pan_number, orders, pan_card:bString, pan_card_type:filetype, requirements });
        await buyer.save();
        res.redirect("success");
    }
    catch(err){
        if(err.code == 11000)
            req.flash('messageFailure', "Username or email ID already exists");
        res.redirect('/users/registerbuyer');
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
        else if(user != null && user.is_verified == false){
            req.flash('messageFailure', "Your account has not been verified yet");
            throw new Error();
        }
        else{
            req.flash('messageFailure', "Invalid login credentials! Please enter correct username and password.");
            throw new Error();
        }    
    }
    catch (e) {
        res.redirect('/');
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
        req.flash('messageFailure', "Logout failed");
        res.redirect("/");
    }

});

router.route('/logoutall').get(auth, async (req, res) => {
    try {
        req.user.tokens = [];
        await req.user.save();
        res.redirect("/");
    }
    catch (e) {
        req.flash('messageFailure', "Logout failed");
        res.redirect("/");
    }

});

router.route('/dashboard').get(auth, async(req,res) => {
    try{
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
        else{
            throw new Error();
        }
    }
    catch(e){
        req.flash('messageFailure', "User dashboard not available");
        res.redirect("/");
    }
});
router.route('/deal_lock').post(auth, async(req,res) => {
    try{
        const farmer_user = req.body.farmerusername;
        const farmer = await User.findOne({username:farmer_user});
        if(farmer == null || farmer.length == 0){
            req.flash('messageFailure', "Farmer with this username does not exist");
            throw new Error();
        }
        const farmer_id = farmer._id;
        const other_username = req.user.username;
        const farmer_locked = false;
        const newdeal = new Deal({farmer_id, other_username, farmer_locked});
        await newdeal.save();
        req.flash('messageSuccess', 'Deal request sent successfully');
        res.redirect("dashboard");
    }
    catch(e){
        res.redirect("dashboard");
    }

});


router.route('/crop_requirements').post(auth, async(req, res) => {
    try{
        if(req.body.croprequirements.match('^[\.a-zA-Z, ]*$') == null){
            req.flash('messageFailure', 'Crop names should contain only alphabets, commas and spaces');
            throw new Error();
        }
        if(req.user.type == "buyer"){
            const buyer = await Buyer.findById(req.user._id);
            buyer.requirements = req.body.croprequirements;
            await buyer.save();
        }
        else if(req.user.type == "institution"){
            const institution = await Institution.findById(req.user._id);
            institution.requirements = req.body.croprequirements;
            await institution.save();
        }
        else{
            req.flash('messageFailure', 'Crop requirements can be updated only by buyers and institutions');
            throw new Error();
        }
        req.flash('messageSuccess', 'Crop requirements updated successfully');
        res.redirect('dashboard');
    }
    catch(err){
        //req.flash('messageFailure', 'Error occured while updating crop requirememts');
        res.redirect('dashboard');
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
        req.flash('messageFailure', 'Profile cannot be updated');
        res.redirect('dashboard');
    }
});

router.route('/updateprofile').post(auth, async(req, res) => {
    try{
        if(req.user.type == "investor"){
            const investor = await Investor.findById(req.user._id);
            const user = await User.findById(req.user._id);
            const fullname = req.body.registername;
            if(fullname.match('^[\.a-zA-Z ]*$') == null){
                req.flash('messageFailure', 'Fullname should contain only alphabets and spaces');
                throw new Error();
            }
            const email = req.body.email;
            const start = req.body.startingrange;
            const end = req.body.endingrange;
            if(start > end){
                req.flash('messageFailure', "Please enter valid starting and ending amount");
                throw new Error();
            }
            investor.fullname = fullname;
            investor.start = start;
            investor.end = end;
            user.email = email;
            await user.save();
            await investor.save();
        }
    
        else if(req.user.type == "institution"){
            const institution = await Institution.findById(req.user._id);
            const user = await User.findById(req.user._id);
            const fullname = req.body.registername;
            if(fullname.match('^[\.a-zA-Z ]*$') == null){
                req.flash('messageFailure', 'Fullname should contain only alphabets and spaces');
                throw new Error();
            }
            const email = req.body.email;
            const start = req.body.startingrange;
            const end = req.body.endingrange;
            if(start > end){
                req.flash('messageFailure', "Please enter valid starting and ending amount");
                throw new Error();
            }
            institution.fullname = fullname;
            institution.start = start;
            institution.end = end;
            user.email = email;
            await user.save();
            await institution.save();
        }
    
        else if(req.user.type == "buyer"){
            const buyer = await Buyer.findById(req.user._id);
            const user = await User.findById(req.user._id);
            const fullname = req.body.registername;
            if(fullname.match('^[\.a-zA-Z ]*$') == null){
                req.flash('messageFailure', 'Fullname should contain only alphabets and spaces');
                throw new Error();
            }
            const email = req.body.email;
            const requirements = req.body.croprequirements;
            if(req.body.croprequirements.match('^[\.a-zA-Z, ]*$') == null){
                req.flash('messageFailure', 'Crop names should contain only alphabets, commas and spaces');
                throw new Error();
            }
            buyer.fullname = fullname;
            buyer.requirements = requirements;
            user.email = email;
            await user.save();
            await buyer.save();
        }

        else if(req.user.type == "farmer"){
            const farmer = await Farmer.findById(req.user._id);
            const user = await User.findById(req.user._id);
            const fullname = req.body.registername;
            if(fullname.match('^[\.a-zA-Z ]*$') == null){
                req.flash('messageFailure', 'Fullname should contain only alphabets and spaces');
                throw new Error();
            }
            const email = req.body.email;
            var buyer_req = req.body.buyer;
            if (buyer_req == 0) {
                buyer_req = false;
            }
            else {
                buyer_req = true;
            }
            var investor_req = req.body.investor;
            if (investor_req == 0) {
                investor_req = false;
            }
            else {
                investor_req = true;
            }
            farmer.fullname = fullname;
            farmer.buyer_req = buyer_req;
            farmer.investor_req = investor_req;
            user.email = email;
            await user.save();
            await farmer.save();
        }
        else{
            throw new Error();
        }
        req.flash('messageSuccess', 'Profile updated successfully');
        res.redirect('dashboard');
    }
    catch(err){
        req.flash('messageFailure', 'Profile updation failed.');
        res.redirect('dashboard');
    }
});



module.exports = router;