const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const authConfig = require("../configs/auth.config");
var newOTP = require("otp-generators");
const User = require("../models/user.model");
const Address = require("../models/AddressModel");
const Cart = require("../models/cartModel");
const Charges = require('../models/Charges');
const freeService = require('../models/freeService');
const service = require('../models/service');
const Coupan = require('../models/Coupan');
const feedback = require('../models/feedback');
const orderModel = require('../models/orderModel');
const offer = require('../models/offer');
const ticket = require('../models/ticket');
// const rating = require('../models/ratingModel');
const favouriteBooking = require('../models/favouriteBooking');
const servicePackage = require('../models/servicePackage');
const Testimonial = require("../models/testimonial");


exports.registration = async (req, res) => {
        try {
                const user = await User.findOne({ _id: req.user._id });
                if (user) {
                        if (req.body.refferalCode == null || req.body.refferalCode == undefined) {
                                req.body.otp = newOTP.generate(4, { alphabets: false, upperCase: false, specialChar: false, });
                                req.body.otpExpiration = new Date(Date.now() + 5 * 60 * 1000);
                                req.body.accountVerification = false;
                                req.body.refferalCode = await reffralCode();
                                req.body.completeProfile = true;
                                const userCreate = await User.findOneAndUpdate({ _id: user._id }, req.body, { new: true, });
                                let obj = { id: userCreate._id, completeProfile: userCreate.completeProfile, phone: userCreate.phone }
                                return res.status(200).send({ status: 200, message: "Registered successfully ", data: obj, });
                        } else {
                                const findUser = await User.findOne({ refferalCode: req.body.refferalCode });
                                if (findUser) {
                                        req.body.otp = newOTP.generate(4, { alphabets: false, upperCase: false, specialChar: false, });
                                        req.body.otpExpiration = new Date(Date.now() + 5 * 60 * 1000);
                                        req.body.accountVerification = false;
                                        req.body.userType = "USER";
                                        req.body.refferalCode = await reffralCode();
                                        req.body.refferUserId = findUser._id;
                                        req.body.completeProfile = true;
                                        const userCreate = await User.findOneAndUpdate({ _id: user._id }, req.body, { new: true, });
                                        if (userCreate) {
                                                let updateWallet = await User.findOneAndUpdate({ _id: findUser._id }, { $push: { joinUser: userCreate._id } }, { new: true });
                                                let obj = { id: userCreate._id, completeProfile: userCreate.completeProfile, phone: userCreate.phone }
                                                return res.status(200).send({ status: 200, message: "Registered successfully ", data: obj, });
                                        }
                                } else {
                                        return res.status(404).send({ status: 404, message: "Invalid refferal code", data: {} });
                                }
                        }
                } else {
                        return res.status(404).send({ status: 404, msg: "Not found" });
                }
        } catch (error) {
                console.error(error);
                return res.status(500).json({ message: "Server error" });
        }
};
exports.socialLogin = async (req, res) => {
        try {
                const { firstName, lastName, email, phone } = req.body;
                console.log(req.body);
                const user = await User.findOne({ $and: [{ $or: [{ email }, { phone }] }, { userType: "USER" }] });
                if (user) {
                        jwt.sign({ id: user._id }, authConfig.secret, (err, token) => {
                                if (err) {
                                        return res.status(401).send("Invalid Credentials");
                                } else {
                                        return res.status(200).json({ status: 200, msg: "Login successfully", userId: user._id, token: token, });
                                }
                        });
                } else {
                        let refferalCode = await reffralCode();
                        const newUser = await User.create({ firstName, lastName, phone, email, refferalCode, userType: "USER" });
                        if (newUser) {
                                jwt.sign({ id: newUser._id }, authConfig.secret, (err, token) => {
                                        if (err) {
                                                return res.status(401).send("Invalid Credentials");
                                        } else {
                                                console.log(token);
                                                return res.status(200).json({ status: 200, msg: "Login successfully", userId: newUser._id, token: token, });
                                        }
                                });
                        }
                }
        } catch (err) {
                console.error(err);
                return createResponse(res, 500, "Internal server error");
        }
};
exports.loginWithPhone = async (req, res) => {
        try {
                const { phone } = req.body;
                const user = await User.findOne({ phone: phone, userType: "USER" });
                if (!user) {
                        let otp = newOTP.generate(4, { alphabets: false, upperCase: false, specialChar: false, });
                        let otpExpiration = new Date(Date.now() + 5 * 60 * 1000);
                        let accountVerification = false;
                        const newUser = await User.create({ phone: phone, otp, otpExpiration, accountVerification, userType: "USER" });
                        let obj = { id: newUser._id, otp: newUser.otp, phone: newUser.phone }
                        return res.status(200).send({ status: 200, message: "logged in successfully", data: obj });
                } else {
                        const userObj = {};
                        userObj.otp = newOTP.generate(4, { alphabets: false, upperCase: false, specialChar: false, });
                        userObj.otpExpiration = new Date(Date.now() + 5 * 60 * 1000);
                        userObj.accountVerification = false;
                        const updated = await User.findOneAndUpdate({ phone: phone, userType: "USER" }, userObj, { new: true, });
                        let obj = { id: updated._id, otp: updated.otp, phone: updated.phone }
                        return res.status(200).send({ status: 200, message: "logged in successfully", data: obj });
                }
        } catch (error) {
                console.error(error);
                return res.status(500).json({ message: "Server error" });
        }
};
exports.verifyOtp = async (req, res) => {
        try {
                const { otp } = req.body;
                const user = await User.findById(req.params.id);
                if (!user) {
                        return res.status(404).send({ message: "user not found" });
                }
                if (user.otp !== otp || user.otpExpiration < Date.now()) {
                        return res.status(400).json({ message: "Invalid OTP" });
                }
                const updated = await User.findByIdAndUpdate({ _id: user._id }, { accountVerification: true }, { new: true });
                const accessToken = await jwt.sign({ id: user._id }, authConfig.secret, {
                        expiresIn: authConfig.accessTokenTime,
                });
                let obj = {
                        userId: updated._id,
                        otp: updated.otp,
                        phone: updated.phone,
                        token: accessToken,
                        completeProfile: updated.completeProfile
                }
                return res.status(200).send({ status: 200, message: "logged in successfully", data: obj });
        } catch (err) {
                console.log(err.message);
                return res.status(500).send({ error: "internal server error" + err.message });
        }
};
exports.getProfile = async (req, res) => {
        try {
                const data = await User.findOne({ _id: req.user._id, }).select('fullName email phone gender alternatePhone dob address1 address2 image refferalCode completeProfile');
                if (data) {
                        return res.status(200).json({ status: 200, message: "get Profile", data: data });
                } else {
                        return res.status(404).json({ status: 404, message: "No data found", data: {} });
                }
        } catch (error) {
                console.log(error);
                return res.status(501).send({ status: 501, message: "server error.", data: {}, });
        }
};
exports.updateProfile = async (req, res) => {
        try {
                const data = await User.findOne({ _id: req.user._id, });
                if (data) {
                        let image;
                        if (req.file) {
                                image = req.file.path
                        }
                        let obj = {
                                fullName: req.body.fullName || data.fullName,
                                email: req.body.email || data.email,
                                phone: req.body.phone || data.phone,
                                gender: req.body.gender || data.gender,
                                alternatePhone: req.body.alternatePhone || data.alternatePhone,
                                dob: req.body.dob || data.dob,
                                address1: req.body.address1 || data.address1,
                                address2: req.body.address2 || data.address2,
                                image: image || data.image
                        }
                        console.log(obj);
                        let update = await User.findByIdAndUpdate({ _id: data._id }, { $set: obj }, { new: true });
                        if (update) {
                                return res.status(200).json({ status: 200, message: "Update profile successfully.", data: update });
                        }
                } else {
                        return res.status(404).json({ status: 404, message: "No data found", data: {} });
                }
        } catch (error) {
                console.log(error);
                return res.status(501).send({ status: 501, message: "server error.", data: {}, });
        }
};
exports.resendOTP = async (req, res) => {
        const { id } = req.params;
        try {
                const user = await User.findOne({ _id: id, userType: "USER" });
                if (!user) {
                        return res.status(404).send({ status: 404, message: "User not found" });
                }
                const otp = newOTP.generate(4, { alphabets: false, upperCase: false, specialChar: false, });
                const otpExpiration = new Date(Date.now() + 5 * 60 * 1000);
                const accountVerification = false;
                const updated = await User.findOneAndUpdate({ _id: user._id }, { otp, otpExpiration, accountVerification }, { new: true });
                let obj = {
                        id: updated._id,
                        otp: updated.otp,
                        phone: updated.phone
                }
                return res.status(200).send({ status: 200, message: "OTP resent", data: obj });
        } catch (error) {
                console.error(error);
                return res.status(500).send({ status: 500, message: "Server error" + error.message });
        }
};
exports.updateLocation = async (req, res) => {
        try {
                const user = await User.findOne({ _id: req.user._id, });
                if (!user) {
                        return res.status(404).send({ status: 404, message: "User not found" });
                } else {
                        if (req.body.currentLat || req.body.currentLong) {
                                coordinates = [parseFloat(req.body.currentLat), parseFloat(req.body.currentLong)]
                                req.body.currentLocation = { type: "Point", coordinates };
                        }
                        let update = await User.findByIdAndUpdate({ _id: user._id }, { $set: { currentLocation: req.body.currentLocation, city: req.body.city, sector: req.body.sector } }, { new: true });
                        if (update) {
                                let obj = {
                                        currentLocation: update.currentLocation,
                                        city: update.city,
                                        sector: update.sector
                                }
                                return res.status(200).send({ status: 200, message: "Location update successfully.", data: obj });
                        }
                }
        } catch (error) {
                console.error(error);
                return res.status(500).send({ status: 500, message: "Server error" + error.message });
        }
};
exports.createAddress = async (req, res, next) => {
        try {
                const data = await User.findOne({ _id: req.user._id, });
                if (data) {
                        req.body.user = data._id;
                        const address = await Address.create(req.body);
                        return res.status(200).json({ message: "Address create successfully.", data: address });
                } else {
                        return res.status(404).json({ status: 404, message: "No data found", data: {} });
                }
        } catch (error) {
                console.log(error);
                return res.status(501).send({ status: 501, message: "server error.", data: {}, });
        }
};
exports.getallAddress = async (req, res, next) => {
        try {
                const data = await User.findOne({ _id: req.user._id, });
                if (data) {
                        const allAddress = await Address.find({ user: data._id });
                        return res.status(200).json({ message: "Address data found.", data: allAddress });
                } else {
                        return res.status(404).json({ status: 404, message: "No data found", data: {} });
                }
        } catch (error) {
                console.log(error);
                return res.status(501).send({ status: 501, message: "server error.", data: {}, });
        }
};
exports.updateAddress = async (req, res, next) => {
        try {
                const data = await User.findOne({ _id: req.user._id, });
                if (data) {
                        const data1 = await Address.findById({ _id: req.params.id });
                        if (data1) {
                                const newAddressData = req.body;
                                let update = await Address.findByIdAndUpdate(data1._id, newAddressData, { new: true, });
                                return res.status(200).json({ status: 200, message: "Address update successfully.", data: update });
                        } else {
                                return res.status(404).json({ status: 404, message: "No data found", data: {} });
                        }
                } else {
                        return res.status(404).json({ status: 404, message: "No data found", data: {} });
                }
        } catch (error) {
                console.log(error);
                return res.status(501).send({ status: 501, message: "server error.", data: {}, });
        }
};
exports.deleteAddress = async (req, res, next) => {
        try {
                const data = await User.findOne({ _id: req.user._id, });
                if (data) {
                        const data1 = await Address.findById({ _id: req.params.id });
                        if (data1) {
                                let update = await Address.findByIdAndDelete(data1._id);
                                return res.status(200).json({ status: 200, message: "Address Deleted Successfully", });
                        } else {
                                return res.status(404).json({ status: 404, message: "No data found", data: {} });
                        }
                } else {
                        return res.status(404).json({ status: 404, message: "No data found", data: {} });
                }
        } catch (error) {
                console.log(error);
                return res.status(501).send({ status: 501, message: "server error.", data: {}, });
        }
};
exports.getAddressbyId = async (req, res, next) => {
        try {
                const data = await User.findOne({ _id: req.user._id, });
                if (data) {
                        const data1 = await Address.findById({ _id: req.params.id });
                        if (data1) {
                                return res.status(200).json({ status: 200, message: "Address found successfully.", data: data1 });
                        } else {
                                return res.status(404).json({ status: 404, message: "No data found", data: {} });
                        }
                } else {
                        return res.status(404).json({ status: 404, message: "No data found", data: {} });
                }
        } catch (error) {
                console.log(error);
                return res.status(501).send({ status: 501, message: "server error.", data: {}, });
        }
};
exports.getFreeServices = async (req, res) => {
        const findFreeService = await freeService.find({ userId: req.user._id }).populate([{ path: 'userId', select: 'fullName firstName lastName' }, { path: 'serviceId', select: 'name price totalTime timeInMin discountPrice discount discountActive ' }]);
        return res.status(201).json({ message: "Free Service Found", status: 200, data: findFreeService, });
};
exports.getCart = async (req, res) => {
        try {
                let userData = await User.findOne({ _id: req.user._id });
                if (!userData) {
                        return res.status(404).json({ status: 404, message: "No data found", data: {} });
                } else {
                        let findCart = await Cart.findOne({ userId: userData._id }).populate("coupanId services.serviceId Charges.chargeId").populate({ path: 'freeService.freeServiceId', populate: { path: 'serviceId', model: 'services', select: "name" }, })
                        if (!findCart) {
                                return res.status(404).json({ status: 404, message: "Cart is empty.", data: {} });
                        } else {
                                return res.status(200).json({ message: "cart data found.", status: 200, data: findCart });
                        }
                }
        } catch (error) {
                console.log(error);
                return res.status(501).send({ status: 501, message: "server error.", data: {}, });
        }
};
exports.listOffer = async (req, res) => {
        try {
                let vendorData = await User.findOne({ _id: req.user._id });
                if (!vendorData) {
                        return res.status(404).send({ status: 404, message: "User not found" });
                } else {
                        let findService = await offer.find({ $and: [{ $or: [{ userId: vendorData._id }, { type: "other" }] }] });
                        if (findService.length == 0) {
                                return res.status(404).send({ status: 404, message: "Data not found" });
                        } else {
                                res.json({ status: 200, message: 'Offer Data found successfully.', service: findService });
                        }
                }
        } catch (error) {
                console.error(error);
                return res.status(500).send({ status: 500, message: "Server error" + error.message });
        }
};
exports.createTicket = async (req, res) => {
        try {
                const data = await User.findOne({ _id: req.user._id, });
                if (data) {
                        let tiketId = await ticketCode();
                        let obj = {
                                userId: data._id,
                                tiketId: tiketId,
                                title: req.body.title,
                                description: req.body.description,
                        }
                        const newUser = await ticket.create(obj);
                        if (newUser) {
                                return res.status(200).json({ status: 200, message: "Ticket create successfully.", data: newUser });
                        }
                } else {
                        return res.status(404).json({ status: 404, message: "No data found", data: {} });
                }
        } catch (error) {
                console.log(error);
                return res.status(501).send({ status: 501, message: "server error.", data: {}, });
        }
};
exports.getTicketbyId = async (req, res, next) => {
        try {
                const data = await User.findOne({ _id: req.user._id, });
                if (data) {
                        const data1 = await ticket.findById({ _id: req.params.id });
                        if (data1) {
                                return res.status(200).json({ status: 200, message: "Ticket found successfully.", data: data1 });
                        } else {
                                return res.status(404).json({ status: 404, message: "No data found", data: {} });
                        }
                } else {
                        return res.status(404).json({ status: 404, message: "No data found", data: {} });
                }
        } catch (error) {
                console.log(error);
                return res.status(501).send({ status: 501, message: "server error.", data: {}, });
        }
};
exports.listTicket = async (req, res) => {
        try {
                let findUser = await User.findOne({ _id: req.user._id });
                if (!findUser) {
                        return res.status(404).send({ status: 404, message: "User not found" });
                } else {
                        let findTicket = await ticket.find({ userId: findUser._id });
                        if (findTicket.length == 0) {
                                return res.status(404).send({ status: 404, message: "Data not found" });
                        } else {
                                res.json({ status: 200, message: 'Ticket Data found successfully.', data: findTicket });
                        }
                }
        } catch (error) {
                console.error(error);
                return res.status(500).send({ status: 500, message: "Server error" + error.message });
        }
};
exports.replyOnTicket = async (req, res) => {
        try {
                const data = await User.findOne({ _id: req.user._id, });
                if (data) {
                        const data1 = await ticket.findById({ _id: req.params.id });
                        if (data1) {
                                let obj = {
                                        comment: req.body.comment,
                                        byUser: true,
                                        byAdmin: false,
                                        date: Date.now(),
                                }
                                let update = await ticket.findByIdAndUpdate({ _id: data1._id }, { $push: { messageDetails: obj } }, { new: true })
                                return res.status(200).json({ status: 200, message: "Ticket found successfully.", data: update });
                        } else {
                                return res.status(404).json({ status: 404, message: "No data found", data: {} });
                        }
                } else {
                        return res.status(404).json({ status: 404, message: "No data found", data: {} });
                }
        } catch (error) {
                console.log(error);
                return res.status(501).send({ status: 501, message: "server error.", data: {}, });
        }
};
exports.addToCart = async (req, res) => {
        try {
                let userData = await User.findOne({ _id: req.user._id });
                if (!userData) {
                        return res.status(404).send({ status: 404, message: "User not found" });
                } else {
                        let findCart = await Cart.findOne({ userId: userData._id });
                        if (findCart) {

                        } else {
                                let findService = await service.findById({ _id: req.body._id });
                                if (findService) {
                                        let Charged = [], paidAmount = 0, totalAmount = 0, additionalFee = 0;
                                        const findCharge = await Charges.find({});
                                        if (findCharge.length > 0) {
                                                for (let i = 0; i < findCharge.length; i++) {
                                                        let obj1 = {
                                                                chargeId: findCharge[i]._id,
                                                                charge: findCharge[i].charge,
                                                                discountCharge: findCharge[i].discountCharge,
                                                                discount: findCharge[i].discount,
                                                                cancelation: findCharge[i].cancelation,
                                                        }
                                                        if (findCharge[i].cancelation == false) {
                                                                if (findCharge[i].discount == true) {
                                                                        additionalFee = additionalFee + findCharge[i].discountCharge
                                                                } else {
                                                                        additionalFee = additionalFee + findCharge[i].charge
                                                                }
                                                        }
                                                        Charged.push(obj1)
                                                }
                                        }
                                        if (findService.type == "Service") {
                                                console.log(findService);
                                                let price = 0;
                                                if (findService.discountActive == true) {
                                                        price = findService.discountPrice;
                                                } else {
                                                        price = findService.originalPrice;
                                                }
                                                totalAmount = Number(price * req.body.quantity).toFixed(2);
                                                paidAmount = (Number((price * req.body.quantity).toFixed(2)) + Number(additionalFee))
                                                let obj = {
                                                        userId: userData._id,
                                                        Charges: Charged,
                                                        services: [{
                                                                serviceId: findService._id,
                                                                price: price,
                                                                quantity: req.body.quantity,
                                                                total: price * req.body.quantity,
                                                                type: "Service"
                                                        }],
                                                        totalAmount: totalAmount,
                                                        additionalFee: additionalFee,
                                                        paidAmount: paidAmount,
                                                        totalItem: 1,
                                                }
                                                const Data = await Cart.create(obj);
                                                return res.status(200).json({ status: 200, message: "Service successfully add to cart. ", data: Data })
                                        }
                                        if (findService.type == "Package") {
                                                if (findService.packageType == "Edit") {
                                                        console.log(findService);
                                                        let categoryServices = []
                                                        let findServicePackage = await servicePackage.findById({ _id: req.body.servicePackageId })
                                                        if (findServicePackage) {
                                                                for (let i = 0; i < req.body.packageServices.length; i++) {
                                                                        let findService1 = await service.findById({ _id: req.body.packageServices[i] });
                                                                        let price = 0;
                                                                        if (findService.discountActive == true) {
                                                                                price = findService.discountPrice;
                                                                        } else {
                                                                                price = findService.originalPrice;
                                                                        }
                                                                        let obj = {
                                                                                service: findService1._id,
                                                                                price: price,
                                                                                quantity: 1,
                                                                                total: price,
                                                                        }
                                                                        categoryServices.push(obj)
                                                                }
                                                        }
                                                        let total = 0;
                                                        for (let j = 0; j < categoryServices.length; j++) {
                                                                total = total + categoryServices[j].total
                                                        }
                                                        totalAmount = Number(total).toFixed(2);
                                                        paidAmount = (Number((total).toFixed(2)) + Number(additionalFee))
                                                        let obj = {
                                                                userId: userData._id,
                                                                Charges: Charged,
                                                                totalAmount: totalAmount,
                                                                services: [{
                                                                        serviceId: findService._id,
                                                                        categoryId: findServicePackage.categoryId,
                                                                        services: categoryServices,
                                                                        quantity: 1,
                                                                        total: total,
                                                                        type: "Package",
                                                                        packageType: "Edit",
                                                                }],
                                                                additionalFee: additionalFee,
                                                                paidAmount: paidAmount,
                                                                totalItem: 1,
                                                        }
                                                        console.log(obj);
                                                        const Data = await Cart.create(obj);
                                                        return res.status(200).json({ status: 200, message: "Service successfully add to cart. ", data: Data })
                                                } else if (findService.packageType == "Normal") {
                                                        let price = 0;
                                                        if (findService.discountActive == true) {
                                                                price = findService.discountPrice;
                                                        } else {
                                                                price = findService.originalPrice;
                                                        }
                                                        totalAmount = Number(price * req.body.quantity).toFixed(2);
                                                        paidAmount = (Number((price * req.body.quantity).toFixed(2)) + Number(additionalFee))
                                                        console.log(totalAmount, additionalFee, paidAmount);
                                                        let obj = {
                                                                userId: userData._id,
                                                                Charges: Charged,
                                                                services: [{
                                                                        serviceId: findService._id,
                                                                        price: price,
                                                                        quantity: req.body.quantity,
                                                                        total: price * req.body.quantity,
                                                                        type: "Package",
                                                                        packageType: "Normal",
                                                                }],
                                                                totalAmount: totalAmount,
                                                                additionalFee: additionalFee,
                                                                paidAmount: paidAmount,
                                                                totalItem: 1,
                                                        }
                                                        const Data = await Cart.create(obj);
                                                        return res.status(200).json({ status: 200, message: "Service successfully add to cart. ", data: Data })
                                                } else if (findService.packageType == "Customise") {
                                                        console.log(findService);
                                                        let price = 0, services = [];
                                                        if (findService.discountActive == true) {
                                                                price = findService.discountPrice;
                                                        } else {
                                                                price = findService.originalPrice;
                                                        }
                                                        totalAmount = Number(price * req.body.quantity).toFixed(2);
                                                        paidAmount = (Number((price * req.body.quantity).toFixed(2)) + Number(additionalFee))
                                                        if (findService.selectedCount == (req.body.packageServices).length) {
                                                                let obj = {
                                                                        serviceId: findService._id,
                                                                        packageServices: req.body.packageServices,
                                                                        price: price,
                                                                        quantity: req.body.quantity,
                                                                        total: price * req.body.quantity,
                                                                        type: "Package",
                                                                        packageType: "Customise",
                                                                }
                                                                services.push(obj)
                                                                let obj1 = {
                                                                        userId: userData._id,
                                                                        Charges: Charged,
                                                                        services: services,
                                                                        totalAmount: totalAmount,
                                                                        additionalFee: additionalFee,
                                                                        paidAmount: paidAmount,
                                                                        totalItem: 1,
                                                                }
                                                                const Data = await Cart.create(obj1);
                                                                return res.status(200).json({ status: 200, message: "Service successfully add to cart. ", data: Data })
                                                        } else {
                                                                return res.status(201).send({ status: 201, message: `You can select only ${findService.selectedCount} not more than ${findService.selectedCount}` });
                                                        }
                                                }
                                        }
                                } else {
                                        return res.status(404).send({ status: 404, message: "Service not found" });
                                }
                        }
                }
        } catch (error) {
                console.error(error);
                return res.status(500).send({ status: 500, message: "Server error" + error.message });
        }
};
exports.provideTip = async (req, res) => {
        try {
                let userData = await User.findOne({ _id: req.user._id });
                if (!userData) {
                        return res.status(404).send({ status: 404, message: "User not found" });
                } else {
                        let findCart = await Cart.findOne({ userId: userData._id });
                        if (findCart) {
                                if (findCart.services.length == 0) {
                                        return res.status(404).json({ status: 404, message: "First add service in your cart.", data: {} });
                                } else {
                                        let Charged = [], paidAmount = 0, additionalFee = 0, coupan = 0, wallet = 0, tip;
                                        const findCharge = await Charges.find({});
                                        if (findCharge.length > 0) {
                                                for (let i = 0; i < findCharge.length; i++) {
                                                        let obj1 = {
                                                                chargeId: findCharge[i]._id,
                                                                charge: findCharge[i].charge,
                                                                discountCharge: findCharge[i].discountCharge,
                                                                discount: findCharge[i].discount,
                                                                cancelation: findCharge[i].cancelation,
                                                        }
                                                        if (findCharge[i].cancelation == false) {
                                                                if (findCharge[i].discount == true) {
                                                                        additionalFee = additionalFee + findCharge[i].discountCharge
                                                                } else {
                                                                        additionalFee = additionalFee + findCharge[i].charge
                                                                }
                                                        }
                                                        Charged.push(obj1)
                                                }
                                        }
                                        if (findCart.coupanUsed == true) {
                                                let findCoupan = await Coupan.findById({ _id: findCart.coupanId });
                                                coupan = findCoupan.discount;
                                        } else {
                                                coupan = 0
                                        }
                                        if (findCart.walletUsed == true) {
                                                wallet = userData.wallet;
                                        } else {
                                                wallet = 0
                                        }
                                        if (req.body.tipProvided > 0) {
                                                tip = true
                                        } else {
                                                tip = false
                                        }
                                        paidAmount = findCart.totalAmount + additionalFee + req.body.tipProvided - wallet - coupan;
                                        let update1 = await Cart.findByIdAndUpdate({ _id: findCart._id }, { $set: { Charges: Charged, tip: tip, tipProvided: req.body.tipProvided, walletUsed: findCart.walletUsed, coupanUsed: findCart.coupanUsed, freeServiceUsed: findCart.freeServiceUsed, wallet: wallet, coupan: coupan, freeService: findCart.freeService, totalAmount: findCart.totalAmount, additionalFee: additionalFee, paidAmount: paidAmount, totalItem: findCart.totalItem } }, { new: true });
                                        return res.status(200).json({ status: 200, message: "Tip add to cart Successfully.", data: update1 })
                                }
                        } else {
                                return res.status(404).json({ status: 404, message: "Cart is empty.", data: {} });
                        }
                }
        } catch (error) {
                console.error(error);
                return res.status(500).send({ status: 500, message: "Server error" + error.message });
        }
};
exports.listCoupan = async (req, res) => {
        try {
                let vendorData = await User.findOne({ _id: req.user._id });
                if (!vendorData) {
                        return res.status(404).send({ status: 404, message: "User not found" });
                } else {
                        let findService = await Coupan.find({ userId: vendorData._id });
                        if (findService.length == 0) {
                                return res.status(404).send({ status: 404, message: "Data not found" });
                        } else {
                                res.json({ status: 200, message: 'Coupan Data found successfully.', service: findService });
                        }
                }
        } catch (error) {
                console.error(error);
                return res.status(500).send({ status: 500, message: "Server error" + error.message });
        }
};
exports.applyCoupan = async (req, res) => {
        try {
                let userData = await User.findOne({ _id: req.user._id });
                if (!userData) {
                        return res.status(404).send({ status: 404, message: "User not found" });
                } else {
                        let findCart = await Cart.findOne({ userId: userData._id });
                        if (findCart) {
                                if (findCart.services.length == 0) {
                                        return res.status(404).json({ status: 404, message: "First add service in your cart.", data: {} });
                                } else {
                                        let Charged = [], paidAmount = 0, additionalFee = 0, coupan = 0, coupanUsed, wallet = 0, tipProvided = 0;
                                        const findCharge = await Charges.find({});
                                        if (findCharge.length > 0) {
                                                for (let i = 0; i < findCharge.length; i++) {
                                                        let obj1 = {
                                                                chargeId: findCharge[i]._id,
                                                                charge: findCharge[i].charge,
                                                                discountCharge: findCharge[i].discountCharge,
                                                                discount: findCharge[i].discount,
                                                                cancelation: findCharge[i].cancelation,
                                                        }
                                                        if (findCharge[i].cancelation == false) {
                                                                if (findCharge[i].discount == true) {
                                                                        additionalFee = additionalFee + findCharge[i].discountCharge
                                                                } else {
                                                                        additionalFee = additionalFee + findCharge[i].charge
                                                                }
                                                        }
                                                        Charged.push(obj1)
                                                }
                                        }
                                        let findCoupan = await Coupan.findOne({ couponCode: req.body.couponCode });
                                        if (!findCoupan) {
                                                return res.status(404).json({ status: 404, message: "Coupan not found", data: {} });
                                        } else {
                                                if (findCoupan.status == true) {
                                                        return res.status(409).json({ status: 409, message: "Coupan Already used", data: {} });
                                                } else {
                                                        if (findCoupan.expirationDate > Date.now()) {
                                                                coupan = findCoupan.discount;
                                                                coupanUsed = true;
                                                                if (findCart.walletUsed == true) {
                                                                        wallet = userData.wallet;
                                                                } else {
                                                                        wallet = 0
                                                                }
                                                                if (findCart.tip == true) {
                                                                        tipProvided = findCart.tipProvided
                                                                } else {
                                                                        tipProvided = 0;
                                                                }
                                                                paidAmount = findCart.totalAmount + additionalFee + tipProvided - wallet - coupan;
                                                                let update1 = await Cart.findByIdAndUpdate({ _id: findCart._id }, {
                                                                        $set: { coupanId: findCoupan._id, Charges: Charged, tip: findCart.tip, tipProvided: tipProvided, walletUsed: findCart.walletUsed, coupanUsed: coupanUsed, freeServiceUsed: findCart.freeServiceUsed, wallet: wallet, coupan: coupan, freeService: findCart.freeService, totalAmount: findCart.totalAmount, additionalFee: additionalFee, paidAmount: paidAmount, totalItem: findCart.totalItem }
                                                                }, { new: true });
                                                                return res.status(200).json({ status: 200, message: "Tip add to cart Successfully.", data: update1 })
                                                        } else {
                                                                return res.status(409).json({ status: 409, message: "Coupan expired", data: {} });
                                                        }
                                                }
                                        }
                                }
                        } else {
                                return res.status(404).json({ status: 404, message: "Cart is empty.", data: {} });
                        }
                }
        } catch (error) {
                console.error(error);
                return res.status(500).send({ status: 500, message: "Server error" + error.message });
        }
};
exports.applyWallet = async (req, res) => {
        try {
                let userData = await User.findOne({ _id: req.user._id });
                if (!userData) {
                        return res.status(404).send({ status: 404, message: "User not found" });
                } else {
                        let findCart = await Cart.findOne({ userId: userData._id });
                        if (findCart) {
                                if (findCart.services.length == 0) {
                                        return res.status(404).json({ status: 404, message: "First add service in your cart.", data: {} });
                                } else {
                                        let Charged = [], paidAmount = 0, additionalFee = 0, coupan = 0, wallet = 0, walletUsed;
                                        const findCharge = await Charges.find({});
                                        if (findCharge.length > 0) {
                                                for (let i = 0; i < findCharge.length; i++) {
                                                        let obj1 = {
                                                                chargeId: findCharge[i]._id,
                                                                charge: findCharge[i].charge,
                                                                discountCharge: findCharge[i].discountCharge,
                                                                discount: findCharge[i].discount,
                                                                cancelation: findCharge[i].cancelation,
                                                        }
                                                        if (findCharge[i].cancelation == false) {
                                                                if (findCharge[i].discount == true) {
                                                                        additionalFee = additionalFee + findCharge[i].discountCharge
                                                                } else {
                                                                        additionalFee = additionalFee + findCharge[i].charge
                                                                }
                                                        }
                                                        Charged.push(obj1)
                                                }
                                        }
                                        if (findCart.coupanUsed == true) {
                                                let findCoupan = await Coupan.findById({ _id: findCart.coupanId });
                                                coupan = findCoupan.discount;
                                        } else {
                                                coupan = 0
                                        }
                                        if (userData.wallet > 0) {
                                                wallet = userData.wallet;
                                                walletUsed = true;
                                        } else {
                                                wallet = 0
                                        }
                                        if (findCart.tip == true) {
                                                tipProvided = findCart.tipProvided
                                        } else {
                                                tipProvided = 0;
                                        }
                                        paidAmount = findCart.totalAmount + additionalFee + tipProvided - wallet - coupan;
                                        let update1 = await Cart.findByIdAndUpdate({ _id: findCart._id }, { $set: { Charges: Charged, tip: findCart.tip, tipProvided: tipProvided, walletUsed: walletUsed, coupanUsed: findCart.coupanUsed, freeServiceUsed: findCart.freeServiceUsed, wallet: wallet, coupan: coupan, freeService: findCart.freeService, totalAmount: findCart.totalAmount, additionalFee: additionalFee, paidAmount: paidAmount, totalItem: findCart.totalItem } }, { new: true });
                                        return res.status(200).json({ status: 200, message: "wallet apply on cart Successfully.", data: update1 })
                                }
                        } else {
                                return res.status(404).json({ status: 404, message: "Cart is empty.", data: {} });
                        }
                }
        } catch (error) {
                console.error(error);
                return res.status(500).send({ status: 500, message: "Server error" + error.message });
        }
};
exports.addFreeServiceToCart = async (req, res) => {
        try {
                let userData = await User.findOne({ _id: req.user._id });
                if (!userData) {
                        return res.status(404).send({ status: 404, message: "User not found" });
                } else {
                        let findCart = await Cart.findOne({ userId: userData._id });
                        if (findCart) {
                                if (findCart.services.length == 0) {
                                        return res.status(404).json({ status: 404, message: "First add service in your cart.", data: {} });
                                } else {
                                        const findFreeService = await freeService.findOne({ _id: req.body.freeServiceId, userId: req.user._id })
                                        if (findFreeService) {
                                                let obj = {
                                                        freeServiceId: findFreeService._id
                                                }
                                                let update1 = await Cart.findByIdAndUpdate({ _id: findCart._id }, { $set: { freeServiceUsed: true, freeServiceCount: findCart.freeServiceCount + 1 }, $push: { freeService: obj } }, { new: true });
                                                return res.status(200).json({ status: 200, message: "Free service add to cart Successfully.", data: update1 })
                                        } else {
                                                return res.status(404).send({ status: 404, message: "Free service not found" });
                                        }
                                }
                        } else {
                                return res.status(404).json({ status: 404, message: "Cart is empty.", data: {} });
                        }
                }
        } catch (error) {
                console.error(error);
                return res.status(500).send({ status: 500, message: "Server error" + error.message });
        }
};
exports.addSuggestionToCart = async (req, res) => {
        try {
                let userData = await User.findOne({ _id: req.user._id });
                if (!userData) {
                        return res.status(404).send({ status: 404, message: "User not found" });
                } else {
                        let findCart = await Cart.findOne({ userId: userData._id });
                        if (findCart) {
                                if (findCart.services.length == 0) {
                                        return res.status(404).json({ status: 404, message: "First add service in your cart.", data: {} });
                                } else {
                                        let update1 = await Cart.findByIdAndUpdate({ _id: findCart._id }, { $set: { suggestion: req.body.suggestion }, }, { new: true });
                                        return res.status(200).json({ status: 200, message: "suggestion add to cart Successfully.", data: update1 })
                                }
                        } else {
                                return res.status(404).json({ status: 404, message: "Cart is empty.", data: {} });
                        }
                }
        } catch (error) {
                console.error(error);
                return res.status(500).send({ status: 500, message: "Server error" + error.message });
        }
};
exports.addAdressToCart = async (req, res) => {
        try {
                let userData = await User.findOne({ _id: req.user._id });
                if (!userData) {
                        return res.status(404).json({ status: 404, message: "No data found", data: {} });
                } else {
                        let findCart = await Cart.findOne({ userId: userData._id })
                        if (!findCart) {
                                return res.status(404).json({ status: 404, message: "Cart is empty.", data: {} });
                        } else {
                                if (findCart.services.length == 0) {
                                        return res.status(404).json({ status: 404, message: "First add service in your cart.", data: {} });
                                } else {
                                        const data1 = await Address.findById({ _id: req.params.id });
                                        if (data1) {
                                                let update1 = await Cart.findByIdAndUpdate({ _id: findCart._id }, { $set: { houseFlat: data1.houseFlat, appartment: data1.appartment, landMark: data1.landMark, houseType: data1.houseType }, }, { new: true });
                                                return res.status(200).json({ status: 200, message: "suggestion add to cart Successfully.", data: update1 })
                                        } else {
                                                return res.status(404).json({ status: 404, message: "No data found", data: {} });
                                        }
                                }
                        }
                }
        } catch (error) {
                console.log(error);
                return res.status(501).send({ status: 501, message: "server error.", data: {}, });
        }
};
exports.addDateAndTimeToCart = async (req, res) => {
        try {
                let userData = await User.findOne({ _id: req.user._id });
                if (!userData) {
                        return res.status(404).send({ status: 404, message: "User not found" });
                } else {
                        let findCart = await Cart.findOne({ userId: userData._id });
                        if (findCart) {
                                if (findCart.services.length == 0) {
                                        return res.status(404).send({ status: 404, message: "Your cart have no service found." });
                                } else {
                                        const d = new Date(req.body.date);
                                        let text = d.toISOString();
                                        let update = await Cart.findByIdAndUpdate({ _id: findCart._id }, { $set: { Date: text, time: req.body.time } }, { new: true });
                                        if (update) {
                                                return res.status(200).send({ status: 200, message: "Date And Time add to Cart successfully.", data: update });
                                        }
                                }
                        } else {
                                return res.status(404).send({ status: 404, message: "Your cart is not found." });
                        }
                }
        } catch (error) {
                console.error(error);
                return res.status(500).send({ status: 500, message: "Server error" + error.message });
        }
};
exports.checkout = async (req, res) => {
        try {
                let userData = await User.findOne({ _id: req.user._id });
                if (!userData) {
                        return res.status(404).json({ status: 404, message: "No data found", data: {} });
                } else {
                        let findCart = await Cart.findOne({ userId: userData._id })
                        if (!findCart) {
                                return res.status(404).json({ status: 404, message: "Cart is empty.", data: {} });
                        } else {
                                let orderId = await reffralCode()
                                let obj = {
                                        orderId: orderId,
                                        userId: findCart.userId,
                                        coupanId: findCart.coupanId,
                                        freeService: findCart.freeService,
                                        Charges: findCart.Charges,
                                        tipProvided: findCart.tipProvided,
                                        tip: findCart.tip,
                                        freeServiceUsed: findCart.freeServiceUsed,
                                        coupanUsed: findCart.coupanUsed,
                                        walletUsed: findCart.walletUsed,
                                        wallet: findCart.wallet,
                                        coupan: findCart.coupan,
                                        freeServiceCount: findCart.freeServiceCount,
                                        suggestion: findCart.suggestion,
                                        address: findCart.address,
                                        city: findCart.city,
                                        state: findCart.state,
                                        pinCode: findCart.pinCode,
                                        landMark: findCart.landMark,
                                        street: findCart.street,
                                        Date: findCart.Date,
                                        time: findCart.time,
                                        services: findCart.services,
                                        totalAmount: findCart.totalAmount,
                                        additionalFee: findCart.additionalFee,
                                        paidAmount: findCart.paidAmount,
                                        totalItem: findCart.totalItem
                                }
                                let SaveOrder = await orderModel.create(obj);
                                if (SaveOrder) {
                                        return res.status(200).json({ status: 200, message: "order create successfully.", data: SaveOrder });
                                }
                        }
                }
        } catch (error) {
                console.log(error);
                return res.status(501).send({ status: 501, message: "server error.", data: {}, });
        }
};
exports.placeOrder = async (req, res) => {
        try {
                let findUserOrder = await orderModel.findOne({ orderId: req.params.orderId });
                if (findUserOrder) {
                        if (req.body.paymentStatus == "paid") {
                                let update = await orderModel.findByIdAndUpdate({ _id: findUserOrder._id }, { $set: { orderStatus: "confirmed", status: "confirmed", paymentStatus: "paid" } }, { new: true });
                                return res.status(200).json({ message: "Payment success.", status: 200, data: update });
                        }
                        if (req.body.paymentStatus == "failed") {
                                return res.status(201).json({ message: "Payment failed.", status: 201, orderId: orderId });
                        }
                } else {
                        return res.status(404).json({ message: "No data found", data: {} });
                }
        } catch (error) {
                return res.status(501).send({ status: 501, message: "server error.", data: {}, });
        }
};
exports.cancelOrder = async (req, res) => {
        try {
                let findUserOrder = await orderModel.findOne({ orderId: req.params.orderId });
                if (findUserOrder) {
                        let update = await orderModel.findByIdAndUpdate({ _id: findUserOrder._id }, { $set: { orderStatus: "cancel" } }, { new: true });
                        return res.status(200).json({ message: "order cancel success.", status: 200, data: update })
                } else {
                        return res.status(404).json({ message: "No data found", data: {} });
                }
        } catch (error) {
                return res.status(501).send({ status: 501, message: "server error.", data: {}, });
        }
};
exports.getOngoingOrders = async (req, res) => {
        try {
                const data = await orderModel.find({ userId: req.user._id, serviceStatus: "Pending" });
                if (data.length > 0) {
                        return res.status(200).json({ message: "All orders", data: data });
                } else {
                        return res.status(404).json({ status: 404, message: "No data found", data: {} });
                }
        } catch (error) {
                console.log(error);
                return res.status(501).send({ status: 501, message: "server error.", data: {}, });
        }
};
exports.getCompleteOrders = async (req, res) => {
        try {
                const data = await orderModel.find({ userId: req.user._id, serviceStatus: "Complete" });
                if (data.length > 0) {
                        return res.status(200).json({ message: "All orders", data: data });
                } else {
                        return res.status(404).json({ status: 404, message: "No data found", data: {} });
                }
        } catch (error) {
                console.log(error);
                return res.status(501).send({ status: 501, message: "server error.", data: {}, });
        }
};
exports.getOrder = async (req, res) => {
        try {
                const data = await orderModel.findById({ _id: req.params.id });
                if (data) {
                        return res.status(200).json({ message: "view order", data: data });
                } else {
                        return res.status(404).json({ status: 404, message: "No data found", data: {} });
                }
        } catch (error) {
                console.log(error);
                return res.status(501).send({ status: 501, message: "server error.", data: {}, });
        }
};
exports.AddFeedback = async (req, res) => {
        try {
                const { type, Feedback, rating } = req.body;
                if (!type && Feedback && rating) {
                        return res.status(201).send({ message: "All filds are required" })
                } else {
                        let obj = {
                                userId: req.user._id,
                                type: type,
                                Feedback: Feedback,
                                rating: rating
                        }
                        const data = await feedback.create(obj);
                        return res.status(200).json({ details: data })
                }
        } catch (err) {
                console.log(err);
                return res.status(400).json({ message: err.message })
        }
};
exports.addFavouriteBooking = async (req, res) => {
        try {
                const data = await orderModel.findById({ _id: req.params.orderId });
                if (data) {
                        let obj = {
                                userId: req.user._id,
                                services: data.services,
                                totalAmount: data.paidAmount,
                                totalItem: data.totalItem
                        }
                        const newUser = await favouriteBooking.create(obj);
                        if (newUser) {
                                return res.status(200).json({ status: 200, message: "Add to favourite booking.", data: newUser });
                        }
                } else {
                        return res.status(404).json({ status: 404, message: "No data found", data: {} });
                }
        } catch (error) {
                console.log(error);
                return res.status(501).send({ status: 501, message: "server error.", data: {}, });
        }
};
exports.listFavouriteBooking = async (req, res) => {
        try {
                let findUser = await User.findOne({ _id: req.user._id });
                if (!findUser) {
                        return res.status(404).send({ status: 404, message: "User not found" });
                } else {
                        let findTicket = await favouriteBooking.find({ userId: findUser._id });
                        if (findTicket.length == 0) {
                                return res.status(404).send({ status: 404, message: "Data not found" });
                        } else {
                                res.json({ status: 200, message: 'Favourite Booking found successfully.', data: findTicket });
                        }
                }
        } catch (error) {
                console.error(error);
                return res.status(500).send({ status: 500, message: "Server error" + error.message });
        }
};
const reffralCode = async () => {
        var digits = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        let OTP = '';
        for (let i = 0; i < 9; i++) {
                OTP += digits[Math.floor(Math.random() * 36)];
        }
        return OTP;
}
const ticketCode = async () => {
        var digits = "0123456789012345678901234567890123456789";
        let OTP = '';
        for (let i = 0; i < 8; i++) {
                OTP += digits[Math.floor(Math.random() * 36)];
        }
        return OTP;
}
exports.addWallet = async (req, res) => {
        try {
                const { amount } = req.body;
                const userId = req.user.id;

                await User.findByIdAndUpdate(userId, { $inc: { wallet: amount } });

                return res.status(200).json({ message: 'Funds added successfully' });
        } catch (error) {
                console.error(error);
                return res.status(500).json({ error: 'Failed to add funds to the wallet' });
        }
};
exports.removeWallet = async (req, res) => {
        try {
                const { amount } = req.body;
                const userId = req.user.id;

                await User.findByIdAndUpdate(userId, { $inc: { wallet: -amount } });

                return res.status(200).json({ message: 'Funds removed successfully' });
        } catch (error) {
                console.error(error);
                return res.status(500).json({ error: 'Failed to remove funds from the wallet' });
        }
};
exports.getwallet = async (req, res) => {
        try {
                const userId = req.user.id;
                const user = await User.findById(userId, 'wallet');
                if (!user) {
                        return res.status(404).json({ message: 'User not found' });
                }

                return res.status(200).json({ message: 'Wallet balance retrieved successfully', data: { wallet: user.wallet } });
        } catch (error) {
                console.error(error);
                return res.status(500).json({ error: 'Failed to retrieve wallet balance' });
        }
};
exports.createTestimonial = async (req, res) => {
        try {
                if (!req.file) {
                        return res.status(400).json({ error: "Image file is required" });
                }
                const { userName, userProffession, title, description } = req.body;
                const testimonial = new Testimonial({
                        userName,
                        userProffession,
                        title,
                        description,
                        image: req.file.path,
                });

                const savedTestimonial = await testimonial.save();
                res.status(201).json({status: 201, data: savedTestimonial});
        } catch (error) {
                console.error(error);
                res.status(500).json({ error: "Failed to create testimonial" });
        }
};
exports.getAllTestimonials = async (req, res) => {
        try {
                const testimonials = await Testimonial.find();
                res.status(200).json({status: 200, data: testimonials});
        } catch (error) {
                console.error(error);
                res.status(500).json({ error: "Failed to retrieve testimonials" });
        }
};
exports.getTestimonialById = async (req, res) => {
        try {
                const testimonial = await Testimonial.findById(req.params.id);
                if (!testimonial) {
                        return res.status(404).json({ message: "Testimonial not found" });
                }
                res.status(200).json({status: 200, data: testimonial});
        } catch (error) {
                console.error(error);
                res.status(500).json({ error: "Failed to retrieve testimonial" });
        }
};
