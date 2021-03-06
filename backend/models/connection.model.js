const mongoose = require('mongoose');


const Schema = mongoose.Schema;
const connectionSchema = new Schema({
    chat_initiator:{
        type:String   //username
    },
    conn_user:{
        type:String
    },
    started:{
      type:Boolean,
      default:false
    },
    blocked:{
      type:Boolean,
      default:false
    },
    blocked_by:{
      type:String //username of user who blocked the chat
    }
}, 
{
    timestamps:true
});



connectionSchema.statics.initiateChat = async function (
	conn_user, chat_initiator
) {
  try {
    var availableRoom = await this.findOne({
      conn_user, chat_initiator
    });
    if(!availableRoom){
      availableRoom = await this.findOne({
        conn_user:chat_initiator, chat_initiator:conn_user
      });
    }
    if (!availableRoom) {
      const newRoom = await this.create({ conn_user, chat_initiator })
      return {
        isNew: true,
        room:newRoom,
        message: 'creating new chat room',
      };
    }
    
    return {
      isNew: false,
      room:availableRoom,
      message: 'old chatroom'};
  } catch (error) {
    console.log('error on start chat method', error);
    throw error;
  }
}
const Connection = mongoose.model('Connection', connectionSchema);
module.exports = Connection;