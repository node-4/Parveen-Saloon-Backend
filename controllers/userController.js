const bcrypt = require("bcryptjs");
const mongoose = require('mongoose');
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
const Rating = require('../models/ratingModel');
const favouriteBooking = require('../models/favouriteBooking');
const servicePackage = require('../models/servicePackage');
const Testimonial = require("../models/testimonial");
const Order = require('../models/orderModel')
const IssueReport = require('../models/reportIssueModel');
const Category = require("../models/category/Category");
const MainCategory = require("../models/category/mainCategory");
const SubCategory = require("../models/category/subCategory");
const transactionModel = require("../models/transactionModel");
const DateAndTimeSlot = require('../models/date&TimeSlotModel');
const MinimumCart = require('../models/miniumCartAmountModel');




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
        const findFreeService = await freeService.find({ userId: req.user._id }).populate([{ path: 'userId', select: 'fullName firstName lastName' }, { path: 'serviceId' }]);
        return res.status(201).json({ message: "Free Service Found", status: 200, data: findFreeService, });
};
// exports.getCart = async (req, res) => {
//         try {
//                 let userData = await User.findOne({ _id: req.user._id });
//                 if (!userData) {
//                         return res.status(404).json({ status: 404, message: "No data found", data: {} });
//                 } else {
//                         let findCart = await Cart.findOne({ userId: userData._id }).populate("coupanId services.serviceId Charges.chargeId").populate({ path: 'freeService.freeServiceId', populate: { path: 'serviceId', model: 'services', select: "title originalPrice totalTime discount discountActive timeInMin" }, })
//                         if (!findCart) {
//                                 return res.status(404).json({ status: 404, message: "Cart is empty.", data: {} });
//                         } else {
//                                 let totalOriginalPrice = 0;
//                                 for (const cartItem of findCart.services) {
//                                         if (cartItem.serviceId.originalPrice) {
//                                                 totalOriginalPrice += cartItem.serviceId.originalPrice * cartItem.quantity;
//                                         }
//                                 }
//                                 console.log('Total Original Price:', totalOriginalPrice);

//                                 // const isMinimumCartAmount = findCart.totalAmount >= findCart.minimumCartAmount;
//                                 // if (!isMinimumCartAmount) {
//                                 //         return res.status(400).json({ status: 400, data: { "Please add more data to placed order minimumAmount": 500, "isMinimumCartAmount": true } });
//                                 // }

//                                 return res.status(200).json({ message: "cart data found.", status: 200, data: { ...findCart.toObject(), totalOriginalPrice, /*"isMinimumCartAmount": false*/ } });
//                         }
//                 }
//         } catch (error) {
//                 console.log(error);
//                 return res.status(501).send({ status: 501, message: "server error.", data: {}, });
//         }
// };

exports.getCart = async (req, res) => {
        try {
                let userData = await User.findOne({ _id: req.user._id });
                if (!userData) {
                        return res.status(404).json({ status: 404, message: "No data found", data: {} });
                } else {
                        let findCart = await Cart.findOne({ userId: userData._id }).populate("coupanId services.serviceId Charges.chargeId").populate({ path: 'freeService.freeServiceId', populate: { path: 'serviceId', model: 'services', select: "title originalPrice totalTime discount discountActive timeInMin" }, })

                        const minimumCart = await MinimumCart.findOne();

                        if (!findCart) {
                                return res.status(404).json({ status: 404, message: "Cart is empty.", data: {} });
                        } else {
                                let totalOriginalPrice = 0;
                                for (const cartItem of findCart.services) {
                                        if (cartItem.serviceId.originalPrice) {
                                                totalOriginalPrice += cartItem.serviceId.originalPrice * cartItem.quantity;
                                        }
                                }

                                let totalDiscountActive = 0;
                                let totalDiscount = 0;
                                let totalDiscountPrice = 0;
                                let totalQuantityInCart = 0;
                                let totalIsInCart = 0;
                                let totalHours = 0;
                                let totalMinutes = 0;

                                const timeSlotsFromCart = {
                                        startTime: findCart.startTime,
                                        endTime: findCart.endTime,
                                };
                                console.log(timeSlotsFromCart);

                                const matchingTimeSlots = await DateAndTimeSlot.find({
                                        $and: [
                                                { isSlotPrice: true },
                                                timeSlotsFromCart,
                                        ],
                                });

                                let totalIsSlotPrice = 0;
                                for (const slot of matchingTimeSlots) {
                                        totalIsSlotPrice += slot.slotPrice;
                                }
                                findCart.paidAmount += totalIsSlotPrice;


                                for (const cartItem of findCart.services) {
                                        if (cartItem.serviceId.discountActive) {
                                                totalDiscountActive++;
                                        }

                                        totalDiscount += cartItem.serviceId.discount ? cartItem.serviceId.discount * cartItem.quantity : 0;

                                        if (cartItem.serviceId.discountActive && cartItem.serviceId.discountPrice) {
                                                totalDiscountPrice += cartItem.serviceId.discountPrice * cartItem.quantity;
                                        }

                                        totalQuantityInCart += cartItem.quantity;
                                        totalIsInCart++;

                                        const timeParts = cartItem.serviceId.totalTime.split(" ");
                                        const hours = parseInt(timeParts[0]) || 0;
                                        const minutes = parseInt(timeParts[2]) || 0;

                                        totalHours += hours;
                                        totalMinutes += minutes;
                                }

                                const totalHoursString = totalHours > 0 ? `${totalHours} hr` : "";
                                const totalMinutesString = totalMinutes > 0 ? ` ${totalMinutes} min` : "";

                                const totalTimeTaken = totalHoursString + totalMinutesString;


                                if (findCart.totalAmount <= findCart.minimumCartAmount) {
                                        return res.status(400).json({ status: 400, data: { "Please add more data to place an order minimumAmount": findCart.minimumCartAmount } });
                                }

                                return res.status(200).json({
                                        message: "Cart data found.",
                                        status: 200,
                                        data: {
                                                ...findCart.toObject(),
                                                totalOriginalPrice,
                                                totalDiscountActive,
                                                totalDiscount,
                                                totalDiscountPrice,
                                                totalQuantityInCart,
                                                totalIsInCart,
                                                minimumCartAmount: minimumCart ? minimumCart.minimumCartAmount : 0,
                                                totalTimeTaken,
                                                totalIsSlotPrice
                                        },
                                });
                        }
                }
        } catch (error) {
                console.log(error);
                return res.status(501).send({ status: 501, message: "Server error.", data: {} });
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
exports.getUserOffer = async (req, res) => {
        try {
                let vendorData = await User.findOne({ _id: req.user._id });
                if (!vendorData) {
                        return res.status(404).send({ status: 404, message: "User not found" });
                } else {
                        let findService = await offer.find({ $and: [{ $or: [{ userId: vendorData._id }, { type: "user" }] }] });
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
// exports.addToCart = async (req, res) => {
//         try {
//                 const userData = await User.findOne({ _id: req.user._id });
//                 if (!userData) {
//                         return res.status(404).send({ status: 404, message: "User not found" });
//                 } else {
//                         const findCart = await Cart.findOne({ userId: userData._id });
//                         if (findCart) {
//                                 const findService = await service.findById({ _id: req.body._id });
//                                 const existingService = findCart.services.find(service => service.serviceId.equals(findService._id));

//                                 if (existingService) {
//                                         existingService.quantity += req.body.quantity;
//                                         existingService.total = existingService.price * existingService.quantity;

//                                         findCart.totalAmount += existingService.price * req.body.quantity;
//                                         findCart.paidAmount += existingService.price * req.body.quantity;

//                                         await findCart.save();
//                                         console.log("first", findCart);
//                                         return res.status(200).json({ status: 200, message: "Service quantity updated in the cart.", data: findCart });

//                                 } else {
//                                         const price = findService.discountActive ? findService.discountPrice : findService.originalPrice;

//                                         const newService = {
//                                                 serviceId: findService._id,
//                                                 price: price,
//                                                 quantity: req.body.quantity,
//                                                 total: price * req.body.quantity,
//                                                 type: "Service"
//                                         };

//                                         findCart.services.push(newService);

//                                         findCart.totalAmount += newService.total;
//                                         findCart.paidAmount += newService.total;
//                                         findCart.totalItem++;

//                                         await findCart.save();
//                                         console.log("else second", findCart);
//                                         return res.status(200).json({ status: 200, message: "Service added to the cart.", data: findCart });
//                                 }

//                         } else {
//                                 let findService = await service.findById({ _id: req.body._id });
//                                 console.log("findServicesPrince", findService);
//                                 if (findService) {
//                                         let Charged = [], paidAmount = 0, totalAmount = 0, additionalFee = 0;
//                                         const findCharge = await Charges.find({});
//                                         if (findCharge.length > 0) {
//                                                 for (let i = 0; i < findCharge.length; i++) {
//                                                         let obj1 = {
//                                                                 chargeId: findCharge[i]._id,
//                                                                 charge: findCharge[i].charge,
//                                                                 discountCharge: findCharge[i].discountCharge,
//                                                                 discount: findCharge[i].discount,
//                                                                 cancelation: findCharge[i].cancelation,
//                                                         }
//                                                         if (findCharge[i].cancelation == false) {
//                                                                 if (findCharge[i].discount == true) {
//                                                                         additionalFee = additionalFee + findCharge[i].discountCharge
//                                                                 } else {
//                                                                         additionalFee = additionalFee + findCharge[i].charge
//                                                                 }
//                                                         }
//                                                         Charged.push(obj1)
//                                                 }
//                                         }
//                                         if (findService.type == "Service") {
//                                                 console.log(findService);
//                                                 let price = 0;
//                                                 if (findService.discountActive == true) {
//                                                         price = findService.discountPrice;
//                                                 } else {
//                                                         price = findService.originalPrice;
//                                                 }
//                                                 totalAmount = Number(price * req.body.quantity).toFixed(2);
//                                                 paidAmount = (Number((price * req.body.quantity).toFixed(2)) + Number(additionalFee))
//                                                 let obj = {
//                                                         userId: userData._id,
//                                                         Charges: Charged,
//                                                         services: [{
//                                                                 serviceId: findService._id,
//                                                                 packageServices: req.body.packageServices,
//                                                                 price: price,
//                                                                 quantity: req.body.quantity,
//                                                                 total: price * req.body.quantity,
//                                                                 type: "Service"
//                                                         }],
//                                                         totalAmount: totalAmount,
//                                                         additionalFee: additionalFee,
//                                                         paidAmount: paidAmount,
//                                                         totalItem: 1,
//                                                 }
//                                                 const Data = await Cart.create(obj);
//                                                 console.log("third", Data);
//                                                 return res.status(200).json({ status: 200, message: "Service successfully add to cart. ", data: Data })
//                                         }
//                                         if (findService.type == "Package") {
//                                                 if (findService.packageType == "Edit") {
//                                                         console.log(findService);
//                                                         let categoryServices = []
//                                                         if (!req.body.servicePackageId) {
//                                                                 return res.status(400).json({ status: 400, message: "Package Service not edit." })
//                                                         }
//                                                         let findServicePackage = await servicePackage.findById({ _id: req.body.servicePackageId })
//                                                         if (findServicePackage) {

//                                                                 let packageServices = []; for (let i = 0; i < req.body.packageServices.length; i++) {
//                                                                         let findService1 = await service.findById({ _id: req.body.packageServices[i] });
//                                                                         packageServices.push(findService1._id);
//                                                                         let price = 0;
//                                                                         if (findService.discountActive == true) {
//                                                                                 price = findService.discountPrice;
//                                                                         } else {
//                                                                                 price = findService.originalPrice;
//                                                                         }
//                                                                         let obj = {
//                                                                                 service: findService1._id,
//                                                                                 price: price,
//                                                                                 quantity: 1,
//                                                                                 total: price,
//                                                                         }
//                                                                         categoryServices.push(obj)
//                                                                 }
//                                                         }
//                                                         let total = 0;
//                                                         for (let j = 0; j < categoryServices.length; j++) {
//                                                                 total = total + categoryServices[j].total
//                                                         }
//                                                         totalAmount = Number(total).toFixed(2);
//                                                         paidAmount = (Number((total).toFixed(2)) + Number(additionalFee))
//                                                         let obj = {
//                                                                 userId: userData._id,
//                                                                 Charges: Charged,
//                                                                 totalAmount: totalAmount,
//                                                                 services: [{
//                                                                         serviceId: findService._id,
//                                                                         categoryId: findServicePackage.categoryId,
//                                                                         services: categoryServices,
//                                                                         packageServices: packageServices,
//                                                                         quantity: 1,
//                                                                         total: total,
//                                                                         type: "Package",
//                                                                         packageType: "Edit",
//                                                                 }],
//                                                                 additionalFee: additionalFee,
//                                                                 paidAmount: paidAmount,
//                                                                 totalItem: 1,
//                                                         }
//                                                         console.log("fourth", obj);
//                                                         const Data = await Cart.create(obj);
//                                                         return res.status(200).json({ status: 200, message: "Service successfully add to cart. ", data: Data })
//                                                 } else if (findService.packageType == "Normal") {
//                                                         let price = 0;
//                                                         if (findService.discountActive == true) {
//                                                                 price = findService.discountPrice;
//                                                         } else {
//                                                                 price = findService.originalPrice;
//                                                         }
//                                                         totalAmount = Number(price * req.body.quantity).toFixed(2);
//                                                         paidAmount = (Number((price * req.body.quantity).toFixed(2)) + Number(additionalFee))
//                                                         console.log(totalAmount, additionalFee, paidAmount);
//                                                         let obj = {
//                                                                 userId: userData._id,
//                                                                 Charges: Charged,
//                                                                 services: [{
//                                                                         serviceId: findService._id,
//                                                                         price: price,
//                                                                         quantity: req.body.quantity,
//                                                                         total: price * req.body.quantity,
//                                                                         type: "Package",
//                                                                         packageType: "Normal",
//                                                                 }],
//                                                                 totalAmount: totalAmount,
//                                                                 additionalFee: additionalFee,
//                                                                 paidAmount: paidAmount,
//                                                                 totalItem: 1,
//                                                         }
//                                                         console.log("fifth", obj);

//                                                         const Data = await Cart.create(obj);
//                                                         return res.status(200).json({ status: 200, message: "Service successfully add to cart. ", data: Data })
//                                                 } else if (findService.packageType == "Customise") {
//                                                         console.log(findService);
//                                                         let price = 0, services = [];
//                                                         if (findService.discountActive == true) {
//                                                                 price = findService.discountPrice;
//                                                         } else {
//                                                                 price = findService.originalPrice;
//                                                         }
//                                                         totalAmount = Number(price * req.body.quantity).toFixed(2);
//                                                         paidAmount = (Number((price * req.body.quantity).toFixed(2)) + Number(additionalFee))
//                                                         if (findService.selectedCount == (req.body.packageServices).length) {
//                                                                 let obj = {
//                                                                         serviceId: findService._id,
//                                                                         packageServices: req.body.packageServices,
//                                                                         price: price,
//                                                                         quantity: req.body.quantity,
//                                                                         total: price * req.body.quantity,
//                                                                         type: "Package",
//                                                                         packageType: "Customise",
//                                                                 }
//                                                                 services.push(obj)
//                                                                 let obj1 = {
//                                                                         userId: userData._id,
//                                                                         Charges: Charged,
//                                                                         services: services,
//                                                                         totalAmount: totalAmount,
//                                                                         additionalFee: additionalFee,
//                                                                         paidAmount: paidAmount,
//                                                                         totalItem: 1,
//                                                                 }
//                                                                 console.log("sixth", obj);
//                                                                 console.log("seventh", obj1);

//                                                                 const Data = await Cart.create(obj1);
//                                                                 return res.status(200).json({ status: 200, message: "Service successfully add to cart. ", data: Data })
//                                                         } else {
//                                                                 return res.status(201).send({ status: 201, message: `You can select only ${findService.selectedCount} not more than ${findService.selectedCount}` });
//                                                         }
//                                                 }
//                                         }
//                                 } else {
//                                         return res.status(404).send({ status: 404, message: "Service not found" });
//                                 }
//                         }
//                 }
//         } catch (error) {
//                 console.error(error);
//                 return res.status(500).send({ status: 500, message: "Server error" + error.message });
//         }
// };

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
// exports.addToCartSingleService = async (req, res) => {
//         try {
//                 const userData = await User.findOne({ _id: req.user._id });
//                 if (!userData) {
//                         return res.status(404).send({ status: 404, message: "User not found" });
//                 } else {
//                         const findCart = await Cart.findOne({ userId: userData._id });
//                         if (findCart) {
//                                 const findService = await service.findById({ _id: req.body._id });
//                                 const existingService = findCart.services.find(service => service.serviceId.equals(findService._id));
//                                 if (existingService) {
//                                         existingService.quantity += req.body.quantity;
//                                         existingService.total = existingService.price * existingService.quantity;
//                                         findCart.totalAmount += existingService.price * req.body.quantity;
//                                         findCart.paidAmount += existingService.price * req.body.quantity;
//                                         await findCart.save();
//                                         return res.status(200).json({ status: 200, message: "Service quantity updated in the cart.", data: findCart });
//                                 } else {
//                                         const price = findService.discountActive ? findService.discountPrice : findService.originalPrice;
//                                         const newService = {
//                                                 serviceId: findService._id,
//                                                 price: price,
//                                                 quantity: req.body.quantity,
//                                                 total: price * req.body.quantity,
//                                                 // type: "Service"
//                                                 type: findService.type,
//                                                 packageType: findService.packageType,
//                                         };
//                                         findCart.services.push(newService);
//                                         findCart.totalAmount += newService.total;
//                                         findCart.paidAmount += newService.total;
//                                         findCart.totalItem++;
//                                         await findCart.save();
//                                         return res.status(200).json({ status: 200, message: "Service added to the cart.", data: findCart });
//                                 }
//                         } else {
//                                 let findService = await service.findById({ _id: req.body._id });
//                                 if (findService) {
//                                         let Charged = [], paidAmount = 0, totalAmount = 0, additionalFee = 0;
//                                         const findCharge = await Charges.find({});
//                                         if (findCharge.length > 0) {
//                                                 for (let i = 0; i < findCharge.length; i++) {
//                                                         let obj1 = {
//                                                                 chargeId: findCharge[i]._id,
//                                                                 charge: findCharge[i].charge,
//                                                                 discountCharge: findCharge[i].discountCharge,
//                                                                 discount: findCharge[i].discount,
//                                                                 cancelation: findCharge[i].cancelation,
//                                                         }
//                                                         if (findCharge[i].cancelation == false) {
//                                                                 if (findCharge[i].discount == true) {
//                                                                         additionalFee = additionalFee + findCharge[i].discountCharge
//                                                                 } else {
//                                                                         additionalFee = additionalFee + findCharge[i].charge
//                                                                 }
//                                                         }
//                                                         Charged.push(obj1)
//                                                 }
//                                         }
//                                         if (findService.type == "Service") {
//                                                 console.log(findService);
//                                                 let price = 0;
//                                                 if (findService.discountActive == true) {
//                                                         price = findService.discountPrice;
//                                                 } else {
//                                                         price = findService.originalPrice;
//                                                 }
//                                                 totalAmount = Number(price * req.body.quantity).toFixed(2);
//                                                 paidAmount = (Number((price * req.body.quantity).toFixed(2)) + Number(additionalFee))
//                                                 let obj = {
//                                                         userId: userData._id,
//                                                         Charges: Charged,
//                                                         services: [{
//                                                                 serviceId: findService._id,
//                                                                 packageServices: req.body.packageServices,
//                                                                 price: price,
//                                                                 quantity: req.body.quantity,
//                                                                 total: price * req.body.quantity,
//                                                                 type: "Service"
//                                                         }],
//                                                         totalAmount: totalAmount,
//                                                         additionalFee: additionalFee,
//                                                         paidAmount: paidAmount,
//                                                         totalItem: 1,
//                                                 }
//                                                 const Data = await Cart.create(obj);
//                                                 return res.status(200).json({ status: 200, message: "Service successfully add to cart. ", data: Data })
//                                         }
//                                 } else {
//                                         return res.status(404).send({ status: 404, message: "Service not found" });
//                                 }
//                         }
//                 }
//         } catch (error) {
//                 console.error(error);
//                 return res.status(500).send({ status: 500, message: "Server error" + error.message });
//         }
// }
// exports.addToCartPackageNormal = async (req, res) => {
//         try {
//                 const userData = await User.findOne({ _id: req.user._id });
//                 if (!userData) {
//                         return res.status(404).send({ status: 404, message: "User not found" });
//                 } else {
//                         const findCart = await Cart.findOne({ userId: userData._id });
//                         if (findCart) {
//                                 const findService = await service.findById({ _id: req.body._id });
//                                 const existingService = findCart.services.find(service => service.serviceId.equals(findService._id));
//                                 if (existingService) {
//                                         existingService.quantity += req.body.quantity;
//                                         existingService.total = existingService.price * existingService.quantity;
//                                         findCart.totalAmount += existingService.price * req.body.quantity;
//                                         findCart.paidAmount += existingService.price * req.body.quantity;
//                                         await findCart.save();
//                                         return res.status(200).json({ status: 200, message: "Service quantity updated in the cart.", data: findCart });
//                                 } else {
//                                         const price = findService.discountActive ? findService.discountPrice : findService.originalPrice;
//                                         const newService = {
//                                                 serviceId: findService._id,
//                                                 price: price,
//                                                 quantity: req.body.quantity,
//                                                 total: price * req.body.quantity,
//                                                 // type: "Service"
//                                                 type: findService.type,
//                                                 packageType: findService.packageType,
//                                         };
//                                         findCart.services.push(newService);
//                                         findCart.totalAmount += newService.total;
//                                         findCart.paidAmount += newService.total;
//                                         findCart.totalItem++;
//                                         await findCart.save();
//                                         return res.status(200).json({ status: 200, message: "Service added to the cart.", data: findCart });
//                                 }

//                         } else {
//                                 let findService = await service.findById({ _id: req.body._id });
//                                 if (findService) {
//                                         let Charged = [], paidAmount = 0, totalAmount = 0, additionalFee = 0;
//                                         const findCharge = await Charges.find({});
//                                         if (findCharge.length > 0) {
//                                                 for (let i = 0; i < findCharge.length; i++) {
//                                                         let obj1 = {
//                                                                 chargeId: findCharge[i]._id,
//                                                                 charge: findCharge[i].charge,
//                                                                 discountCharge: findCharge[i].discountCharge,
//                                                                 discount: findCharge[i].discount,
//                                                                 cancelation: findCharge[i].cancelation,
//                                                         }
//                                                         if (findCharge[i].cancelation == false) {
//                                                                 if (findCharge[i].discount == true) {
//                                                                         additionalFee = additionalFee + findCharge[i].discountCharge
//                                                                 } else {
//                                                                         additionalFee = additionalFee + findCharge[i].charge
//                                                                 }
//                                                         }
//                                                         Charged.push(obj1)
//                                                 }
//                                         }
//                                         if (findService.type == "Package") {
//                                                 if (findService.packageType == "Normal") {
//                                                         let price = 0;
//                                                         if (findService.discountActive == true) {
//                                                                 price = findService.discountPrice;
//                                                         } else {
//                                                                 price = findService.originalPrice;
//                                                         }
//                                                         totalAmount = Number(price * req.body.quantity).toFixed(2);
//                                                         paidAmount = (Number((price * req.body.quantity).toFixed(2)) + Number(additionalFee))
//                                                         console.log(totalAmount, additionalFee, paidAmount);
//                                                         let obj = {
//                                                                 userId: userData._id,
//                                                                 Charges: Charged,
//                                                                 services: [{
//                                                                         serviceId: findService._id,
//                                                                         price: price,
//                                                                         quantity: req.body.quantity,
//                                                                         total: price * req.body.quantity,
//                                                                         type: "Package",
//                                                                         packageType: "Normal",
//                                                                 }],
//                                                                 totalAmount: totalAmount,
//                                                                 additionalFee: additionalFee,
//                                                                 paidAmount: paidAmount,
//                                                                 totalItem: 1,
//                                                         }
//                                                         const Data = await Cart.create(obj);
//                                                         return res.status(200).json({ status: 200, message: "Service successfully add to cart. ", data: Data })
//                                                 }
//                                         }
//                                 } else {
//                                         return res.status(404).send({ status: 404, message: "Service not found" });
//                                 }
//                         }
//                 }
//         } catch (error) {
//                 console.error(error);
//                 return res.status(500).send({ status: 500, message: "Server error" + error.message });
//         }
// };
// exports.addToCartPackageCustomise = async (req, res) => {
//         try {
//                 const userData = await User.findOne({ _id: req.user._id });
//                 if (!userData) {
//                         return res.status(404).send({ status: 404, message: "User not found" });
//                 } else {
//                         const findCart = await Cart.findOne({ userId: userData._id });
//                         if (findCart) {
//                                 const findService = await service.findById({ _id: req.body._id });
//                                 const existingService = findCart.services.find(service => service.serviceId.equals(findService._id));
//                                 if (existingService) {
//                                         existingService.quantity += req.body.quantity;
//                                         existingService.total = existingService.price * existingService.quantity;

//                                         findCart.totalAmount += existingService.price * req.body.quantity;
//                                         findCart.paidAmount += existingService.price * req.body.quantity;

//                                         await findCart.save();

//                                         return res.status(200).json({ status: 200, message: "Service quantity updated in the cart.", data: findCart });

//                                 } else {
//                                         const price = findService.discountActive ? findService.discountPrice : findService.originalPrice;

//                                         const newService = {
//                                                 serviceId: findService._id,
//                                                 price: price,
//                                                 quantity: req.body.quantity,
//                                                 total: price * req.body.quantity,
//                                                 // type: "Service"
//                                                 type: findService.type,
//                                                 packageType: findService.packageType,
//                                         };

//                                         findCart.services.push(newService);

//                                         findCart.totalAmount += newService.total;
//                                         findCart.paidAmount += newService.total;
//                                         findCart.totalItem++;

//                                         await findCart.save();

//                                         return res.status(200).json({ status: 200, message: "Service added to the cart.", data: findCart });
//                                 }

//                         } else {
//                                 let findService = await service.findById({ _id: req.body._id });
//                                 if (findService) {
//                                         let Charged = [], paidAmount = 0, totalAmount = 0, additionalFee = 0;
//                                         const findCharge = await Charges.find({});
//                                         if (findCharge.length > 0) {
//                                                 for (let i = 0; i < findCharge.length; i++) {
//                                                         let obj1 = {
//                                                                 chargeId: findCharge[i]._id,
//                                                                 charge: findCharge[i].charge,
//                                                                 discountCharge: findCharge[i].discountCharge,
//                                                                 discount: findCharge[i].discount,
//                                                                 cancelation: findCharge[i].cancelation,
//                                                         }
//                                                         if (findCharge[i].cancelation == false) {
//                                                                 if (findCharge[i].discount == true) {
//                                                                         additionalFee = additionalFee + findCharge[i].discountCharge
//                                                                 } else {
//                                                                         additionalFee = additionalFee + findCharge[i].charge
//                                                                 }
//                                                         }
//                                                         Charged.push(obj1)
//                                                 }
//                                         }
//                                         if (findService.type == "Package") {
//                                                 if (findService.packageType == "Customise") {
//                                                         let price = 0, services = [];
//                                                         if (findService.discountActive == true) {
//                                                                 price = findService.discountPrice;
//                                                         } else {
//                                                                 price = findService.originalPrice;
//                                                         }
//                                                         totalAmount = Number(price * req.body.quantity).toFixed(2);
//                                                         paidAmount = (Number((price * req.body.quantity).toFixed(2)) + Number(additionalFee))
//                                                         if (findService.selectedCount == (req.body.packageServices).length) {
//                                                                 let obj = {
//                                                                         serviceId: findService._id,
//                                                                         packageServices: req.body.packageServices,
//                                                                         price: price,
//                                                                         quantity: req.body.quantity,
//                                                                         total: price * req.body.quantity,
//                                                                         type: "Package",
//                                                                         packageType: "Customise",
//                                                                 }
//                                                                 services.push(obj)
//                                                                 let obj1 = {
//                                                                         userId: userData._id,
//                                                                         Charges: Charged,
//                                                                         services: services,
//                                                                         totalAmount: totalAmount,
//                                                                         additionalFee: additionalFee,
//                                                                         paidAmount: paidAmount,
//                                                                         totalItem: 1,
//                                                                 }
//                                                                 const Data = await Cart.create(obj1);
//                                                                 return res.status(200).json({ status: 200, message: "Service successfully add to cart. ", data: Data })
//                                                         } else {
//                                                                 return res.status(201).send({ status: 201, message: `You can select only ${findService.selectedCount} not more than ${findService.selectedCount}` });
//                                                         }
//                                                 }
//                                         }

//                                 } else {
//                                         return res.status(404).send({ status: 404, message: "Service not found" });
//                                 }
//                         }
//                 }
//         } catch (error) {
//                 console.error(error);
//                 return res.status(500).send({ status: 500, message: "Server error" + error.message });
//         }
// };
// exports.addToCartPackageEdit = async (req, res) => {
//         try {
//                 const userData = await User.findOne({ _id: req.user._id });
//                 if (!userData) {
//                         return res.status(404).send({ status: 404, message: "User not found" });
//                 } else {
//                         const findCart = await Cart.findOne({ userId: userData._id });
//                         if (findCart) {
//                                 const findService = await service.findById({ _id: req.body._id });
//                                 const existingService = findCart.services.find(service => service.serviceId.equals(findService._id));
//                                 if (existingService) {
//                                         existingService.quantity += req.body.quantity;
//                                         existingService.total = existingService.price * existingService.quantity;

//                                         findCart.totalAmount += existingService.price * req.body.quantity;
//                                         findCart.paidAmount += existingService.price * req.body.quantity;

//                                         await findCart.save();

//                                         return res.status(200).json({ status: 200, message: "Service quantity updated in the cart.", data: findCart });

//                                 } else {
//                                         const price = findService.discountActive ? findService.discountPrice : findService.originalPrice;

//                                         const newService = {
//                                                 serviceId: findService._id,
//                                                 price: price,
//                                                 quantity: req.body.quantity,
//                                                 total: price * req.body.quantity,
//                                                 // type: "Service"
//                                                 type: findService.type,
//                                                 packageType: findService.packageType,
//                                         };

//                                         findCart.services.push(newService);

//                                         findCart.totalAmount += newService.total;
//                                         findCart.paidAmount += newService.total;
//                                         findCart.totalItem++;

//                                         await findCart.save();

//                                         return res.status(200).json({ status: 200, message: "Service added to the cart.", data: findCart });
//                                 }

//                         } else {
//                                 let findService = await service.findById({ _id: req.body._id });
//                                 if (findService) {
//                                         let Charged = [], paidAmount = 0, totalAmount = 0, additionalFee = 0;
//                                         const findCharge = await Charges.find({});
//                                         if (findCharge.length > 0) {
//                                                 for (let i = 0; i < findCharge.length; i++) {
//                                                         let obj1 = {
//                                                                 chargeId: findCharge[i]._id,
//                                                                 charge: findCharge[i].charge,
//                                                                 discountCharge: findCharge[i].discountCharge,
//                                                                 discount: findCharge[i].discount,
//                                                                 cancelation: findCharge[i].cancelation,
//                                                         }
//                                                         if (findCharge[i].cancelation == false) {
//                                                                 if (findCharge[i].discount == true) {
//                                                                         additionalFee = additionalFee + findCharge[i].discountCharge
//                                                                 } else {
//                                                                         additionalFee = additionalFee + findCharge[i].charge
//                                                                 }
//                                                         }
//                                                         Charged.push(obj1)
//                                                 }
//                                         }
//                                         if (findService.type == "Package") {
//                                                 if (findService.packageType == "Edit") {
//                                                         console.log(findService);
//                                                         let categoryServices = [];
//                                                         if (!req.body.servicePackageId) {
//                                                                 return res.status(400).json({ status: 400, message: "Package Service not edit." })
//                                                         }
//                                                         let findServicePackage = await servicePackage.findById({ _id: req.body.servicePackageId })
//                                                         if (findServicePackage) {
//                                                                 for (let i = 0; i < req.body.packageServices.length; i++) {
//                                                                         let findService1 = await service.findById({ _id: req.body.packageServices[i] });
//                                                                         let price = 0;
//                                                                         if (findService.discountActive == true) {
//                                                                                 price = findService.discountPrice;
//                                                                         } else {
//                                                                                 price = findService.originalPrice;
//                                                                         }
//                                                                         let obj = {
//                                                                                 service: findService1,
//                                                                                 price: price,
//                                                                                 quantity: 1,
//                                                                                 total: price,
//                                                                         }
//                                                                         categoryServices.push(obj)
//                                                                 }
//                                                         }
//                                                         let total = 0;
//                                                         for (let j = 0; j < categoryServices.length; j++) {
//                                                                 total = total + categoryServices[j].total
//                                                         }
//                                                         totalAmount = Number(total).toFixed(2);
//                                                         paidAmount = (Number((total).toFixed(2)) + Number(additionalFee))
//                                                         let obj = {
//                                                                 userId: userData._id,
//                                                                 Charges: Charged,
//                                                                 totalAmount: totalAmount,
//                                                                 services: [{
//                                                                         serviceId: findService._id,
//                                                                         categoryId: findServicePackage.categoryId,
//                                                                         services: categoryServices,
//                                                                         quantity: 1,
//                                                                         total: total,
//                                                                         type: "Package",
//                                                                         packageType: "Edit",
//                                                                 }],
//                                                                 additionalFee: additionalFee,
//                                                                 paidAmount: paidAmount,
//                                                                 totalItem: 1,
//                                                         }
//                                                         console.log(obj);
//                                                         const Data = await Cart.create(obj);
//                                                         return res.status(200).json({ status: 200, message: "Service successfully add to cart. ", data: Data })
//                                                 }
//                                         }
//                                 } else {
//                                         return res.status(404).send({ status: 404, message: "Service not found" });
//                                 }
//                         }
//                 }
//         } catch (error) {
//                 console.error(error);
//                 return res.status(500).send({ status: 500, message: "Server error" + error.message });
//         }
// };

exports.addToCartSingleService = async (req, res) => {
        try {
                const userData = await User.findOne({ _id: req.user._id });
                if (!userData) {
                        return res.status(404).send({ status: 404, message: "User not found" });
                } else {
                        const findCart = await Cart.findOne({ userId: userData._id });
                        if (findCart) {
                                const findService = await service.findById({ _id: req.body._id });
                                const existingService = findCart.services.find(service => service.serviceId.equals(findService._id));
                                if (req.body.quantity <= 0) {
                                        return res.status(400).json({ status: 400, message: "Quantity must be a greater than 0 number." });
                                }

                                const serviceTypeId = req.body.serviceTypeId;

                                if (existingService) {
                                        existingService.quantity += req.body.quantity;
                                        existingService.total = existingService.price * existingService.quantity;
                                        findCart.totalAmount += existingService.price * req.body.quantity;
                                        findCart.paidAmount += existingService.price * req.body.quantity;
                                        await findCart.save();
                                        return res.status(200).json({ status: 200, message: "Service quantity updated in the cart.", data: findCart });
                                } else {
                                        const price = findService.discountActive ? findService.discountPrice : findService.originalPrice;
                                        const newService = {
                                                serviceId: findService._id,
                                                price: price,
                                                quantity: req.body.quantity,
                                                total: price * req.body.quantity,
                                                // type: "Service"
                                                type: findService.type,
                                                packageType: findService.packageType,
                                                serviceTypeId: serviceTypeId,

                                        };
                                        findCart.services.push(newService);
                                        findCart.totalAmount += newService.total;
                                        findCart.paidAmount += newService.total;
                                        findCart.totalItem++;
                                        await findCart.save();
                                        return res.status(200).json({ status: 200, message: "Service added to the cart.", data: findCart });
                                }
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
                                                                packageServices: req.body.packageServices,
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
                                } else {
                                        return res.status(404).send({ status: 404, message: "Service not found" });
                                }
                        }
                }
        } catch (error) {
                console.error(error);
                return res.status(500).send({ status: 500, message: "Server error" + error.message });
        }
}
exports.addToCartPackageNormal = async (req, res) => {
        try {
                const userData = await User.findOne({ _id: req.user._id });
                if (!userData) {
                        return res.status(404).send({ status: 404, message: "User not found" });
                } else {
                        const findCart = await Cart.findOne({ userId: userData._id });
                        if (findCart) {
                                const findService = await service.findById({ _id: req.body._id });
                                const existingService = findCart.services.find(service => service.serviceId.equals(findService._id));
                                if (req.body.quantity <= 0) {
                                        return res.status(400).json({ status: 400, message: "Quantity must be a positive number greater than zero." });
                                }
                                if (existingService) {
                                        existingService.quantity += req.body.quantity;
                                        existingService.total = existingService.price * existingService.quantity;
                                        findCart.totalAmount += existingService.price * req.body.quantity;
                                        findCart.paidAmount += existingService.price * req.body.quantity;
                                        await findCart.save();
                                        return res.status(200).json({ status: 200, message: "Service quantity updated in the cart.", data: findCart });
                                } else {
                                        const price = findService.discountActive ? findService.discountPrice : findService.originalPrice;
                                        const newService = {
                                                serviceId: findService._id,
                                                price: price,
                                                quantity: req.body.quantity,
                                                total: price * req.body.quantity,
                                                type: findService.type,
                                                packageType: findService.packageType,
                                        };
                                        findCart.services.push(newService);
                                        findCart.totalAmount += newService.total;
                                        findCart.paidAmount += newService.total;
                                        findCart.totalItem++;
                                        await findCart.save();
                                        return res.status(200).json({ status: 200, message: "Service added to the cart.", data: findCart });
                                }

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
                                        if (findService.type == "Package") {
                                                if (findService.packageType == "Normal") {
                                                        let price = 0;
                                                        if (findService.discountActive == true) {
                                                                price = findService.discountPrice;
                                                        } else {
                                                                price = findService.originalPrice;
                                                        }
                                                        if (req.body.quantity <= 0) {
                                                                return res.status(400).json({ status: 400, message: "Quantity must be a positive number greater than zero." });
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
exports.addToCartPackageCustomise = async (req, res) => {
        try {
                const userData = await User.findOne({ _id: req.user._id });
                if (!userData) {
                        return res.status(404).send({ status: 404, message: "User not found" });
                } else {
                        const findCart = await Cart.findOne({ userId: userData._id });
                        if (findCart) {
                                const findService = await service.findById({ _id: req.body._id });
                                const existingService = findCart.services.find(service => service.serviceId.equals(findService._id));
                                if (req.body.quantity <= 0) {
                                        return res.status(400).json({ status: 400, message: "Quantity must be a positive number greater than zero." });
                                }
                                if (existingService) {
                                        existingService.quantity += req.body.quantity;
                                        existingService.total = existingService.price * existingService.quantity;

                                        findCart.totalAmount += existingService.price * req.body.quantity;
                                        findCart.paidAmount += existingService.price * req.body.quantity;

                                        await findCart.save();

                                        return res.status(200).json({ status: 200, message: "Service quantity updated in the cart.", data: findCart });

                                } else {
                                        const price = findService.discountActive ? findService.discountPrice : findService.originalPrice;

                                        const newService = {
                                                serviceId: findService._id,
                                                price: price,
                                                quantity: req.body.quantity,
                                                total: price * req.body.quantity,
                                                type: findService.type,
                                                packageType: findService.packageType,
                                        };

                                        findCart.services.push(newService);

                                        findCart.totalAmount += newService.total;
                                        findCart.paidAmount += newService.total;
                                        findCart.totalItem++;

                                        await findCart.save();

                                        return res.status(200).json({ status: 200, message: "Service added to the cart.", data: findCart });
                                }

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
                                        if (findService.type == "Package") {
                                                if (findService.packageType == "Customise") {
                                                        let price = 0, services = [];
                                                        if (findService.discountActive == true) {
                                                                price = findService.discountPrice;
                                                        } else {
                                                                price = findService.originalPrice;
                                                        }
                                                        if (req.body.quantity <= 0) {
                                                                return res.status(400).json({ status: 400, message: "Quantity must be a positive number greater than zero." });
                                                        }
                                                        totalAmount = Number(price * req.body.quantity).toFixed(2);
                                                        paidAmount = (Number((price * req.body.quantity).toFixed(2)) + Number(additionalFee))
                                                        console.log(totalAmount, additionalFee, paidAmount);
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
                                                                return res.status(201).send({ status: 201, message: `You can select only ${findService.selectedCount} services, not more than ${findService.selectedCount}` });
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
exports.addToCartPackageEdit = async (req, res) => {
        try {
                const userData = await User.findOne({ _id: req.user._id });
                if (!userData) {
                        return res.status(404).send({ status: 404, message: "User not found" });
                } else {
                        const findCart = await Cart.findOne({ userId: userData._id });
                        if (findCart) {
                                const findService = await service.findById({ _id: req.body._id });
                                const existingService = findCart.services.find(service => service.serviceId.equals(findService._id));
                                if (req.body.quantity <= 0) {
                                        return res.status(400).json({ status: 400, message: "Quantity must be a positive number greater than zero." });
                                }
                                if (existingService) {
                                        existingService.quantity += req.body.quantity;
                                        existingService.total = existingService.price * existingService.quantity;

                                        findCart.totalAmount += existingService.price * req.body.quantity;
                                        findCart.paidAmount += existingService.price * req.body.quantity;

                                        await findCart.save();

                                        return res.status(200).json({ status: 200, message: "Service quantity updated in the cart.", data: findCart });

                                } else {
                                        const price = findService.discountActive ? findService.discountPrice : findService.originalPrice;

                                        const newService = {
                                                serviceId: findService._id,
                                                price: price,
                                                quantity: req.body.quantity,
                                                total: price * req.body.quantity,
                                                type: findService.type,
                                                packageType: findService.packageType,
                                        };

                                        findCart.services.push(newService);

                                        findCart.totalAmount += newService.total;
                                        findCart.paidAmount += newService.total;
                                        findCart.totalItem++;

                                        await findCart.save();

                                        return res.status(200).json({ status: 200, message: "Service added to the cart.", data: findCart });
                                }

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
                                        if (findService.type == "Package") {
                                                if (findService.packageType == "Edit") {
                                                        console.log(findService);
                                                        let categoryServices = [];
                                                        if (!req.body.servicePackageId) {
                                                                return res.status(400).json({ status: 400, message: "Package Service not edit." })
                                                        }
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
                                                                                service: findService1,
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
                                                        if (req.body.quantity <= 0) {
                                                                return res.status(400).json({ status: 400, message: "Quantity must be a positive number greater than zero." });
                                                        }
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
                                                        return res.status(200).json({ status: 200, message: "Service successfully added to the cart. ", data: Data })
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

// exports.removeFromCart1 = async (req, res) => {
//         try {
//                 const userData = await User.findOne({ _id: req.user._id });
//                 if (!userData) {
//                         return res.status(404).send({ status: 404, message: "User not found" });
//                 } else {
//                         const findCart = await Cart.findOne({ userId: userData._id });
//                         if (!findCart) {
//                                 return res.status(404).send({ status: 404, message: "Cart not found" });
//                         }

//                         const serviceIdToRemove = req.body.serviceId;

//                         const serviceIndex = findCart.services.findIndex(service => service.serviceId.equals(serviceIdToRemove));

//                         if (serviceIndex !== -1) {
//                                 const removedService = findCart.services.splice(serviceIndex, 1)[0];
//                                 findCart.totalAmount -= removedService.total;
//                                 findCart.paidAmount -= removedService.total;
//                                 findCart.totalItem--;

//                                 await findCart.save();

//                                 return res.status(200).json({ status: 200, message: "Service removed from the cart.", data: findCart });
//                         } else {
//                                 return res.status(404).send({ status: 404, message: "Service not found in the cart" });
//                         }
//                 }
//         } catch (error) {
//                 console.error(error);
//                 return res.status(500).send({ status: 500, message: "Server error" + error.message });
//         }
// };

exports.removeFromCart = async (req, res) => {
        try {
                const userData = await User.findOne({ _id: req.user._id });
                if (!userData) {
                        return res.status(404).send({ status: 404, message: "User not found" });
                } else {
                        const findCart = await Cart.findOne({ userId: userData._id });
                        if (!findCart) {
                                return res.status(404).send({ status: 404, message: "Cart not found" });
                        }

                        const serviceIdToRemove = req.body.serviceId;

                        let serviceIndex =
                                findCart.services &&
                                findCart.services.findIndex((service) =>
                                        service.serviceId.equals(serviceIdToRemove)
                                );

                        let freeServiceIndex =
                                findCart.freeService &&
                                findCart.freeService.findIndex((freeService) =>
                                        freeService.freeServiceId.toString() === serviceIdToRemove
                                );

                        if (serviceIndex !== -1) {
                                const removedService = findCart.services.splice(serviceIndex, 1)[0];
                                findCart.totalAmount -= removedService.total || 0;
                                findCart.paidAmount -= removedService.total || 0;
                                findCart.totalItem--;
                        } else if (freeServiceIndex !== -1) {
                                findCart.freeService.splice(freeServiceIndex, 1);
                                findCart.freeServiceCount = (findCart.freeServiceCount || 0) - 1;
                        } else {
                                return res
                                        .status(404)
                                        .send({ status: 404, message: "Service not found in the cart" });
                        }

                        if (findCart.services.length === 0) {
                                await Cart.findByIdAndDelete({ _id: findCart._id });
                                return res.status(200).json({
                                        status: 200,
                                        message: "Cart permanently deleted as it is empty.",
                                });
                        } else {
                                await findCart.save();
                                return res.status(200).json({
                                        status: 200,
                                        message: "Service removed from the cart.",
                                        data: findCart,
                                });
                        }
                }
        } catch (error) {
                console.error(error);
                return res
                        .status(500)
                        .send({ status: 500, message: "Server error" + error.message });
        }
};

// exports.addToCart = async (req, res) => {
//         try {
//                 const userData = await User.findOne({ _id: req.user._id });

//                 if (!userData) {
//                         return res.status(404).send({ status: 404, message: "User not found" });
//                 }

//                 let findCart = await Cart.findOne({ userId: userData._id });

//                 if (!findCart) {
//                         findCart = new Cart({
//                                 userId: userData._id,
//                                 totalItem: 0,
//                                 freeService: [],
//                                 Charges: [],
//                                 packageServices: [],
//                                 services: [],
//                         });
//                 }

//                 const findService = await service.findById({ _id: req.body._id });

//                 if (!findService) {
//                         return res.status(404).send({ status: 404, message: "Service not found" });
//                 }

//                 const price = findService.discountActive ? findService.discountPrice : findService.originalPrice;
//                 const quantity = req.body.quantity;
//                 const total = price * quantity;

//                 let additionalFee = 0;

//                 let Charged = [];

//                 const findCharge = await Charges.find({});
//                 if (findCharge.length > 0) {
//                         for (let i = 0; i < findCharge.length; i++) {
//                                 let obj1 = {
//                                         chargeId: findCharge[i]._id,
//                                         charge: findCharge[i].charge,
//                                         discountCharge: findCharge[i].discountCharge,
//                                         discount: findCharge[i].discount,
//                                         cancelation: findCharge[i].cancelation,
//                                 };
//                                 if (findCharge[i].cancelation == false) {
//                                         if (findCharge[i].discount == true) {
//                                                 additionalFee = additionalFee + findCharge[i].discountCharge;
//                                         } else {
//                                                 additionalFee = additionalFee + findCharge[i].charge;
//                                         }
//                                 }
//                                 Charged.push(obj1);
//                         }
//                 }

//                 const existingServiceIndex = findCart.services.findIndex(service => service.serviceId.equals(findService._id));

//                 if (existingServiceIndex !== -1) {
//                         findCart.services[existingServiceIndex].quantity += quantity;
//                         findCart.services[existingServiceIndex].total += total;
//                 } else {
//                         findCart.services.push({
//                                 serviceId: findService._id,
//                                 price: price,
//                                 quantity: quantity,
//                                 total: total,
//                                 type: "Service"
//                         });
//                 }

//                 findCart.totalAmount += total;
//                 findCart.paidAmount += total;

//                 findCart.totalItem += quantity; 

//                 await findCart.save();

//                 if (findService.type === "Package") {
//                         if (findService.packageType === "Edit") {
//                                 let categoryServices = [];
//                                 let findServicePackage = await servicePackage.findById({ _id: req.body.servicePackageId });
//                                 if (!req.body || !req.body.packageServices) {
//                                         return res.status(400).send({ status: 400, message: "Invalid request body" });
//                                 }

//                                 if (findServicePackage) {
//                                         for (let i = 0; i < req.body.packageServices.length; i++) {
//                                                 let findService1 = await service.findById({ _id: req.body.packageServices[i] });
//                                                 let servicePrice = findService1.discountActive ? findService1.discountPrice : findService1.originalPrice;

//                                                 let obj = {
//                                                         service: findService1._id,
//                                                         price: servicePrice,
//                                                         quantity: 1,
//                                                         total: servicePrice,
//                                                 };

//                                                 categoryServices.push(obj);
//                                         }
//                                 }

//                                 let total = 0;
//                                 for (let j = 0; j < categoryServices.length; j++) {
//                                         total += categoryServices[j].total;
//                                 }

//                                 totalAmount = total.toFixed(2);
//                                 paidAmount = (parseFloat(totalAmount) + parseFloat(additionalFee)).toFixed(2);

//                                 const obj = {
//                                         userId: userData._id,
//                                         Charges: Charged, // Make sure to define Charged properly
//                                         totalAmount: totalAmount,
//                                         services: [{
//                                                 serviceId: findService._id,
//                                                 categoryId: findServicePackage.categoryId,
//                                                 services: categoryServices,
//                                                 quantity: 1,
//                                                 total: total,
//                                                 type: "Package",
//                                                 packageType: "Edit",
//                                         }],
//                                         additionalFee: additionalFee,
//                                         paidAmount: paidAmount,
//                                         totalItem: 1,
//                                 };

//                                 const Data = await Cart.create(obj);
//                                 return res.status(200).json({ status: 200, message: "Service successfully added to cart.", data: Data });
//                         } else if (findService.packageType === "Normal") {
//                                 let totalAmount = (price * quantity).toFixed(2);
//                                 let paidAmount = (parseFloat(totalAmount) + parseFloat(additionalFee)).toFixed(2);

//                                 const obj = {
//                                         userId: userData._id,
//                                         Charges: Charged, // Make sure to define Charged properly
//                                         services: [{
//                                                 serviceId: findService._id,
//                                                 price: price,
//                                                 quantity: quantity,
//                                                 total: totalAmount,
//                                                 type: "Package",
//                                                 packageType: "Normal",
//                                         }],
//                                         totalAmount: totalAmount,
//                                         additionalFee: additionalFee,
//                                         paidAmount: paidAmount,
//                                         totalItem: 1,
//                                 };

//                                 const Data = await Cart.create(obj);

//                                 return res.status(200).json({ status: 200, message: "Service successfully added to cart.", data: Data });
//                         } else if (findService.packageType === "Customise") {
//                                 let services = [];
//                                 if (findService.selectedCount === req.body.packageServices.length) {
//                                         let totalAmount = (price * quantity).toFixed(2);
//                                         let paidAmount = (parseFloat(totalAmount) + parseFloat(additionalFee)).toFixed(2);

//                                         let obj = {
//                                                 serviceId: findService._id,
//                                                 packageServices: req.body.packageServices,
//                                                 price: price,
//                                                 quantity: quantity,
//                                                 total: totalAmount,
//                                                 type: "Package",
//                                                 packageType: "Customise",
//                                         };

//                                         services.push(obj);

//                                         let obj1 = {
//                                                 userId: userData._id,
//                                                 Charges: Charged, // Make sure to define Charged properly
//                                                 services: services,
//                                                 totalAmount: totalAmount,
//                                                 additionalFee: additionalFee,
//                                                 paidAmount: paidAmount,
//                                                 totalItem: 1,
//                                         };

//                                         const Data = await Cart.create(obj1);

//                                         return res.status(200).json({ status: 200, message: "Service successfully added to cart.", data: Data });
//                                 } else {
//                                         return res.status(201).send({ status: 201, message: `You can select only ${findService.selectedCount} not more than ${findService.selectedCount}` });
//                                 }
//                         }
//                 } else {
//                         return res.status(200).json({
//                                 status: 200, message: "Service added/updated in the cart.", data: findCart,
//                         });
//                 }
//         } catch (error) {
//                 console.error(error);
//                 return res.status(500).send({ status: 500, message: "Server error" + error.message });
//         }
// };

//


//
exports.addServiceToCart = async (req, res) => {
        try {
                const userData = await User.findOne({ _id: req.user._id });
                if (!userData) {
                        return res.status(404).send({ status: 404, message: "User not found" });
                }

                const findService = await service.findById({ _id: req.body._id });
                if (!findService) {
                        return res.status(404).send({ status: 404, message: "Service not found" });
                }

                let findCart = await Cart.findOne({ userId: userData._id });
                if (!findCart) {
                        findCart = await createCart(userData);
                }

                // Ensure that price and quantity are valid numbers
                const price = parseFloat(findService.discountActive ? findService.discountPrice : findService.originalPrice);
                const quantity = parseInt(req.body.quantity);

                if (isNaN(price) || isNaN(quantity) || quantity <= 0) {
                        return res.status(400).json({ status: 400, message: "Invalid price or quantity" });
                }

                const result = await addToCart(findCart, findService, quantity, price);

                return res.status(result.status).json(result.data);
        } catch (error) {
                console.error(error);
                return res.status(500).send({ status: 500, message: "Server error" + error.message });
        }
};

// exports.updateServiceQuantity = async (req, res) => {
//         try {
//           const { serviceId } = req.params;
//           const { quantity } = req.body;

//           const userData = await User.findOne({ _id: req.user._id });
//           if (!userData) {
//             return res.status(404).send({ status: 404, message: "User not found" });
//           }

//           const findCart = await Cart.findOne({ userId: userData._id });
//           if (!findCart) {
//             return res.status(404).send({ status: 404, message: "Cart not found" });
//           }

//           const existingService = findCart.services.find(service => service.serviceId.equals(serviceId));
//           if (!existingService) {
//             return res.status(404).send({ status: 404, message: "Service not found in the cart" });
//           }

//           existingService.quantity = quantity;
//           existingService.total = existingService.price * quantity;

//           findCart.totalAmount = findCart.services.reduce((total, service) => total + service.total, 0);
//           findCart.paidAmount = findCart.totalAmount;

//           await findCart.save();

//           return res.status(200).json({ status: 200, message: "Service quantity updated in the cart.", data: findCart });
//         } catch (error) {
//           console.error(error);
//           return res.status(500).send({ status: 500, message: "Server error" + error.message });
//         }
//       };

exports.updateServiceQuantity = async (req, res) => {
        try {
                const { serviceId } = req.params;
                const { quantity } = req.body;

                if (quantity <= 0) {
                        return res.status(400).json({ status: 400, message: "Quantity must be a positive number greater than zero." });
                }

                const userData = await User.findOne({ _id: req.user._id });
                if (!userData) {
                        return res.status(404).send({ status: 404, message: "User not found" });
                }

                const findCart = await Cart.findOne({ userId: userData._id });
                if (!findCart) {
                        return res.status(404).send({ status: 404, message: "Cart not found" });
                }

                const existingService = findCart.services.find(service => service.serviceId.equals(serviceId));
                if (!existingService) {
                        return res.status(404).send({ status: 404, message: "Service not found in the cart" });
                }

                const oldQuantity = existingService.quantity;
                existingService.quantity = quantity;
                existingService.total = existingService.price * quantity;

                findCart.totalAmount = findCart.services.reduce((total, service) => total + service.total, 0);
                findCart.paidAmount += (existingService.price * (quantity - oldQuantity));

                await findCart.save();

                return res.status(200).json({ status: 200, message: "Service quantity updated in the cart.", data: findCart });
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
// exports.addFreeServiceToCart = async (req, res) => {
//         try {
//                 let userData = await User.findOne({ _id: req.user._id });
//                 if (!userData) {
//                         return res.status(404).send({ status: 404, message: "User not found" });
//                 } else {
//                         let findCart = await Cart.findOne({ userId: userData._id });
//                         if (findCart) {
//                                 if (findCart.services.length == 0) {
//                                         return res.status(404).json({ status: 404, message: "First add service in your cart.", data: {} });
//                                 } else {
//                                         const findFreeService = await freeService.findOne({ _id: req.body.freeServiceId, userId: req.user._id })
//                                         if (findFreeService) {
//                                                 let obj = {
//                                                         freeServiceId: findFreeService._id
//                                                 }
//                                                 let update1 = await Cart.findByIdAndUpdate({ _id: findCart._id }, { $set: { freeServiceUsed: true, freeServiceCount: findCart.freeServiceCount + 1 }, $push: { freeService: obj } }, { new: true });
//                                                 return res.status(200).json({ status: 200, message: "Free service add to cart Successfully.", data: update1 })
//                                         } else {
//                                                 return res.status(404).send({ status: 404, message: "Free service not found" });
//                                         }
//                                 }
//                         } else {
//                                 return res.status(404).json({ status: 404, message: "Cart is empty.", data: {} });
//                         }
//                 }
//         } catch (error) {
//                 console.error(error);
//                 return res.status(500).send({ status: 500, message: "Server error" + error.message });
//         }
// };


// exports.addFreeServiceToCart = async (req, res) => {
//         try {
//                 const userId = req.user._id;
//                 const freeServiceId = req.body.freeServiceId;

//                 const userData = await User.findOne({ _id: userId });
//                 if (!userData) {
//                         return res.status(404).json({ status: 404, message: "User not found" });
//                 }

//                 const findCart = await Cart.findOne({ userId });
//                 if (!findCart) {
//                         return res.status(404).json({ status: 404, message: "Cart is empty.", data: {} });
//                 }

//                 const findFreeService = await freeService.findOne({ _id: freeServiceId, userId });
//                 if (!findFreeService) {
//                         return res.status(404).json({ status: 404, message: "Free service not found" });
//                 }

//                 const isServiceInCart = findCart.freeService.some((service) => service.freeServiceId.equals(freeServiceId));

//                 if (isServiceInCart) {
//                         return res.status(200).json({ status: 200, message: "Free service is already in the cart.", data: findCart });
//                 }

//                 findCart.totalAmount = 0;
//                 findCart.additionalFee = 0;
//                 findCart.paidAmount = 0;
//                 findCart.totalItem = 0;
//                 findCart.services = [];
//                 findCart.freeServiceUsed = true;
//                 findCart.freeServiceCount += 1;
//                 findCart.freeService.push({ freeServiceId: findFreeService._id });

//                 const update1 = await findCart.save();

//                 return res
//                         .status(200)
//                         .json({ status: 200, message: "Free service added to cart successfully.", data: update1 });
//         } catch (error) {
//                 console.error(error);
//                 return res.status(500).json({ status: 500, message: "Server error: " + error.message });
//         }
// };

exports.addFreeServiceToCart = async (req, res) => {
        try {
                const userId = req.user._id;
                const freeServiceId = req.body.freeServiceId;

                const userData = await User.findOne({ _id: userId });
                if (!userData) {
                        return res.status(404).json({ status: 404, message: "User not found" });
                }

                const findCart = await Cart.findOne({ userId });
                if (!findCart) {
                        return res.status(404).json({ status: 404, message: "Cart is empty.", data: {} });
                }

                const findFreeService = await freeService.findOne({ _id: freeServiceId, userId });
                if (!findFreeService) {
                        return res.status(404).json({ status: 404, message: "Free service not found" });
                }

                const isServiceInCart = findCart.freeService.some(service => service.freeServiceId.equals(freeServiceId));

                if (isServiceInCart) {
                        return res.status(200).json({ status: 200, message: "Free service is already in the cart.", data: findCart });
                }

                const obj = {
                        freeServiceId: findFreeService._id
                };
                const update1 = await Cart.findByIdAndUpdate(
                        { _id: findCart._id },
                        {
                                $set: { freeServiceUsed: true, freeServiceCount: findCart.freeServiceCount + 1 },
                                $push: { freeService: obj }
                        },
                        { new: true }
                );

                return res.status(200).json({ status: 200, message: "Free service added to cart successfully.", data: update1 });
        } catch (error) {
                console.error(error);
                return res.status(500).json({ status: 500, message: "Server error: " + error.message });
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
// exports.addDateAndTimeToCart = async (req, res) => {
//         try {
//                 let userData = await User.findOne({ _id: req.user._id });
//                 if (!userData) {
//                         return res.status(404).send({ status: 404, message: "User not found" });
//                 } else {
//                         let findCart = await Cart.findOne({ userId: userData._id });
//                         if (findCart) {
//                                 if (findCart.services.length == 0) {
//                                         return res.status(404).send({ status: 404, message: "Your cart have no service found." });
//                                 } else {
//                                         const d = new Date(req.body.date);
//                                         let text = d.toISOString();
//                                         let update = await Cart.findByIdAndUpdate({ _id: findCart._id }, { $set: { Date: text, startTime: req.body.startTime, endTime: req.body.endTime } }, { new: true });
//                                         if (update) {
//                                                 return res.status(200).send({ status: 200, message: "Date And Time add to Cart successfully.", data: update });
//                                         }
//                                 }
//                         } else {
//                                 return res.status(404).send({ status: 404, message: "Your cart is not found." });
//                         }
//                 }
//         } catch (error) {
//                 console.error(error);
//                 return res.status(500).send({ status: 500, message: "Server error" + error.message });
//         }
// };

exports.addDateAndTimeToCart = async (req, res) => {
        try {
                let userData = await User.findOne({ _id: req.user._id });

                if (!userData) {
                        return res.status(404).send({ status: 404, message: "User not found" });
                }

                let findCart = await Cart.findOne({ userId: userData._id });

                if (findCart) {
                        if (findCart.services.length === 0) {
                                return res.status(404).send({ status: 404, message: "Your cart has no services found." });
                        }

                        const d = new Date(req.body.date);
                        let text = d.toISOString();

                        const isStartTimeValid = await DateAndTimeSlot.findOne({ startTime: req.body.startTime, isAvailable: true });
                        const isEndTimeValid = await DateAndTimeSlot.findOne({ endTime: req.body.endTime, isAvailable: true });

                        if (!isStartTimeValid || !isEndTimeValid) {
                                return res.status(400).send({ status: 400, message: "Invalid startTime or endTime. Please select an available time slot." });
                        }

                        let update = await Cart.findByIdAndUpdate(
                                { _id: findCart._id },
                                { $set: { Date: text, startTime: req.body.startTime, endTime: req.body.endTime } },
                                { new: true }
                        );

                        if (update) {
                                return res.status(200).send({ status: 200, message: "Date and Time added to the cart successfully.", data: update });
                        }
                } else {
                        return res.status(404).send({ status: 404, message: "Your cart is not found." });
                }
        } catch (error) {
                console.error(error);
                return res.status(500).send({ status: 500, message: "Server error: " + error.message });
        }
};

// exports.updateDateAndTimeByOrderId = async (req, res) => {
//         try {
//                 const orderId = req.body.orderId;
//                 const newDate = req.body.date;
//                 const startTime = req.body.startTime;
//                 const endTime = req.body.endTime;

//                 if (!orderId || !newDate || !startTime || !endTime) {
//                         return res.status(400).send({ status: 400, message: "Invalid request data." });
//                 }

//                 let userData = await User.findOne({ _id: req.user._id });
//                 console.log(userData);
//                 if (!userData) {
//                         return res.status(404).send({ status: 404, message: "User not found." });
//                 }

//                 const findOrder = await Order.findOne({ userId: userData._id, _id: orderId });

//                 if (!findOrder) {
//                         return res.status(404).send({ status: 404, message: "Order not found for the provided orderId." });
//                 }

//                 const d = new Date(newDate);
//                 const text = d.toISOString();

//                 const update = await Order.findByIdAndUpdate(
//                         { _id: findOrder._id },
//                         { $set: { Date: text, startTime: startTime, endTime: endTime } },
//                         { new: true }
//                 );

//                 if (update) {
//                         return res.status(200).send({ status: 200, message: "Date and time updated successfully.", data: update });
//                 } else {
//                         return res.status(500).send({ status: 500, message: "Failed to update date and time." });
//                 }
//         } catch (error) {
//                 console.error(error);
//                 return res.status(500).send({ status: 500, message: "Server error: " + error.message });
//         }
// };

exports.updateDateAndTimeByOrderId = async (req, res) => {
        try {
                const orderId = req.body.orderId;
                const newDate = req.body.date;
                const startTime = req.body.startTime;
                const endTime = req.body.endTime;

                if (!orderId || !newDate || !startTime || !endTime) {
                        return res.status(400).send({ status: 400, message: "Invalid request data." });
                }

                let userData = await User.findOne({ _id: req.user._id });
                console.log(userData);
                if (!userData) {
                        return res.status(404).send({ status: 404, message: "User not found." });
                }

                const findOrder = await Order.findOne({ userId: userData._id, _id: orderId });

                if (!findOrder) {
                        return res.status(404).send({ status: 404, message: "Order not found for the provided orderId." });
                }

                const isStartTimeValid = await DateAndTimeSlot.findOne({ startTime, isAvailable: true });
                const isEndTimeValid = await DateAndTimeSlot.findOne({ endTime, isAvailable: true });

                if (!isStartTimeValid || !isEndTimeValid) {
                        return res.status(400).send({ status: 400, message: "Please select an available time slot." });
                }

                const d = new Date(newDate);
                const text = d.toISOString();

                const update = await Order.findByIdAndUpdate(
                        { _id: findOrder._id },
                        { $set: { Date: text, startTime: startTime, endTime: endTime } },
                        { new: true }
                );

                if (update) {
                        return res.status(200).send({ status: 200, message: "Date and time updated successfully.", data: update });
                } else {
                        return res.status(500).send({ status: 500, message: "Failed to update date and time." });
                }
        } catch (error) {
                console.error(error);
                return res.status(500).send({ status: 500, message: "Server error: " + error.message });
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
                                const matchingTimeSlots = await DateAndTimeSlot.find({
                                        $and: [
                                                { isSlotPrice: true },
                                                { startTime: findCart.startTime, endTime: findCart.endTime },
                                        ],
                                });

                                let totalIsSlotPrice = 0;
                                for (const slot of matchingTimeSlots) {
                                        totalIsSlotPrice += slot.slotPrice;
                                }

                                findCart.paidAmount += totalIsSlotPrice;


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
                                        startTime: findCart.startTime,
                                        endTime: findCart.endTime,
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
                        if (req.body.paymentStatus == "Paid") {
                                let update = await orderModel.findByIdAndUpdate({ _id: findUserOrder._id }, { $set: { orderStatus: "confirmed", status: "confirmed", paymentStatus: "Paid" } }, { new: true });

                                await Cart.deleteOne({ userId: findUserOrder.userId });

                                return res.status(200).json({ message: "Payment success.", status: 200, data: update });
                        }
                        if (req.body.paymentStatus == "Failed") {
                                return res.status(201).json({ message: "Payment failed.", status: 201, orderId: orderId });
                        }
                } else {
                        return res.status(404).json({ message: "No data found", data: {} });
                }
        } catch (error) {
                return res.status(501).send({ status: 501, message: "server error.", data: {}, });
        }
};
exports.deleteOrder = async (req, res) => {
        try {
                const orderId = req.params.orderId;

                const deletedOrder = await orderModel.findOneAndDelete({ orderId });

                if (deletedOrder) {
                        return res.status(200).json({ message: 'Order deleted successfully', status: 200, data: deletedOrder });
                } else {
                        return res.status(404).json({ message: 'Order not found', data: {} });
                }
        } catch (error) {
                return res.status(500).json({ status: 500, message: 'Server error', data: {} });
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
// exports.getOngoingOrders = async (req, res) => {
//         try {
//                 const data = await orderModel.find({ userId: req.user._id, serviceStatus: "Pending" });
//                 if (data.length > 0) {
//                         return res.status(200).json({ message: "All orders", data: data });
//                 } else {
//                         return res.status(404).json({ status: 404, message: "No data found", data: {} });
//                 }
//         } catch (error) {
//                 console.log(error);
//                 return res.status(501).send({ status: 501, message: "server error.", data: {}, });
//         }
// };

exports.getOngoingOrders = async (req, res) => {
        try {
                const data = await orderModel
                        .find({ userId: req.user._id, serviceStatus: "Pending" })
                        .populate({
                                path: "freeService.freeServiceId"
                        })
                        .populate({
                                path: "services.serviceId"
                        })
                        .populate({
                                path: "Charges.chargeId",
                        })
                // .populate({
                //         path: "services.serviceId",
                //         populate: [
                //                 {
                //                         path: "mainCategoryId categoryId subCategoryId",
                //                 },
                //         ],
                // })

                if (data.length > 0) {
                        return res.status(200).json({ message: "All orders", data: data });
                } else {
                        return res.status(404).json({ status: 404, message: "No data found", data: {} });
                }
        } catch (error) {
                console.log(error);
                return res.status(501).send({ status: 501, message: "server error.", data: {} });
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
                        let findTicket = await favouriteBooking.find({ userId: findUser._id })
                                .populate({
                                        path: 'services.serviceId',
                                        model: 'services'

                                })
                                .populate({
                                        path: 'services.categoryId',
                                        model: 'Category',
                                        select: 'name image'
                                })
                                .populate({
                                        path: 'services',
                                        populate: {
                                                path: 'services.service',
                                                model: 'services',
                                                select: 'title images'
                                        }
                                });
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
exports.addMoney = async (req, res) => {
        try {
                const data = await User.findOne({ _id: req.user._id, });
                if (data) {
                        let update = await User.findByIdAndUpdate({ _id: data._id }, { $set: { wallet: data.wallet + parseInt(req.body.balance) } }, { new: true });
                        if (update) {
                                const date = new Date();
                                let month = date.getMonth() + 1
                                let obj = {
                                        user: req.user._id,
                                        date: date,
                                        month: month,
                                        amount: req.body.balance,
                                        type: "Credit",
                                };
                                const data1 = await transactionModel.create(obj);
                                if (data1) {
                                        return res.status(200).json({ status: 200, message: "Money has been added.", data: update, });
                                }

                        }
                } else {
                        return res.status(404).json({ status: 404, message: "No data found", data: {} });
                }
        } catch (error) {
                console.log(error);
                return res.status(501).send({ status: 501, message: "server error.", data: {}, });
        }
};
exports.removeMoney = async (req, res) => {
        try {
                const data = await User.findOne({ _id: req.user._id, });
                if (data) {
                        let update = await User.findByIdAndUpdate({ _id: data._id }, { $set: { wallet: data.wallet - parseInt(req.body.balance) } }, { new: true });
                        if (update) {
                                const date = new Date();
                                let month = date.getMonth() + 1;
                                let obj;
                                // if (req.body.orderId) {
                                //         obj = {
                                //                 orderId: req.body.orderId,
                                //                 user: req.user._id,
                                //                 date: date,
                                //                 month: month,
                                //                 amount: req.body.balance,
                                //                 type: "Debit",
                                //         };
                                // }
                                // if (req.body.subscriptionId) {
                                obj = {
                                        // subscriptionId: req.body.subscriptionId,
                                        user: req.user._id,
                                        date: date,
                                        month: month,
                                        amount: req.body.balance,
                                        type: "Debit",
                                };
                                // }
                                const data1 = await transactionModel.create(obj);
                                if (data1) {
                                        return res.status(200).json({ status: 200, message: "Money has been deducted.", data: update, });
                                }
                        }
                } else {
                        return res.status(404).json({ status: 404, message: "No data found", data: {} });
                }
        } catch (error) {
                console.log(error);
                return res.status(501).send({ status: 501, message: "server error.", data: {}, });
        }
};
exports.getWallet = async (req, res) => {
        try {
                const data = await User.findOne({ _id: req.user._id, });
                if (data) {
                        return res.status(200).json({ message: "Wallet balance found.", data: data.wallet });
                } else {
                        return res.status(404).json({ status: 404, message: "No data found", data: {} });
                }
        } catch (error) {
                console.log(error);
                return res.status(501).send({ status: 501, message: "server error.", data: {}, });
        }
};
exports.allTransactionUser = async (req, res) => {
        try {
                if ((req.query.month != null && req.query.month !== undefined) && (req.query.type == null || req.query.type === undefined)) {
                        const data = await transactionModel
                                .find({ user: req.user._id, month: req.query.month })
                                .populate({ path: 'user', select: 'fullName' });

                        if (data.length > 0) {
                                return res.status(200).json({ status: 200, message: "Data found successfully.", data: data });
                        } else {
                                return res.status(404).json({ status: 404, message: "Data not found.", data: {} });
                        }
                } else if ((req.query.month == null || req.query.month === undefined) && (req.query.type != null && req.query.type !== undefined)) {
                        const data = await transactionModel
                                .find({ user: req.user._id, type: req.query.type })
                                .populate({ path: 'user', select: 'fullName' });

                        if (data.length > 0) {
                                return res.status(200).json({ status: 200, message: "Data found successfully.", data: data });
                        } else {
                                return res.status(404).json({ status: 404, message: "Data not found.", data: {} });
                        }
                } else {
                        const data = await transactionModel
                                .find({ user: req.user._id })
                                .populate({ path: 'user', select: 'fullName' });

                        if (data.length > 0) {
                                return res.status(200).json({ status: 200, message: "Data found successfully.", data: data });
                        } else {
                                return res.status(404).json({ status: 404, message: "Data not found.", data: {} });
                        }
                }
        } catch (err) {
                return res.status(400).json({ message: err.message });
        }
};
exports.allcreditTransactionUser = async (req, res) => {
        try {
                const data = await transactionModel.find({ user: req.user._id, type: "Credit" });
                if (data.length > 0) {
                        return res.status(200).json({ status: 200, message: "Data found successfully.", data: data });
                } else {
                        return res.status(404).json({ status: 404, message: "Data not found.", data: {} });
                }
        } catch (err) {
                return res.status(400).json({ message: err.message });
        }
};
exports.allDebitTransactionUser = async (req, res) => {
        try {
                const data = await transactionModel.find({ user: req.user._id, type: "Debit" });
                if (data.length > 0) {
                        return res.status(200).json({ status: 200, message: "Data found successfully.", data: data });
                } else {
                        return res.status(404).json({ status: 404, message: "Data not found.", data: {} });
                }
        } catch (err) {
                return res.status(400).json({ message: err.message });
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
                res.status(201).json({ status: 201, data: savedTestimonial });
        } catch (error) {
                console.error(error);
                res.status(500).json({ error: "Failed to create testimonial" });
        }
};
exports.getAllTestimonials = async (req, res) => {
        try {
                const testimonials = await Testimonial.find();
                res.status(200).json({ status: 200, data: testimonials });
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
                res.status(200).json({ status: 200, data: testimonial });
        } catch (error) {
                console.error(error);
                res.status(500).json({ error: "Failed to retrieve testimonial" });
        }
};
exports.createRating = async (req, res) => {
        try {
                const userId = req.user._id;

                const {
                        orderId,
                        categoryId,
                        ratingValue,
                        comment,
                        date,
                        type,
                } = req.body;

                if (!orderId || !categoryId || !ratingValue || !date) {
                        return res.status(400).json({ error: 'Incomplete data for rating creation' });
                }

                const user = await User.findOne({ _id: userId });
                const order = await Order.findOne({ _id: orderId });
                console.log("order", order);
                const category = await Category.findOne({ _id: categoryId });

                if (!user || !order || !category) {
                        return res.status(404).json({ error: 'User, order, or category not found' });
                }

                let rating = await Rating.findOne({
                        userId: user._id,
                        partnerId: order.partnerId,
                        orderId: order._id,
                        categoryId: category._id,
                });

                if (!rating) {
                        rating = new Rating({
                                userId: user._id,
                                partnerId: order.partnerId,
                                orderId: order._id,
                                categoryId: category._id,
                                type: "order",
                                rating: [{
                                        userId: user._id,
                                        rating: ratingValue,
                                        comment,
                                        date,
                                }],
                        });
                } else {
                        rating.rating.push({
                                userId: user._id,
                                rating: ratingValue,
                                comment,
                                date,
                        });
                }

                switch (ratingValue) {
                        case 1:
                                rating.rating1++;
                                break;
                        case 2:
                                rating.rating2++;
                                break;
                        case 3:
                                rating.rating3++;
                                break;
                        case 4:
                                rating.rating4++;
                                break;
                        case 5:
                                rating.rating5++;
                                break;
                        default:
                                break;
                }

                rating.totalRating = rating.rating1 + rating.rating2 + rating.rating3 + rating.rating4 + rating.rating5;

                const totalRatings = rating.totalRating;
                const sumRatings = rating.rating1 + rating.rating2 * 2 + rating.rating3 * 3 + rating.rating4 * 4 + rating.rating5 * 5;
                rating.averageRating = totalRatings === 0 ? 0 : sumRatings / totalRatings;

                const savedRating = await rating.save();

                res.status(201).json({ message: 'Rating created successfully', data: savedRating });
        } catch (error) {
                console.error(error);
                res.status(500).json({ error: 'Failed to create rating' });
        }
};
exports.getAllRatingsForOrder = async (req, res) => {
        try {
                const allRatings = await Rating.find({ type: "order" });
                res.status(200).json({ message: "All Ratings Found", status: 200, data: allRatings });
        } catch (error) {
                console.error(error);
                res.status(500).json({ message: "Server error", status: 500, data: {} });
        }
};
exports.getRatingById = async (req, res) => {
        try {
                const ratingId = req.params.ratingId;
                const rating = await Rating.findById(ratingId);
                if (!rating) {
                        return res.status(404).json({ message: "Rating Not Found", status: 404, data: {} });
                }
                res.status(200).json({ message: "Rating Found", status: 200, data: rating });
        } catch (error) {
                console.error(error);
                res.status(500).json({ message: "Server error", status: 500, data: {} });
        }
};
exports.getRatingCountsForOrder = async (req, res) => {
        try {
                const ratingCounts = await Rating.aggregate([
                        {
                                $match: { type: "order" }
                        },
                        {
                                $group: {
                                        _id: null,
                                        rating1Count: { $sum: "$rating1" },
                                        rating2Count: { $sum: "$rating2" },
                                        rating3Count: { $sum: "$rating3" },
                                        rating4Count: { $sum: "$rating4" },
                                        rating5Count: { $sum: "$rating5" }
                                }
                        },
                        {
                                $project: {
                                        _id: 0
                                }
                        }
                ]);

                if (ratingCounts.length === 0) {
                        return res.status(404).json({ status: 404, message: "No ratings found for order" });
                }
                const orderRatings = ratingCounts[0];

                res.status(200).json({ status: 200, message: "Order rating counts", data: orderRatings });
        } catch (error) {
                console.error(error);
                res.status(500).json({ status: 500, message: "Server error", data: {} });
        }
};
exports.getUserRatingsWithOrders = async (req, res) => {
        try {
                const userId = req.user._id;
                console.log("userId", userId);

                const userWithRatings = await Rating.find({ userId: userId }).populate("userId orderId mainCategory categoryId");

                if (!userWithRatings || userWithRatings.length === 0) {
                        return res.status(404).json({ error: 'User not found or has no ratings' });
                }

                res.status(200).json({ userWithRatings });
        } catch (error) {
                console.error(error);
                res.status(500).json({ error: 'Failed to fetch user ratings' });
        }
};
exports.giveMaincategoryRating = async (req, res) => {
        try {
                const userId = req.user._id;
                const {
                        categoryId,
                        partnerId,
                        ratingValue,
                        comment,
                        date,
                        type,
                } = req.body;

                if (!categoryId || !ratingValue || !date) {
                        return res.status(400).json({ error: 'Incomplete data for rating creation' });
                }

                const user = await User.findOne({ _id: userId });
                const category = await MainCategory.findOne({ _id: categoryId });

                if (!user || !category) {
                        return res.status(404).json({ error: 'User or category not found' });
                }

                let rating = await Rating.findOne({ categoryId: category._id });

                if (!rating) {
                        rating = new Rating({
                                categoryId: category._id,
                                partnerId: partnerId,
                                type: "mainCategory",
                                rating: [],
                        });
                }

                rating.rating.push({
                        userId: user._id,
                        rating: Number(ratingValue),
                        comment,
                        date,
                });

                switch (Number(ratingValue)) {
                        case 1:
                                rating.rating1++;
                                break;
                        case 2:
                                rating.rating2++;
                                break;
                        case 3:
                                rating.rating3++;
                                break;
                        case 4:
                                rating.rating4++;
                                break;
                        case 5:
                                rating.rating5++;
                                break;
                        default:
                                break;
                }

                rating.totalRating = rating.rating1 + rating.rating2 + rating.rating3 + rating.rating4 + rating.rating5;


                const totalRatings = rating.totalRating;
                const sumRatings = rating.rating1 + rating.rating2 * 2 + rating.rating3 * 3 + rating.rating4 * 4 + rating.rating5 * 5;
                rating.averageRating = totalRatings === 0 ? 0 : sumRatings / totalRatings;

                const savedRating = await rating.save();

                res.status(201).json({ message: 'Rating created successfully', data: savedRating });
        } catch (error) {
                console.error(error);
                res.status(500).json({ error: 'Failed to create rating' });
        }
};
exports.getAllRatingsForMainCategory = async (req, res) => {
        try {
                const mainCategory = req.params.mainCategory
                console.log("mainCategory", mainCategory);
                const allRatings = await Rating.findOne({ categoryId: mainCategory, type: "mainCategory" }).populate({
                        path: 'rating.userId',
                        model: 'user',
                        select: 'fullName image date rating comment reply -_id',
                });
                return res.status(200).json({ message: "All Ratings Found", status: 200, data: allRatings });
        } catch (error) {
                console.error(error);
                return res.status(500).json({ message: "Server error", status: 500, data: {} });
        }
};

// exports.getRatingCountsForMainCategory = async (req, res) => {
//         try {
//                 const mainCategory = req.params.mainCategory;
//                 console.log("mainCategory", mainCategory);

//                 const ratings = await Rating.find({ categoryId: mainCategory, type: "mainCategory" });
//                 console.log("ratings", ratings);
//                 const ratingCounts = await Rating.aggregate([
//                         {
//                                 // $match: { type: "mainCategory" }
//                                 $match: { type: "mainCategory", categoryId: mainCategory }

//                         },
//                         {
//                                 $group: {
//                                         _id: null,
//                                         rating1Count: { $sum: "$rating1" },
//                                         rating2Count: { $sum: "$rating2" },
//                                         rating3Count: { $sum: "$rating3" },
//                                         rating4Count: { $sum: "$rating4" },
//                                         rating5Count: { $sum: "$rating5" }
//                                 }
//                         },
//                         {
//                                 $project: {
//                                         _id: 0
//                                 }
//                         }
//                 ]);

//                 if (ratingCounts.length === 0) {
//                         return res.status(404).json({ status: 404, message: "No ratings found for mainCategory" });
//                 }
//                 const mainCategoryRatings = ratingCounts[0];

//                 res.status(200).json({ status: 200, message: "Main category rating counts", data: mainCategoryRatings });
//         } catch (error) {
//                 console.error(error);
//                 res.status(500).json({ status: 500, message: "Server error", data: {} });
//         }
// };

exports.getRatingCountsForAllMainCategory = async (req, res) => {
        try {
                const ratings = await Rating.find({ type: "mainCategory" });
                console.log("ratings", ratings);

                const ratingCounts = await Rating.aggregate([
                        {
                                $match: { type: "mainCategory", /*categoryId: mainCategory*/ }
                        },
                        {
                                $group: {
                                        _id: null,
                                        rating1Count: { $sum: "$rating1" },
                                        rating2Count: { $sum: "$rating2" },
                                        rating3Count: { $sum: "$rating3" },
                                        rating4Count: { $sum: "$rating4" },
                                        rating5Count: { $sum: "$rating5" }
                                }
                        },
                        {
                                $project: {
                                        _id: 0,
                                        // rating1Count: 1,
                                        // rating2Count: 1,
                                        // rating3Count: 1,
                                        // rating4Count: 1,
                                        // rating5Count: 1
                                }
                        }
                ]);
                console.log("ratingCounts", ratingCounts);
                if (ratingCounts.length === 0) {
                        return res.status(404).json({ status: 404, message: "No ratings found for mainCategory" });
                }

                const mainCategoryRatings = ratingCounts[0];
                res.status(200).json({ status: 200, message: "Main category rating counts", data: mainCategoryRatings });
        } catch (error) {
                console.error(error);
                res.status(500).json({ status: 500, message: "Server error", data: {} });
        }
};
exports.getRatingCountsForMainCategory = async (req, res) => {
        try {
                const mainCategory = new mongoose.Types.ObjectId(req.params.categoryId);
                console.log("mainCategory", mainCategory);

                const ratingCounts = await Rating.aggregate([
                        {
                                $match: { type: "mainCategory", categoryId: new mongoose.Types.ObjectId(mainCategory) }
                        },
                        {
                                $group: {
                                        _id: null,
                                        rating1Count: { $sum: "$rating1" },
                                        rating2Count: { $sum: "$rating2" },
                                        rating3Count: { $sum: "$rating3" },
                                        rating4Count: { $sum: "$rating4" },
                                        rating5Count: { $sum: "$rating5" }
                                }
                        },
                        {
                                $project: {
                                        _id: 0
                                }
                        }
                ]);
                console.log("ratingCounts", ratingCounts);

                if (!ratingCounts || ratingCounts.length === 0) {
                        return res.status(404).json({ status: 404, message: "No ratings found for mainCategory" });
                }

                const mainCategoryRatings = ratingCounts[0];
                res.status(200).json({ status: 200, message: "Main category rating counts", data: mainCategoryRatings });
        } catch (error) {
                console.error(error);
                res.status(500).json({ status: 500, message: "Server error", data: {} });
        }
};
exports.commentOnImage = async (req, res) => {
        try {
                const userId = req.user?._id;
                const user = await User.findById(userId);

                if (!user) {
                        return res.status(404).json({ status: 404, message: "User Not found" });
                }

                const project = await Rating.findById(req.params._id);

                if (!project) {
                        return res.status(404).json({ status: 404, message: "Not found" });
                }

                const commentObj = {
                        userId: req.user._id,
                        comment: req.body.comment,
                };

                const updatedProject = await Rating.findOneAndUpdate(
                        { 'rating._id': req.body.ratingId },
                        { $push: { 'rating.$.reply': commentObj } },
                        { new: true }
                );

                if (updatedProject) {
                        return res.status(200).json({ status: 200, message: "Reply on rating", data: updatedProject });
                }
        } catch (error) {
                console.error(error);
                return res.status(500).json({ status: 500, message: "Not found" });
        }
};
exports.updateOrderStatus = async (req, res) => {
        try {
                const { orderId } = req.params;
                const { status } = req.body;
                const validStatusValues = ["Pending", "confirmed", "assigned", "OnTheWay", "Arrived", "Complete", "Review"];
                if (!validStatusValues.includes(status)) {
                        return res.status(400).json({ message: "Invalid status value" });
                }

                const updatedOrder = await Order.findByIdAndUpdate(
                        orderId,
                        { status },
                        { new: true }
                );

                if (!updatedOrder) {
                        return res.status(404).json({ message: "Order not found" });
                }

                if (status === "Complete") {
                        updatedOrder.serviceStatus = "Complete";
                        await updatedOrder.save();
                }

                res.status(200).json({ message: "Order status updated successfully", data: updatedOrder });
        } catch (error) {
                res.status(500).json({ error: error.message });
        }
};
exports.getCategoriesServices = async (req, res) => {
        try {
                const categories = await Category.find();

                if (categories.length === 0) {
                        return res.status(404).json({ message: "No categories found", status: 404, data: [] });
                }

                const categoryData = [];

                for (const category of categories) {
                        const services = await service.find({ categoryId: category._id });

                        categoryData.push({
                                category: category,
                                services: services,
                        });
                }

                return res.status(200).json({ message: "Categories found", status: 200, data: categoryData });
        } catch (error) {
                console.error(error);
                return res.status(500).json({ message: "Server error", status: 500, data: {} });
        }
};
exports.getCategories = async (req, res) => {
        try {
                const categories = await Category.find().populate("categoryId");

                if (categories.length === 0) {
                        return res.status(404).json({ message: "No categories found", status: 404, data: [] });
                }

                const categoryData = {};

                for (const category of categories) {
                        if (!categoryData[category.categoryId._id]) {
                                categoryData[category.categoryId._id] = {
                                        category: category.categoryId,
                                        subCategories: [],
                                };
                        }

                        categoryData[category.categoryId._id].subCategories.push({
                                _id: category._id,
                                name: category.name,
                                image: category.image,
                                status: category.status,
                                createdAt: category.createdAt,
                                updatedAt: category.updatedAt,
                        });
                }

                const groupedCategories = Object.values(categoryData);

                return res.status(200).json({ message: "Categories found", status: 200, data: groupedCategories });
        } catch (error) {
                console.error(error);
                return res.status(500).json({ message: "Server error", status: 500, data: {} });
        }
};
exports.listServiceforSearch = async (req, res, next) => {
        try {
                const productsCount = await service.count();
                if (req.query.search != (null || undefined)) {
                        let data1 = [
                                {
                                        $lookup: { from: "maincategories", localField: "mainCategoryId", foreignField: "_id", as: "mainCategoryId" },
                                },
                                { $unwind: "$mainCategoryId" },
                                {
                                        $lookup: { from: "categories", localField: "categoryId", foreignField: "_id", as: "categoryId", },
                                },
                                { $unwind: "$categoryId" },
                                {
                                        $lookup: { from: "subcategories", localField: "subCategoryId", foreignField: "_id", as: "subCategoryId", },
                                },
                                { $unwind: "$subCategoryId" },
                                {
                                        $match: {
                                                $or: [
                                                        { "mainCategoryId.name": { $regex: req.query.search, $options: "i" }, },
                                                        { "categoryId.name": { $regex: req.query.search, $options: "i" }, },
                                                        { "subCategoryId.name": { $regex: req.query.search, $options: "i" }, },
                                                        { "title": { $regex: req.query.search, $options: "i" }, },
                                                ]
                                        }
                                },
                        ]
                        let apiFeature = await service.aggregate(data1);
                        return res.status(200).json({ status: 200, message: "Product data found.", data: apiFeature, count: productsCount });
                } else {
                        let apiFeature = await service.aggregate([
                                {
                                        $lookup: { from: "maincategories", localField: "mainCategoryId", foreignField: "_id", as: "mainCategoryId" },
                                },
                                { $unwind: "$mainCategoryId" },
                                {
                                        $lookup: { from: "categories", localField: "categoryId", foreignField: "_id", as: "categoryId", },
                                },
                                { $unwind: "$categoryId" },
                                {
                                        $lookup: { from: "subcategories", localField: "subCategoryId", foreignField: "_id", as: "subCategoryId", },
                                },
                                { $unwind: "$subCategoryId" },
                        ]);
                        return res.status(200).json({ status: 200, message: "Product data found.", data: apiFeature, count: productsCount });
                }
        } catch (err) {
                console.log(err);
                return res.status(500).send({ message: "Internal server error while creating Product", });
        }
};
exports.getFrequentlyAddedServices = async (req, res) => {
        try {
                const limit = req.query.limit || 10;
                const frequentlyAddedServices = await service.find()
                        .sort({ createdAt: -1 })
                        .limit(limit);

                const userId = req.user.id;
                console.log("user", userId);

                if (userId) {
                        const userCart = await Cart.findOne({ userId: userId });
                        console.log("userCart", userCart);

                        if (userCart) {
                                frequentlyAddedServices.forEach((service, index) => {
                                        const isInCart = userCart.services.some(cartService =>
                                                cartService.serviceId.equals(service._id)
                                        );
                                        frequentlyAddedServices[index] = {
                                                ...service.toObject(),
                                                cartAdded: isInCart,
                                        };
                                });
                        }
                }

                return res.status(200).json({
                        status: 200,
                        message: 'Frequently added services retrieved.',
                        data: frequentlyAddedServices,
                });
        } catch (error) {
                return res.status(500).json({
                        status: 500,
                        message: 'Internal server error',
                        data: error.message,
                });
        }
};

//helper function
const generateTicketID = () => {
        const timestamp = Date.now();
        const uniqueID = Math.floor(Math.random() * 10000);
        return `${timestamp}-${uniqueID}`;
};

exports.reportIssue = async (req, res) => {
        const { issueType, description } = req.body;

        try {
                const order = await Order.findById(req.params.orderId);
                if (!order) {
                        return res.status(404).json({ status: 404, message: 'Order not found' });
                }
                const ticketID = generateTicketID();

                const issueReport = new IssueReport({
                        order: order._id,
                        userId: req.user._id,
                        issueType,
                        description,
                        ticketID
                });

                await issueReport.save();

                return res.status(201).json({ status: 201, message: 'Issue reported successfully', data: issueReport });
        } catch (error) {
                return res.status(500).json({ error: 'Error reporting issue' });
        }
};

exports.getIssueReports = async (req, res) => {
        try {
                const issueReports = await IssueReport.find();

                return res.status(200).json(issueReports);
        } catch (error) {
                return res.status(500).json({ error: 'Error fetching issue reports' });
        }
};


exports.createDateTimeSlot = async (req, res) => {
        try {
                const { startTime, endTime, slotPrice, isSlotPrice, isAvailable } = req.body;
                const dateTimeSlot = new DateAndTimeSlot({
                        startTime,
                        endTime,
                        slotPrice,
                        isSlotPrice,
                        isAvailable,
                });
                await dateTimeSlot.save();
                res.status(201).json(dateTimeSlot);
        } catch (error) {
                console.error(error);
                res.status(500).json({ error: 'Failed to create date and time slot.' });
        }
};

exports.getAllDateTimeSlots = async (req, res) => {
        try {
                const dateAndTimeSlots = await DateAndTimeSlot.find();
                res.json(dateAndTimeSlots);
        } catch (error) {
                console.error(error);
                res.status(500).json({ error: 'Failed to fetch date and time slots.' });
        }
};

exports.getDateAndTimeSlotById = async (req, res) => {
        try {
                const slot = await DateAndTimeSlot.findById(req.params.id);
                if (!slot) {
                        res.status(404).json({ status: 404, error: 'Slot not found' });
                } else {
                        res.status(200).json({ status: 200, data: slot });
                }
        } catch (error) {
                console.log(error);
                res.status(500).json({ status: 500, error: 'Internal Server Error' });
        }
};

exports.updateDateTimeSlot = async (req, res) => {
        try {
                const { startTime, endTime, slotPrice, isSlotPrice, isAvailable } = req.body;
                const updatedDateTimeSlot = await DateAndTimeSlot.findByIdAndUpdate(
                        req.params.id,
                        {
                                startTime,
                                endTime,
                                slotPrice,
                                isSlotPrice,
                                isAvailable,
                        },
                        { new: true }
                );
                if (!updatedDateTimeSlot) {
                        return res.status(404).json({ error: 'Date and time slot not found.' });
                }
                res.json(updatedDateTimeSlot);
        } catch (error) {
                console.error(error);
                res.status(500).json({ error: 'Failed to update date and time slot.' });
        }
};

exports.deleteDateTimeSlot = async (req, res) => {
        try {
                const deletedDateTimeSlot = await DateAndTimeSlot.findByIdAndRemove(req.params.id);
                if (!deletedDateTimeSlot) {
                        return res.status(404).json({ error: 'Date and time slot not found.' });
                }
                res.json({ message: 'Date and time slot deleted successfully.' });
        } catch (error) {
                console.error(error);
                res.status(500).json({ error: 'Failed to delete date and time slot.' });
        }
};
