const mongoose = require('mongoose');
const { ObjectId } = require('bson');
const Schema = mongoose.Schema;
const chatSchema = new Schema({
    sender:{
        type:String
    },
    receiver:{
        type:String
    },
    conn_user_name:{
        type:String, //fullname of other user
    },
    chat_msg:{
        type:String,
    },
    img_msg:{
        type:String,
    },
    type:{
        type:String,
        default:"text"
    },
    img_buf:{
        type:Buffer,
    },
    notified:{
        type:Boolean,
        default:false
    }, time:{
        type:Date
    }
});
const Chat = mongoose.model('Chat', chatSchema);
module.exports = Chat;