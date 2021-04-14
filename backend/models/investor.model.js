const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Schema = mongoose.Schema;
const investorSchema = new Schema({
    fullname:{
        type:String,
        required:true
    },
    deals:{
        type: Number,
    },
    
    land_area:{
        type:Number,
        required:true,
    },
    land_doc:{
        type:Buffer,
        required:true,
    }, 
    certificate:{
        type:Buffer,
        required:true
    }
});



const Investor= mongoose.model('Investor', investorSchema);
module.exports = Investor;