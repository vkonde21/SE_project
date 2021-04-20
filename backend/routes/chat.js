const auth = require('../middleware/auth');
const User = require('../models/user.model');
const router = require('express').Router();


router.route('/:id').get(auth, async(req, res) => {
    //generate a random objectId and send
    const user = await User.findById(req.params.id);
    if(user == undefined || user == null)
        render('error');
    res.render('chat', {curr_user:req.user, other_user: user});

});

//for /chat i.e / display a table of initiated chats
module.exports = router;