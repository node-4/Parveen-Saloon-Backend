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
const SPAgreement = require('../models/spAgreementModel');
// const rating = require('../models/ratingModel');
// const favouriteBooking = require('../models/favouriteBooking');
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
                const data = await orderModel.find({ partnerId: req.user._id, Date: { $gte: fromDate }, Date: { $lte: toDate } });
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

exports.createSPAgreement = async (req, res) => {
        try {
                const {
                        mobile,
                        email,
                        panNumber,
                        aadharNumber
                } = req.body;

                const spAgreement = new SPAgreement({
                        photo: req.files['photo'][0].path,
                        agreementDocument: req.files['agreementDocument'][0].path,
                        mobile: mobile,
                        email: email,
                        aadharNumber: aadharNumber,
                        aadharFrontImage: req.files['aadharFrontImage'][0].path,
                        aadharBackImage: req.files['aadharBackImage'][0].path,
                        panNumber: panNumber,
                        panCardImage: req.files['panCardImage'][0].path
                });

                const savedSPAgreement = await spAgreement.save();

                res.status(201).json({ status: 201, message: "created sucessfully", data: savedSPAgreement });
        } catch (error) {
                console.error(error);
                res.status(500).json({ error: 'Failed to create SP Agreement' });
        }
};

exports.getAllSPAgreements = async (req, res) => {
        try {
                const spAgreements = await SPAgreement.find();
                res.json(spAgreements);
        } catch (error) {
                console.error(error);
                res.status(500).json({ error: 'Failed to get SP Agreements' });
        }
};

exports.getSPAgreementById = async (req, res) => {
        const spAgreementId = req.params.id;

        try {
                const spAgreement = await SPAgreement.findById(spAgreementId);
                if (!spAgreement) {
                        return res.status(404).json({ message: 'SP Agreement not found' });
                }
                res.json(spAgreement);
        } catch (error) {
                console.error(error);
                res.status(500).json({ error: 'Failed to get SP Agreement' });
        }
};

exports.updateSPAgreement = async (req, res) => {
        const spAgreementId = req.params.id;

        try {
                const {
                        mobile,
                        email,
                        panNumber,
                        aadharNumber
                } = req.body;

                const updatedSPAgreement = {
                        photo: req.files['photo'][0].path,
                        agreementDocument: req.files['agreementDocument'][0].path,
                        mobile: mobile,
                        email: email,
                        aadharNumber: aadharNumber,
                        aadharFrontImage: req.files['aadharFrontImage'][0].path,
                        aadharBackImage: req.files['aadharBackImage'][0].path,
                        panNumber: panNumber,
                        panCardImage: req.files['panCardImage'][0].path
                };

                const updatedSPAgreementResult = await SPAgreement.findByIdAndUpdate(
                        spAgreementId,
                        updatedSPAgreement,
                        { new: true }
                );

                if (!updatedSPAgreementResult) {
                        return res.status(404).json({ message: 'SP Agreement not found' });
                }

                res.json({status: 200, message: "updated sucessfully", data: updatedSPAgreementResult});
        } catch (error) {
                console.error(error);
                res.status(500).json({ error: 'Failed to update SP Agreement' });
        }
};


