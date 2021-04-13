const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const hbs = require('hbs');

require('dotenv').config();
const uri = process.env.ATLAS_URI;
mongoose.connect(uri, {useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology:true});
const connection = mongoose.connection;
connection.once('open', () => {
    console.log("Connection established successfully");
})
const app = express();
const port = process.env.port || 5000;

var handlebars = hbs.create({
    layoutsDir:  '/Users/vaishnavikonde/Documents/SEM_VI/SE_project/Farms/src/views/layouts',
    helpers      : {
        section: function(name, options){
            if(!this._sections) this._sections = {};
            this._sections[name] = options.fn(this);
            return null;
        }
    },
    extname: 'hbs',
    defaultLayout: 'layout'
    });


//console.log(handlebars)
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); //to parse json data
app.set('view engine', 'hbs');
app.set('views', "/Users/vaishnavikonde/Documents/SEM_VI/SE_project/Farms/src/views");
app.set('view options', { layout: 'layouts/layout.hbs' });
hbs.registerHelper("section", function(name, options){
    if(!this._sections) this._sections = {};
    this._sections[name] = options.fn(this);
    return null;
});
hbs.layoutsDir = '/Users/vaishnavikonde/Documents/SEM_VI/SE_project/Farms/src/views/layouts';
//hbs.


const userRouter = require('./routes/users');
app.use('/users', userRouter);
app.use('/', require("./routes/index"));
app.listen(port , () => {
    console.log(`Server listening at port ${port}`);
});