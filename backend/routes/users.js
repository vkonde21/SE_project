const router = require('express').Router();
let User = require('../models/user.model');
let Farmer = require('../models/farmer.model');
const bcrypt = require('bcrypt');
const auth = require("../middleware/auth");
const multer = require("multer");
/* to avoid saving the file on the local file system remove the dest parameter from multer*/
const upload = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        if (file.fieldname == "landpaper" || file.fieldname == "certificate") {
            if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
                return cb(new Error('Please upload an image'))
            }
            cb(undefined, true)
        }


    }
})

//localhost:5000/users/
router.route('/me').get(auth, (req, res) => {
    res.send(req.user);
});

router.get('/register', (req, res) => res.render('register'));


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
        res.render('homepage', { msg: "Registration completed successfully" });
    }
    catch (err) {
        res.status(400).json('error: ' + err)
    }


});
router.route('/registerfarmer').get((req, res) => {
    res.render('registerfarmer');
});
router.route('/registerinvestor').get((req, res) => {
    res.render('registerinvestor');
});
router.route('/registerinstitution').get((req, res) => {
    res.render('registerinstitution');
});
router.route('/registerbuyer').get((req, res) => {
    res.render('registerbuyer');
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
            res.render('dashboard', { user, token: token, title: "dashboard" });
        }
        else{
            /*get the list of users who are not verified*/
            res.render('admin_dashboard', { user, title: "dashboard" });
        }
        
    }
    catch (e) {
        res.status(400).send();
    }
});

router.route('/logout').post(auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token;
        });
        await req.user.save();
        res.render("homepage");
    }
    catch (e) {
        res.status(500).send({ error: "Logout failed!" });
    }

});

router.route('/logoutall').post(auth, async (req, res) => {
    try {
        req.user.tokens = [];
        await req.user.save();
        res.render("homepage");
    }
    catch (e) {
        res.status(500).send({ error: "Logout failed!" });
    }

});

module.exports = router;