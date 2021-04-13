const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();
const uri = process.env.ATLAS_URI;
mongoose.connect(uri, {useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology:true});
const connection = mongoose.connection;
connection.once('open', () => {
    console.log("Connection established successfully");
})
const app = express();
const port = process.env.port || 5000;
const expressLayouts = require('express-ejs-layouts');

app.use(expressLayouts);
app.set('views', "/Users/vaishnavikonde/Documents/SEM_VI/SE_project/Farms/src/views");
app.set('view engine', 'ejs');

app.use(cors());
app.use(express.json()); //to parse json data

const userRouter = require('./routes/users');
app.use('/users', userRouter);
app.use('/', require("./routes/index"));
app.listen(port , () => {
    console.log(`Server listening at port ${port}`);
});