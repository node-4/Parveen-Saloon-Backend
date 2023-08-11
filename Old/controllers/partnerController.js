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
const rating = require('../models/ratingModel');
const favouriteBooking = require('../models/favouriteBooking');
exports.partnerRegistration = async (req, res) => {
        try {
                const { phone } = req.body;
                const user = await User.findOne({ phone: phone, userType: "PARTNER" });
                if (!user) {
                        req.body.otp = newOTP.generate(4, { alphabets: false, upperCase: false, specialChar: false, });
                        req.body.otpExpiration = new Date(Date.now() + 5 * 60 * 1000);
                        req.body.accountVerification = false;
                        req.body.userType = "PARTNER";
                        const userCreate = await User.create(req.body);
                        return res.status(200).send({ status: 200, message: "Partner signup successfully.", data: userCreate, });
                } else {
                        return res.status(409).send({ status: 409, msg: "Already Exit" });
                }
        } catch (error) {
                console.log(error);
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
exports.changePassword = async (req, res) => {
        try {
                const data = await User.findOne({ _id: req.user._id, });
                if (data) {
                        if (req.body.newPassword == req.body.confirmPassword) {
                                const updated = await User.findOneAndUpdate({ _id: data._id }, { $set: { password: bcrypt.hashSync(req.body.newPassword) } }, { new: true });
                                return res.status(200).send({ message: "Password update successfully.", data: updated, });
                        } else {
                                return res.status(501).send({ message: "Password Not matched.", data: {}, });
                        }
                } else {
                        return res.status(404).json({ status: 404, message: "No data found", data: {} });
                }
        } catch (error) {
                console.log(error);
                return res.status(501).send({ status: 501, message: "server error.", data: {}, });
        }
};
exports.signin = async (req, res) => {
        try {
                const { email, password } = req.body;
                const user = await User.findOne({ email: email, userType: "PARTNER" });
                if (!user) {
                        return res.status(404).send({ message: "user not found ! not registered" });
                }
                const isValidPassword = bcrypt.compareSync(password, user.password);
                if (!isValidPassword) {
                        return res.status(401).send({ message: "Wrong password" });
                }
                const accessToken = jwt.sign({ id: user._id }, authConfig.secret, {
                        expiresIn: authConfig.accessTokenTime,
                });
                let obj = {
                        fullName: user.fullName,
                        firstName: user.fullName,
                        lastName: user.lastName,
                        phone: user.phone,
                        email: user.email,
                        userType: user.userType,
                }
                return res.status(201).send({ data: obj, accessToken: accessToken });
        } catch (error) {
                console.error(error);
                return res.status(500).send({ message: "Server error" + error.message });
        }
};
exports.reSetPassword = async (req, res) => {
        try {
                const { phone } = req.body;
                const user = await User.findOne({ phone: phone, userType: "PARTNER" });
                if (user) {
                        req.body.otp = newOTP.generate(4, { alphabets: false, upperCase: false, specialChar: false, });
                        req.body.otpExpiration = new Date(Date.now() + 5 * 60 * 1000);
                        req.body.accountVerification = false;
                        const updated = await User.findOneAndUpdate({ _id: user._id }, { $set: req.body }, { new: true });
                        return res.status(200).send({ status: 200, message: "Otp send on mobile successfully.", data: updated, });
                } else {
                        return res.status(404).send({ status: 404, msg: "not Found" });
                }
        } catch (error) {
                console.log(error);
                return res.status(500).json({ message: "Server error" });
        }
};
exports.getTodayOrders = async (req, res) => {
        try {
                const data = await orderModel.find({ partnerId: req.user._id });
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
exports.getTomorrowOrders = async (req, res) => {
        try {
                const data = await orderModel.find({ partnerId: req.user._id });
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
exports.getAllOrders = async (req, res) => {
        try {
                const data = await orderModel.find({ partnerId: req.user._id });
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
exports.getRating = async (req, res) => {
        try {
                let overAllrating = 0, totalRating = 0;
                const data = await rating.find({ partnerId: req.user._id })
                if (data.length == 0) {
                        return res.status(404).json({ status: 404, message: "No data found", data: {} });
                }
                let findRating = await rating.findOne({ partnerId: req.user._id })
                if (findRating) {
                        overAllrating = findRating.averageRating
                }
                let findReview = await rating.findOne({ partnerId: req.user._id })
                if (findReview) {
                        totalRating = findRating.totalRating
                }
                const findJobs = await orderModel.find({ partnerId: req.user._id });
                if (findJobs.length == 0) {
                        return res.status(404).json({ status: 404, message: "No data found", data: {} });
                }
                let obj = {
                        overAllrating:overAllrating,
                        minRating:minRating,
                        jobs: jobs,
                        totalReview: totalReviews,
                        Escalations: Escalations,
                        Rating: Rating,
                        repeatCustomer: repeatCustomer,
                        allRating:data

                }
        } catch (error) {
                console.log(error);
                return res.status(501).send({ status: 501, message: "server error.", data: {}, });
        }
};
exports.reportRating = async (req, res) => {
        try {
                let vendorData = await User.findOne({ _id: req.user._id });
                if (!vendorData) {
                        return res.status(404).send({ status: 404, message: "User not found" });
                } else {
                        let month = new Date(Date.now()).getMonth() + 1;
                        let date = new Date(Date.now()).getDate();
                        let last50Job, overAllrating = 0, rat = 0, rats = 0, thisMonth = 0, lastsMonth = 0;
                        let year = new Date(Date.now()).getFullYear();
                        const xmas95 = new Date(`${vendorData.createdAt}`);
                        const startMonth = xmas95.getMonth() + 1;
                        const startYear = xmas95.getFullYear();
                        const startDate = xmas95.getDate();
                        let lastMonth = new Date(Date.now()).getMonth();

                        let findLastRating = await rating.findOne({ userId: vendorData._id, month: lastMonth })
                        if (findLastRating) {
                                lastsMonth = findLastRating.averageRating
                        }
                        let findLast50JobRating = await orderRatingModel.find({ $or: [{ vendorId: vendorData._id }, { staffId: vendorData._id }] }).sort({ 'createdAt': -1 });
                        if (findLast50JobRating.length > 0) {
                                for (let i = 0; i < 50; i++) {
                                        rat = rat + findLast50JobRating[i].rating
                                }
                        }
                        last50Job = rat / 50;
                        let findoverAllrating = await orderRatingModel.find({ $or: [{ vendorId: vendorData._id }, { staffId: vendorData._id }] }).sort({ 'createdAt': -1 });
                        if (findoverAllrating.length > 0) {
                                for (let i = 0; i < findoverAllrating.length; i++) {
                                        rats = rats + findoverAllrating[i].rating
                                }
                                overAllrating = rats / findoverAllrating.length;
                        }
                        var start = moment(`${startYear}-${startMonth}-${startDate}`);
                        var end = moment(`${year}-${month}-${date}`);
                        let noOfDays = end.diff(start, "days")
                        let obj = {
                                overAllrating: overAllrating,
                                thisMonth: thisMonth,
                                lastMonth: lastsMonth,
                                last50Job: last50Job,
                                jobTillDate: findLast50JobRating.length,
                                noOfDays: noOfDays
                        }
                        res.json({ status: 200, message: 'Data found successfully.', data: obj });
                }
        } catch (error) {
                console.error(error);
                return res.status(500).send({ status: 500, message: "Server error" + error.message });
        }
};
