const router = require('express').Router();
let User = require('../models/user.model');
const bcrypt = require('bcrypt');
const auth = require("../middleware/auth");
//localhost:5000/users/
router.route('/me').get(auth, (req, res) => {
    res.send(req.user);
});

router.get('/register',  (req, res) => res.render('register'));
//localhost:5000/users/register
router.route('/register').post(async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    const hashedPassword = await bcrypt.hash(password, 8);
    const email = req.body.email;
    const type = req.body.type;
    const is_verified = false;
    const newUser = new User({username, password:hashedPassword, email, type, is_verified});
    /* for matching the passwords
    const isMatch = bcrypt.compare('plain', hashedpass);
    if(isMatch){
        //passwords matched
    }*/
    newUser.save()
      .then(async () => {const token = await newUser.generateAuthToken();
        res.json({"msg":'User added!', token})})
      .catch(err => res.status(400).json('error: ' + err));
      
  });

router.route('/login').post(async (req, res) => {
    
    try{
        const user = await User.findByCredentials(req.body.username, req.body.password); /*user defined method; check user.model.js*/
        const token = await user.generateAuthToken();
        res.send({user, token: token});
    }
    catch(e){
        res.status(400).send();
    }
});

router.route('/logout').post(auth, async (req, res) => {
    try{
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token;
        });
        await req.user.save();
        res.send();
    }
    catch(e){
        res.status(500).send({error:"Logout failed!" });
    }

});

router.route('/logoutall').post(auth, async (req, res) => {
    try{
        req.user.tokens = [];
        await req.user.save();
        res.send();
    }
    catch(e){
        res.status(500).send({error:"Logout failed!" });
    }

});
  
  module.exports = router;