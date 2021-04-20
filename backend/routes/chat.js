
const auth = require('../middleware/auth');
const router = require('express').Router();


router.route('/:id').get(auth, async(req, res) => {
    res.render('chat');

});

//for /chat i.e / display a table of initiated chats
module.exports = router;