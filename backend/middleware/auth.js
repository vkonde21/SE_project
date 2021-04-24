const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const Admin = require('../models/admin.model');
const auth = async(req, res, next) => {
    
    try{
        const token = req.cookies.jwt ;
        const decoded = jwt.verify(token, "hello");
        var user = await User.findOne({_id: decoded._id, "tokens.token":token, is_verified:true});
        if(user == null || user == undefined){
            user = await Admin.findOne({_id: decoded._id, "tokens.token":token});
        }
        if(!user){
            throw new Error();
        }
        
        req.token = token;
        req.user = user;
        next(); /* run route handler */
    }
    catch(e){
        //res.status(401).send({error: "You are not authenticated!!"});
        req.flash('messageFailure', "You are not authenticated");
        res.redirect('/');
    }
}

module.exports = auth;
/*signup and login requests should not use the auth middleware*/