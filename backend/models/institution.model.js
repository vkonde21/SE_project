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
    
    business_proof:{
        type:String,
        required:true,
    }, 

    requirements:{
        type:String,
    }
    
});



const Institution= mongoose.model('Institution', institutionSchema);
module.exports = Institution;