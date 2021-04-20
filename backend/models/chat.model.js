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
    },
    chat_msg:{
        type:String,
    },
    notified:{
        type:Boolean,
        default:false
    }
});
const Chat = mongoose.model('Chat', chatSchema);
module.exports = Chat;