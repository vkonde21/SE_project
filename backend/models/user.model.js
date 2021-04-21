const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Schema = mongoose.Schema;
const userSchema = new Schema({
    username:{
        type:String,
        required:true,
        unique:true,
        trim:true, //trim white space
        minlength:3
    }, 
    password:{
        type: String,
        required:true,
        trim: true,
        minlength:3
    },
    email:{
        type: String,
        unique:true,
        required:true, 
        trim:true,
        lowercase: true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error("Invalid email");
            }
        }
    }, 
    type:{
        type:String
    }, 
    is_verified:{
        type:Boolean
    }, 
    tokens: [{
        token:{
            type: String,
            required:true
        }
    }]
}, {
    timestamps:true
});

userSchema.methods.generateAuthToken = async function() {
    const user = this;
    const token = jwt.sign({_id: user._id.toString()}, 'hello');
    user.tokens = user.tokens.concat({token});
    await user.save();
    return token;
}
userSchema.statics.findByCredentials = async(username, password) => {
    const user = await User.findOne({username: username});
    var isMatch;
    if(user != null){
        isMatch = await bcrypt.compare(password, user.password);
          if(!isMatch)
            user = null;
    }
         
    return user;
}
const User = mongoose.model('User', userSchema);
module.exports = User;