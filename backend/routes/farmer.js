const router = require('express').Router();
const auth = require("../middleware/auth");
let Farmer = require('../models/farmer.model');
let Crop = require('../models/crop.model');
const multer = require("multer");
const FileType = require('file-type');
const upload = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        
            if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
                return cb(new Error('Please upload an image'))
            }
            cb(undefined, true)
    }
})
router.route('/addcrops').get(auth, async(req,res) => {
    res.render('addcrops');
});

router.route('/addcrops').post(auth, upload.single('cropimage'), async(req,res) => {
    try{
        const cropname = req.body.cropname;
        const dev_stage = req.body.dev_stage;
        const cropimage = req.file.buffer;
        const user_id = req.user._id;
        const {ext, mime} = await (FileType.fromBuffer(cropimage));
        const filetype = mime;
        //console.log(filetype);
        const crop = new Crop({cropname, _id:user_id, dev_stage, cropimage, filetype})
        crop.save();
        res.redirect('dashboard');
    }
    catch(e){
        res.status(400).json('error: ' + e);
    }
    
});
module.exports = router;