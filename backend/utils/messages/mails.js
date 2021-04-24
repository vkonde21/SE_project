
const nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'organiquefarm@gmail.com',
      pass: 'Abcdef@123'
    }
  });


module.exports = {
     transporter
}