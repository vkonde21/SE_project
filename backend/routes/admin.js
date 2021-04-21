const router = require('express').Router();
const auth = require("../middleware/auth");
router.route('/dashboard').get( async(req,res) => {
    res.render('admin_dashboard');
});
router.route('/verify_profile').get((req, res) => {
    res.render('verify_profile');
});
module.exports = router;