const mongoose = require('mongoose');
const validator = require('validator');
const { ObjectId } = require('bson');
const Schema = mongoose.Schema;
const ratingSchema = new Schema({
    farmer_username:{
        type:String
    },
    buyer_id:{
        type:ObjectId
    },
    rating:{
        type:Number,
        max:5,
        default:0
    },
    given:{                /* has the buyer given the rating */
        type:Boolean,
        default:false
    },
});



const Rating = mongoose.model('Rating', ratingSchema);
module.exports = Rating;