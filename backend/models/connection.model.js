const mongoose = require('mongoose');


const Schema = mongoose.Schema;
const connectionSchema = new Schema({
    chat_initiator:{
        type:String   //username
    },
    conn_user:{
        type:String
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
        message: 'creating new chat room',
      };
    }
    return {
      isNew: false,
      message: 'old chatroom'};
  } catch (error) {
    console.log('error on start chat method', error);
    throw error;
  }
}
const Connection = mongoose.model('Connection', connectionSchema);
module.exports = Connection;