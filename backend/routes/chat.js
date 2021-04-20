const auth = require('../middleware/auth');
const User = require('../models/user.model');
const Chat = require('../models/chat.model');
const Connection = require('../models/connection.model');
const router = require('express').Router();


router.route('/:id/:room_id').get(auth, async(req, res) => {
    //generate a random objectId and send
    const user = await User.findById(req.params.id);
    var room;
    if(user == undefined || user == null)
        render('error');
    //send all the previous messages
    if(req.user.type == "farmer")
        room = await Connection.find({chat_initiator: user.username, conn_user: req.user.username})
    else{
        room = await Connection.find({chat_initiator: req.user.username, conn_user: user.username})
    }
    
    var msgs = await Chat.find({$or:[{sender:req.user.username, receiver:user.username}, {receiver:req.user.username, sender:user.username}]}).sort({time:1});
    for(var i=0; i<msgs.length; i++){
        if(msgs[i].sender == req.user.username){
            msgs[i].send = "y";
        }
        else{
            msgs[i].send = "n"
        }
    }
    res.render('chat', {curr_user:req.user, other_user: user,  msgs, room_id:room._id});

});

//for /chat i.e / display a table of initiated chats
module.exports = router;