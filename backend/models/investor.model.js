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
    
    start:{
        type:Number,
        required:true,
    },
    end:{
        type:Number,
        required:true,
    },
    pan_number:{
        type:String,
        required:true,
    },
    income_statement:{
        type:String,
        required:true,
    }, 
    income_statement_type:{
        type:String
    },
    profit_share:{
        type:Number
    }
});



const Investor= mongoose.model('Investor', investorSchema);
module.exports = Investor;