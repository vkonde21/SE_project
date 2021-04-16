const mongoose = require('mongoose');
const validator = require('validator');
const { ObjectId } = require('bson');
const Schema = mongoose.Schema;
const orderSchema = new Schema({
    farmer_id:{
        type:ObjectId
    },
    buyer_username:{
        type: String
    },
    farmer_locked:{
        type:Boolean,
        default:false
    }, 
    notified:{
        type:Boolean,
        default:false
    },
    requirements:{
        type:String,
    }
});



const Order = mongoose.model('Order', orderSchema);
module.exports = Order;