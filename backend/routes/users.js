const router = require('express').Router();
let User = require('../models/user.model');
let Farmer = require('../models/farmer.model');
let Investor = require('../models/investor.model');
let Buyer = require('../models/buyer.model');
let Institution = require('../models/institution.model');
let Crop = require('../models/crop.model');
let Deal = require('../models/deal.model');
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

//localhost:5000/users/
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
        //console.log(req.files);
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
        const is_verified = false;
        const rating = 0;
        const deals = 0;
        const orders = 0;
        const land_doc = req.files["landpaper"][0].buffer;
        const certificate = req.files["certificate"][0].buffer;
        /*console.log("Info");
        console.log(`username: ${username}, password: ${password}, fullname: ${fullname}, buyer_req:${buyer_req}`);
        console.log(`investor_req:${investor_req}, landarea: ${land_area}, land_doc: ${land_file}`);
        console.log(land_doc);*/
        const newUser = new User({ username, password: hashedPassword, email, type, is_verified });
        newUser.save();
        const user_id = newUser._id;
        const farmer = new Farmer({ _id: user_id, fullname, deals, orders, buyer_req, investor_req, rating, land_area, land_doc, certificate });
        farmer.save();
        res.redirect("login");
    }
    catch (err) {
        res.status(400).json('error: ' + err);
    }


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
        const profit_share = 0;
        const newUser = new User({ username, password: hashedPassword, email, type, is_verified });
        newUser.save();
        const user_id = newUser._id;
        const investor = new Investor({ _id: user_id, fullname, deals,  income_statement, start, end, pan_number, profit_share});
        investor.save();
        res.redirect("login");
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
        
        const newUser = new User({ username, password: hashedPassword, email, type, is_verified });
        newUser.save();
        const user_id = newUser._id;
        const institution = new Institution({ _id: user_id, fullname, deals, business_proof, start, end});
        institution.save();
        res.redirect("login");
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
        const newUser = new User({ username, password: hashedPassword, email, type, is_verified });
        newUser.save();
        const user_id = newUser._id;
        const buyer = new Buyer({_id:user_id, fullname, pan_number, orders, pan_card, requirements });
        buyer.save();
        res.redirect("login");
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
        const user = await User.findByCredentials(req.body.username, req.body.password); /*user defined method; check user.model.js*/
        if(user.type != "admin"){
            const token = await user.generateAuthToken();
            res.cookie("jwt", token, { secure: true, httpOnly: true })
            res.redirect ('/users/dashboard');
        }
        else{
            /*get the list of users who are not verified*/
            res.redirect({ user },'/users/dashboard');
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
            res.render('farmer_dashboard', {Crops: Crops,farmer, });
        }
            
        else{
            res.render('farmer_dashboard', {farmer});
        }
    }

    else if(req.user.type == "investor"){
        const investor = await Investor.findById(req.user._id);
        res.render('investor_dashboard', {investor});
    }

    else if(req.user.type == "institution"){
        const institution = await Institution.findById(req.user._id);
        res.render('institution_dashboard', {institution});
    }

    else if(req.user.type == "buyer"){
        const buyer = await Buyer.findById(req.user._id);
        res.render('buyer_dashboard', {buyer});
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


module.exports = router;