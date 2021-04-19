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
})
const app = express();
const port = process.env.port || 5000;
const socketio = require('socket.io');
const server = http.createServer(app);
const io = socketio(server);
 
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
server.listen(port , () => {
    console.log(`Server listening at port ${port}`);
});
io.on('connection', (socket) => { /*specify the event and the function */
    console.log("New connection ");
    /* send an event from the server */
    socket.emit('event_name'); 
    /*io.emit (event_name, f):->emits the events to every single connection*/
    /*socket.emit(event_name, f):->emits the events to only a specific connection*/
    /*socket.braodcast.emit(event_name, f):->emit event to all the connections on that particular socket*/
});