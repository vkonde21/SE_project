const router = require('express').Router();
const auth = require("../middleware/auth");
let Farmer = require('../models/farmer.model');
let Crop = require('../models/crop.model');
let Deal = require('../models/deal.model');
let Order = require('../models/order.model');
let Buyer = require('../models/buyer.model');
let Investor = require('../models/investor.model');
let User = require('../models/user.model');
let Institution = require('../models/institution.model');
let Rating = require('../models/rating.model');
let multer = require("multer");
let FileType = require('file-type');
var ab2str = require('arraybuffer-to-string');
var { transporter } = require('../utils/messages/mails');
const upload = multer({

    fileFilter(req, file, cb) {
        cb(undefined, true);
    }
})
router.route('/addcrops').get(auth, async (req, res) => {
    res.render('addcrops', { user: req.user });
});

router.route('/addcrops').post(auth, upload.single('cropimage'), async (req, res) => {
    try {
        const cropname = req.body.cropname;
        const dev_stage = req.body.dev_stage;
        if (cropname.match('^[\.a-zA-Z ]*$') == null || dev_stage.match('^[\.a-zA-Z]*$') == null) {
            req.flash('messageFailure', 'Crop name and stage of growth should contain only letters and spaces');
            throw new Error();
        }
        const cropimage = req.file.buffer;
        const user_id = req.user._id;
        const { ext, mime } = await (FileType.fromBuffer(cropimage));
        if (!req.file.originalname.match(/\.(jpg|jpeg|png)$/) || req.file.size > 1000000) {
            req.flash('messageFailure', "Please upload a jpg/jpeg/png image with max size 1MB");
            throw new Error();
        }
        const filetype = mime;
        const bString = ab2str(cropimage.buffer, 'base64');
        const crop = new Crop({ cropname, user_id, dev_stage, cropimage, filetype, bString })
        await crop.save();
        req.flash('messageSuccess', "Crop details saved successfully");
        res.redirect('dashboard');
    }
    catch (e) {
        res.redirect('addcrops');
    }

});

router.route('/updatecrops/:id').get(auth, async (req, res) => {
    try {
        const id = req.params.id;
        const crop = await Crop.findById(id);

        if (crop.user_id.equals(req.user._id)) {
            res.render('updatecrops', { crop, user: req.user });
        }
        else
            throw new Error();

    } catch (e) {
        req.flash('messageSuccess', "Crop details cannot be updated");
    }
});

router.route('/updatecrops/:id').post(auth, upload.single('cropimage'), async (req, res) => {
    try {
        const id = req.params.id;
        const crop = await Crop.findById(id);
        if (crop.user_id.equals(req.user._id)) {
            
            const dev_stage = req.body.dev_stage;
            
            const cropimage = req.file.buffer;
            if (!req.file.originalname.match(/\.(jpg|jpeg|png)$/) || req.file.size > 1000000) {
                req.flash('messageFailure', "Please upload a jpg/jpeg/png image with max size 1MB");
                throw new Error();
            }
            const { ext, mime } = await (FileType.fromBuffer(cropimage));
            const filetype = mime;
            const bString = ab2str(cropimage, 'base64');
            crop.filetype = filetype;
            crop.bString = bString;
            
            crop.dev_stage = dev_stage;
            crop.cropimage = cropimage;
            await crop.save();
            req.flash('messageSuccess', "Crop details updated successfully");
            res.redirect('/users/dashboard');
        }
        else {
            throw new Error();
        }

    } catch (e) {
        req.flash('messageFailure', "Error occurred.Crop details updation failed!!");
        res.redirect('/users/dashboard');
    }
});

router.route('/deletecrops/:id').get(auth, async (req, res) => {
    try {
        const id = req.params.id;
        const crop = await Crop.findById(id);
        if (crop.user_id.equals(req.user._id)) {
            await Crop.deleteOne({ _id: id });
            res.redirect('/users/dashboard');
        }
        else {
            req.flash('messageFailure', "Cannot delete this crop");
            throw new Error();
        }
    } catch (e) {
        res.redirect('/users/dashboard');
    }
});
router.route('/notifications').get(auth, async (req, res) => {
    try{
        if(req.user.type != "farmer"){
            req.flash('messageFailure', 'You cannot access the notifications page');
            throw new Error();
        }
        const deals = await Deal.find({ farmer_id: req.user._id, notified: false });
        const orders = await Order.find({ farmer_id: req.user._id, notified: false });
        var notifications = [];
        var not_orders = [];
        var i;
        for (i = 0; i < deals.length; i += 2) {
            if (deals[i + 1] != undefined)
                notifications.push({ 1: deals[i], 2: deals[i + 1] });
            else
                notifications.push({ 1: deals[i] });
        }
        for (i = 0; i < orders.length; i += 2) {
            if (orders[i + 1] != undefined)
                not_orders.push({ 1: orders[i], 2: orders[i + 1] });
            else
                not_orders.push({ 1: orders[i] });
        }
        res.render('notifications', { notifications, not_orders, user: req.user });
    }
    catch(e){
        res.redirect('/users/dashboard');
    }
});

router.route('/deal_decision').post(auth, async (req, res) => {
    var deal_id;
    var other, o;
    var mailOptions;
    try {
        if (req.body.accept != undefined) {
            if (req.body.dealid1 != undefined) {
                deal_id = req.body.dealid1;
            }
            else {
                deal_id = req.body.dealid2;
            }
            const deal = await Deal.findById(deal_id);
            deal.notified = true;
            deal.farmer_locked = true;
            await deal.save();
            const farmer = await Farmer.findOne({ _id: req.user._id });
            farmer.deals += 1;
            await farmer.save();
            o = await User.findOne({ username: deal.other_username });
            mailOptions = {
                from: 'organiquefarm@gmail.com',
                to: o.email,
                subject: 'Notification regarding your deal',
                text: `Congratulations.Your deal has been accepted by ${farmer.fullname}`
            };
            if (o.type == "investor") {
                other = await Investor.findOne({ _id: o._id });
            }
            else if (o.type == "institution") {
                other = await Institution.findOne({ _id: o._id });
            }
            other.deals += 1;
            await other.save();
            req.flash('messageSuccess', "Deal locked successfully");

            transporter.sendMail(mailOptions, function (error, info) {

                if (error) {
                    console.log(error);
                    throw new Error(error);
                } else {
                    console.log('Email sent: ' + info.response);
                }
            });
        }
        else if (req.body.accept == undefined) {
            if (req.body.dealid1 != undefined) {
                deal_id = req.body.dealid1;
            }
            else {
                deal_id = req.body.dealid2;
            }
            const deal = await Deal.findById(deal_id);
            deal.notified = true;
            await deal.save();
            o = await User.findOne({ username: deal.other_username })
            const f = await Farmer.findOne({ _id: req.user._id })
            req.flash('messageSuccess', "Deal rejected");
            mailOptions = {
                from: 'organiquefarm@gmail.com',
                to: o.email,
                subject: 'Notification regarding your deal',
                text: `Your deal has been rejected by ${f.fullname}`
            };
            transporter.sendMail(mailOptions, function (error, info) {

                if (error) {
                    console.log(error);
                    throw new Error(error);
                } else {
                    console.log('Email sent: ' + info.response);
                }
            });
        }

        res.redirect('notifications');
    }
    catch (e) {
        req.flash('messageError', "Deal locking failed");
        res.redirect('notifications');
    }

});

router.route('/order_decision').post(auth, async (req, res) => {
    var order_id;
    var other, o;
    try {
        if (req.body.accept != undefined) {
            if (req.body.orderid1 != undefined) {
                order_id = req.body.orderid1;
            }
            else {
                order_id = req.body.orderid2;
            }
            const order = await Order.findById(order_id);
            order.notified = true;
            order.farmer_locked = true;
            await order.save();
            const farmer = await Farmer.findOne({ _id: req.user._id });
            farmer.orders += 1;
            await farmer.save();
            o = await User.findOne({ username: order.buyer_username });
            other = await Buyer.findOne({ _id: o._id });
            other.orders += 1;
            await other.save();
            const r = await Rating.findOne({ farmer_username: req.user.username, buyer_id: other._id });
            if (r == null) {
                const rating = new Rating({ farmer_username: req.user.username, buyer_id: other._id });
                await rating.save();
            }
            mailOptions = {
                from: 'organiquefarm@gmail.com',
                to: o.email,
                subject: 'Notification regarding your order',
                text: `Your order has been accepted by ${farmer.fullname}`
            };
            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    console.log(error);
                    throw new Error(error);
                } else {
                    console.log('Email sent: ' + info.response);
                }
            });
            req.flash('messageSuccess', "Order accepted!!");
        }
        else if (req.body.accept == undefined) {
            if (req.body.orderid1 != undefined) {
                order_id = req.body.orderid1;
            }
            else {
                order_id = req.body.orderid2;
            }
            const order = await Order.findById(order_id);
            order.notified = true;
            await order.save();
            o = await User.findOne({ username: order.buyer_username });
            const f = await Farmer.findOne({ _id: req.user._id });
            mailOptions = {
                from: 'organiquefarm@gmail.com',
                to: o.email,
                subject: 'Notification regarding your order',
                text: `Your order has been rejected by ${f.fullname}`
            };
            transporter.sendMail(mailOptions, function (error, info) {

                if (error) {
                    console.log(error);
                    throw new Error(error);
                } else {
                    console.log('Email sent: ' + info.response);
                }
            });
            req.flash('messageSuccess', "Order rejected!!");
        }
        res.redirect('notifications');
    }
    catch (e) {
        req.flash('messageError', "Order confirmation failed");
        res.redirect('dashboard')
    }

});
module.exports = router;