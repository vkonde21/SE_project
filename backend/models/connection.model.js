const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { ObjectId } = require('bson');
const Schema = mongoose.Schema;
const connectionSchema = new Schema({
    curr_user:{
        type:ObjectId
    },
    conn_user:{
        type:ObjectId
    },
    conn_user_name:{
        type:String, //fullname of other user
    }
});

const Connection = mongoose.model('Connection', connectionSchema);
module.exports = Connection;