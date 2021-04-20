const mongoose = require('mongoose');
const { ObjectId } = require('bson');
const Schema = mongoose.Schema;
const chatSchema = new Schema({
    sender:{
        type:ObjectId
    },
    receiver:{
        type:ObjectId
    },
    conn_user_name:{
        type:String, //fullname of other user
    }
});
const Connection = mongoose.model('Connection', connectionSchema);
module.exports = Connection;