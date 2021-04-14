const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Schema = mongoose.Schema;
const institutionSchema = new Schema({
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
    
    income_statement:{
        type:Buffer,
        required:true,
    }, 
    
});



const Institution= mongoose.model('Institution', institutionSchema);
module.exports = Institution;