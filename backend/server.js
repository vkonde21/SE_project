const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser')
const hbs = require('hbs');
const multer = require('multer');
const http = require('http');
require('dotenv').config();
const uri = process.env.ATLAS_URI;
mongoose.connect(uri, {useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology:true});
const connection = mongoose.connection;
connection.once('open', () => {
    console.log("Connection established successfully");
});
let FileType = require('file-type');
const app = express();
const port = process.env.port || 5000;
const socketio = require('socket.io');
const server = http.createServer(app);
const io = socketio(server);
const {generateMessage, generateImage} = require('./utils/messages/messages');
let Connection = require('./models/connection.model');
let User = require('./models/user.model');
let Chat = require('./models/chat.model');
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); //to parse json data
app.set('view engine', 'hbs');
app.set('views', "../src/views");
app.set('view options', { layout: 'layouts/layout.hbs' });
hbs.registerHelper("section", function(name, options){
    if(!this._sections) this._sections = {};
    this._sections[name] = options.fn(this);
    return null;
});

hbs.registerHelper('ifeq', function (a, b, options) {
    if (a == b) { return options.fn(this); }
    return options.inverse(this);
});

hbs.registerHelper("multiply", function(a,b) {
    return a*b;
  });

app.use(cookieParser());
app.use(express.static("../src/public"));
const userRouter = require('./routes/users');
const farmerRouter = require('./routes/farmer');
const buyerRouter = require('./routes/buyer');
app.use('/users', userRouter);
app.use('/users', farmerRouter);
app.use('/users', buyerRouter);
app.use('/', require("./routes/index"));
app.use('/chat', require('./routes/chat'));
app.use('/admin', require('./routes/admin'));
hbs.registerPartials('../src/views/partials');
server.listen(port , () => {
    console.log(`Server listening at port ${port}`);
});
io.on('connection', (socket) => { /*specify the event and the function */
    console.log("New connection ");
    socket.on('join', ({room, username}) => {
        socket.join(room);
        socket.room = room;
        /*if(socket.usernames == undefined){
            socket.usernames = new Array(username);
        }*/
       
    });
    
    socket.on('sendMessage', async (message, image,  username,other_username, callback) => { //callback is a parameter passed by the client side.It is executed once the msg is receibed on the server side
        var msg, ch, img;
       
        var x = await Connection.initiateChat(other_username, username); //username is current user i.e sender
        if(x.room.started == false){
            x.room.started = true;
            x.room.save();
        }
        if(message != null && message.length > 0){
            msg = generateMessage(message);
            ch = new Chat({sender:username, receiver:other_username, chat_msg:msg.text, time:msg.createdAt});
        }
        if(image != null && image.length > 0){
            var d = await FileType.fromBuffer(Buffer.from(image, 'base64'));
            img = generateImage(image, d.ext);
            ch = new Chat({sender:username, receiver:other_username, img_msg:img.buffer, type:d.ext,time:img.createdAt })
        } 
        ch.save();
        const sender = await User.findOne({username:ch.sender});
        //console.log(x.message);
        if(msg == undefined ){
            msg = null;
        }
            
        if(img == undefined ){
            img = null;
        }
        io.to(socket.room).emit('message', {message:msg, sender, image:img});
            callback(msg);
        
    });
    
    
    /*socket.on('disconnect', () => {
        io.emit('message', "User left");
    });   //when a user disconnects*/
});