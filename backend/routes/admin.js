const router = require('express').Router();
const auth = require("../middleware/auth");
var nodemailer = require('nodemailer');
let User = require('../models/user.model');
let Farmer = require('../models/farmer.model');
let Investor = require('../models/investor.model');
let Buyer = require('../models/buyer.model');
let Institution = require('../models/institution.model');
var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'organiquefarm@gmail.com',
    pass: 'Abcdef@123'
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

router.route('/dashboard').get( auth, async(req,res) => {
    var users = await User.find({is_verified:false});
    res.render('admin_dashboard', {users});
});
router.route('/verify_profile/:id').get(async (req, res) => {
    var user = await User.findById(req.params.id);
    var profile;
    if(user.type == "farmer"){
      profile = await Farmer.findById(req.params.id);
    }
    else if(user.type == "investor"){
      profile = await Investor.findById(req.params.id);
    }
    else if(user.type == "buyer"){
      profile = await Buyer.findById(req.params.id);
    }
    else if(user.type == "institution"){
      profile = await Institution.findById(req.params.id);
    }
    else{
      profile = null;
    }
    res.render('verify_profile', {profile, user});
});

router.route('/accept/:id').get(auth, async (req,res) => {
  var user = await User.findOne({_id:req.params.id});
  console.log(user.email);
  var mailOptions = {
    from: 'organiquefarm@gmail.com',
    to: user.email,
    subject: 'Profile verification',
    text: 'Your profile has been verified. Head over to the website to login and complete/ update your profile and avail the benefits of our portal.'
  };
  
  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
  user.is_verified = true;
  await user.save();
  res.redirect('/admin/dashboard');
});

router.route('/reject/:id').get(auth, async (req,res) => {
  var user = await User.findOne({_id:req.params.id});
  var mailOptions = {
    from: 'organiquefarm@gmail.com',
    to: user.email,
    subject: 'Profile verification',
    text: 'Your profile verification was not successful.'
  };

  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
  if(user.type == "farmer"){
     await Farmer.deleteOne({_id:req.params.id});
  }
  else if(user.type == "investor"){
    await Investor.deleteOne({_id:req.params.id});
  }
  else if(user.type == "buyer"){
    await Buyer.deleteOne({_id:req.params.id});
  }
  else if(user.type == "institution"){
    await Institution.deleteOne({_id:req.params.id});
  }
  await User.deleteOne({_id:req.params.id});
  
  res.redirect('/admin/dashboard');
});
module.exports = router;