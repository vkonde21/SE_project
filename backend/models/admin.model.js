const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Schema = mongoose.Schema;
const adminSchema = new Schema({
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
    tokens: [{
        token:{
            type: String,
            required:true
        }
    }]
});



adminSchema.methods.generateAuthToken = async function() {
    const user = this;
    const token = jwt.sign({_id: user._id.toString()}, 'hello');
    user.tokens = user.tokens.concat({token});
    await user.save();
    return token;
}
adminSchema.statics.findByCredentials = async(username, password) => {
    var user = await Admin.findOne({username: username});
    
    var isMatch;
    if(user != null){
         isMatch = await bcrypt.compare(password, user.password);
         if(!isMatch)
            user = null;
    }
    return user;
}
const Admin = mongoose.model('Admin', adminSchema);
module.exports = Admin;