const mongoose = require('mongoose');
const validator = require('validator');
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
        required:true,
    },
    pan_card:{
        type:String,
        required:true
    },
    pan_card_type:{
        type:String
    },
    requirements:{
        type:String,
        required:true
    }
});



const Buyer = mongoose.model('Buyer', buyerSchema);
module.exports = Buyer;