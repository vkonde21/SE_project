const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Schema = mongoose.Schema;
const buyerSchema = new Schema({
    fullname:{
        type:String,
        required:true
    },
    orders:{
        type:Number,
    },
    
    pan_number:{
        type:String,
        required:true
    },
    pan_card:{
        type:Buffer,
        required:true
    },
    requirements:{
        type:String,
        required:true
    }
});



const Buyer = mongoose.model('Buyer', buyerSchema);
module.exports = Buyer;