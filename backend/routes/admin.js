const router = require('express').Router();
const auth = require("../middleware/auth");
router.route('/dashboard').get( async(req,res) => {
    res.render('admin_dashboard');
});
module.exports = router;