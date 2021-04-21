const router = require('express').Router();
const auth = require("../middleware/auth");
var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'organiquefarm@gmail.com',
    pass: 'Abcdef@123'
  }
});

var mailOptions = {
  from: 'organiquefarm@gmail.com',
  to: 'aryagandhi1@gmail.com',
  subject: 'Profile verified',
  text: 'Your profile has be verified. Head over to the website to login and complete/ update your profile and avail the benefits of our portal.'
};

transporter.sendMail(mailOptions, function(error, info){
  if (error) {
    console.log(error);
  } else {
    console.log('Email sent: ' + info.response);
  }
});

router.route('/dashboard').get( async(req,res) => {
    res.render('admin_dashboard');
});
router.route('/verify_profile').get((req, res) => {
    res.render('verify_profile');
});
module.exports = router;