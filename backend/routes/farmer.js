const router = require('express').Router();
const auth = require("../middleware/auth");
let Farmer = require('../models/farmer.model');
let Crop = require('../models/crop.model');
const multer = require("multer");
const FileType = require('file-type');
var ab2str = require('arraybuffer-to-string')
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
        const bString = ab2str(cropimage.buffer, 'base64');
        //console.log(user_id);
        const crop = new Crop({cropname, user_id, dev_stage, cropimage, filetype, bString})
        crop.save();
        res.redirect('dashboard');
    }
    catch(e){
        res.status(400).json('error: ' + e);
    }
    
});
module.exports = router;