const mongoose = require('mongoose');
const validator = require('validator');
const Schema = mongoose.Schema;
const orderSchema = new Schema({
    farmer_id:{
        
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