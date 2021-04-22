const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Schema = mongoose.Schema;
const farmerSchema = new Schema({
    fullname:{
        type:String,
        required:true
    },
    deals:{
        type: Number,
    },
    orders:{
        type:Number,
    },
    buyer_req:{
        type:Boolean,
    },
    investor_req:{
        type:Boolean,
    },
    rating:{
        type:Number,
    }, 
    land_area:{
        type:Number,
        required:true,
    },
    land_doc:{
        type:String,
        required:true,
    }, 
    certificate:{
        type:String,
        required:true
    },
    land_doc_type:{
        type:String
    },
    certificate_type:{
        type:String
    }
});



const Farmer = mongoose.model('Farmer', farmerSchema);
module.exports = Farmer;