const mongoose = require('mongoose');
const validator = require('validator');
const { ObjectId } = require('bson');
const Schema = mongoose.Schema;
const dealSchema = new Schema({
    farmer_id:{
        type:ObjectId
    },
    other_username:{
        type:String
    },
    farmer_locked:{
        type:Boolean
    }, 
    notified:{
        type:Boolean,
        default:false
    }
});

const Deal = mongoose.model('Deal', dealSchema);
module.exports = Deal;