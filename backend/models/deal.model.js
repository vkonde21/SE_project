const mongoose = require('mongoose');
const validator = require('validator');
const { ObjectId } = require('bson');
const Schema = mongoose.Schema;
const dealSchema = new Schema({
    farmer_id:{
        type:ObjectId
    },
    other_id:{
        type:ObjectId
    },
    farmer_locked:{
        type:Boolean
    }
});

const Deal = mongoose.model('Deal', dealSchema);
module.exports = Deal;