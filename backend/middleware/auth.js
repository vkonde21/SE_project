const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const user = require('../models/user.model');
const auth = async(req, res, next) => {
    try{
        const token = req.header("Authorization").replace('Bearer ', '');
        const decoded = jwt.verify(token, "hello");
        const user = await User.findOne({_id: decoded._id, "tokens.token":token});
        if(!user){
            throw new Error();
        }
        req.token = token;
        req.user = user;
        next(); /* run route handler */
    }
    catch(e){
        res.status(401).send({error: "You are not authenticated!!"});
    }
}

module.exports = auth;
/*signup and login requests should not use the auth middleware*/