const mongoose = require('mongoose');
const validator = require('validator');
const Schema = mongoose.Schema;
const cropSchema = new Schema({
    cropname:{
        type:String,
        required:true
    },
    dev_stage:{
        type: String,
    },
    
    cropimage:{
        type:Buffer,
        required:true
    },

    filetype:{
        type:String,
    }
});



const Crop = mongoose.model('Crop', cropSchema);
module.exports = Crop;