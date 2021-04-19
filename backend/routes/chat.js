
const auth = require('../middleware/auth');
const router = require('express').Router();
router.route('/').get(auth, async(req, res) => {
    res.render('chat_list');
});
router.route('/:id').get(auth, async(req, res) => {
    res.render('chat_app');
});
//for /chat i.e / display a table of initiated chats
module.exports = router;