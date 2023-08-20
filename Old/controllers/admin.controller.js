const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const authConfig = require("../configs/auth.config");
var newOTP = require("otp-generators");
const User = require("../models/user.model");
const Category = require("../models/CategoryModel");
const subCategory = require("../models/subCategory");
const banner = require('../models/banner')
const ContactDetail = require("../models/ContactDetail");
const subscription = require('../models/subscription');
const service = require('../models/service');
const facialType = require('../models/facialType');
const Charges = require('../models/Charges');
const freeService = require('../models/freeService');
const Coupan = require('../models/Coupan')
const Brand = require('../models/brand');
const weCanhelpyou = require('../models/weCanhelpyou');
const e4u = require('../models/e4u')
const feedback = require('../models/feedback');
const offer = require('../models/offer');
const ticket = require('../models/ticket');
exports.createFacialType = async (req, res) => {
    try {
        let findFacialType = await facialType.findOne({ name: req.body.name });
        if (findFacialType) {
            return res.status(409).json({ message: "facialType already exit.", status: 404, data: {} });
        } else {
            const data = { name: req.body.name };
            const category = await facialType.create(data);
            return res.status(200).json({ message: "facialType add successfully.", status: 200, data: category });
        }
    } catch (error) {
        return res.status(500).json({ status: 500, message: "internal server error ", data: error.message, });
    }
};
exports.getFacialTypes = async (req, res) => {
    const categories = await facialType.find({});
    return res.status(201).json({ message: "facialType Found", status: 200, data: categories, });
};
exports.updateFacialType = async (req, res) => {
    const { id } = req.params;
    const category = await facialType.findById(id);
    if (!category) {
        return res.status(404).json({ message: "facialType Not Found", status: 404, data: {} });
    }
    let data = {
        name: req.body.name || findCharge.name,
    }
    const update = await facialType.findByIdAndUpdate({ _id: category._id }, { $set: data }, { new: true });
    return res.status(200).json({ message: "Updated Successfully", data: update });
};
exports.removeFacialType = async (req, res) => {
    const { id } = req.params;
    const category = await facialType.findById(id);
    if (!category) {
        return res.status(404).json({ message: "facialType Not Found", status: 404, data: {} });
    } else {
        await Category.findByIdAndDelete(category._id);
        return res.status(200).json({ message: "facialType Deleted Successfully !" });
    }
};
exports.createSubscription = async (req, res) => {
    try {
        let findSubscription = await subscription.findOne({ name: req.body.name });
        if (findSubscription) {
            res.json({ status: 409, message: 'subscription already created.', data: {} });
        } else {
            const newsubscription = await subscription.create(req.body);
            res.json({ status: 200, message: 'subscription create successfully', data: newsubscription });
        }
    } catch (err) {
        return res.status(400).json({ message: err.message });
    }
};
exports.getSubscription = async (req, res) => {
    try {
        const findSubscription = await subscription.find();
        return res.status(200).json({ status: 200, message: "Subscription detail successfully.", data: findSubscription });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};
exports.updateImagesinService = async (req, res) => {
    const { id } = req.params;
    let findService = await service.findById({ _id: id });
    if (!findService) {
        return res.status(409).json({ message: "Service not found.", status: 409, data: {} });
    } else {
        let fileUrl = [];
        if (req.files) {
            for (let i = 0; i < req.files.length; i++) {
                let obj = {
                    img: req.files[i] ? req.files[i].path : ""
                };
                fileUrl.push(obj)
            }
        }
        let obj = {
            images: fileUrl || findService.images
        }
        let update = await service.findByIdAndUpdate({ _id: findService._id }, { $set: obj }, { new: true });
        return res.status(200).json({ message: "Updated Successfully", data: update });
    }
};
exports.getService = async (req, res) => {
    let findCategory = await Category.findById({ _id: req.params.categoryId });
    if (!findCategory) {
        return res.status(404).json({ message: "Category Not Found", status: 404, data: {} });
    } else {
        let findSubCategory = await subCategory.findOne({ categoryId: findCategory._id, _id: req.params.subCategoryId });
        if (!findSubCategory) {
            return res.status(404).json({ message: "Sub Category not found.", status: 404, data: {} });
        } else {
            let findService = await service.find({ categoryId: findCategory._id, subCategoryId: findSubCategory._id });
            if (findService) {
                return res.status(201).json({ message: "Service Found", status: 200, data: findService, });
            } else {
                return res.status(404).json({ message: "Service not found.", status: 404, data: {} });
            }
        }
    }
};
exports.getTopSellingService = async (req, res) => {
    let findCategory = await Category.findById({ _id: req.params.categoryId });
    if (!findCategory) {
        return res.status(404).json({ message: "Category Not Found", status: 404, data: {} });
    } else {
        let findSubCategory = await subCategory.findOne({ categoryId: findCategory._id, _id: req.params.subCategoryId });
        if (!findSubCategory) {
            return res.status(404).json({ message: "Sub Category not found.", status: 404, data: {} });
        } else {
            let findService = await service.find({ categoryId: findCategory._id, subCategoryId: findSubCategory._id, sellCount: [4, 5] })
            let top = {
                findService: findService
            }
            let findPremiumService = await service.find({ categoryId: findCategory._id, subCategoryId: findSubCategory._id, type: "Premium" }).sort({ sellCount: -1 });
            let findClassicService = await service.find({ categoryId: findCategory._id, subCategoryId: findSubCategory._id, type: "Classic" }).sort({ sellCount: -1 });
            let obj = {
                top: top,
                Premium: findPremiumService,
                Classic: findClassicService
            }
            return res.status(201).json({ message: "Service Found", status: 200, data: obj, });

        }
    }
};
exports.removeService = async (req, res) => {
    const { id } = req.params;
    const category = await service.findById(id);
    if (!category) {
        return res.status(404).json({ message: "Service Not Found", status: 404, data: {} });
    } else {
        await service.findByIdAndDelete(category._id);
        return res.status(200).json({ message: "Service Deleted Successfully !" });
    }
};
exports.updateService = async (req, res) => {
    try {
        const { id } = req.params;
        let findService = await service.findById(id);
        if (!findService) {
            return res.status(404).json({ message: "Service Not Found", status: 404, data: {} });
        } else {
            let findCategory, findSubCategory, discountPrice = 0, discount = 0, totalTime;
            if (req.body.categoryId != (null || undefined)) {
                findCategory = await Category.findById({ _id: req.body.categoryId });
                if (!findCategory) {
                    return res.status(404).json({ message: "Category Not Found", status: 404, data: {} });
                }
            }
            if (req.body.subCategoryId != (null || undefined)) {
                findSubCategory = await subCategory.findOne({ categoryId: findCategory._id || findService.categoryId, _id: req.body.subCategoryId });
                if (!findSubCategory) {
                    return res.status(404).json({ message: "Sub Category not found.", status: 404, data: {} });
                }
            }
            if (req.body.timeInMin != (null || undefined)) {
                if (req.body.timeInMin > 60) {
                    const hours = Math.floor(req.body.timeInMin / 60);
                    const minutes = req.body.timeInMin % 60;
                    totalTime = `${hours} hr ${minutes} min`
                } else {
                    const minutes = req.body.timeInMin % 60;
                    totalTime = `00 hr ${minutes} min`
                }
            }
            if (req.body.discountActive == true) {
                discountPrice = (req.body.price) - (((req.body.price) * (req.body.discount)) / 100);
                discount = req.body.discount;
            } else {
                discountPrice = findService.discountPrice;
                discount = findService.discount;
            }
            const data = {
                categoryId: findCategory._id || findService.categoryId,
                subCategoryId: findSubCategory._id || findService.subCategoryId,
                name: req.body.name || findService.name,
                totalTime: totalTime || findService.totalTime,
                timeInMin: req.body.timeInMin || findService.timeInMin,
                price: req.body.price || findService.price,
                discountPrice: discountPrice || findService.discountPrice,
                discount: discount || findService.discount,
                discountActive: req.body.discountActive || findService.discountActive,
                E4uSafety: req.body.E4uSafety || findService.E4uSafety,
                thingsToKnow: req.body.thingsToKnow || findService.thingsToKnow,
                E4uSuggestion: req.body.E4uSuggestion || findService.E4uSuggestion,
                type: req.body.type || findService.type,
                discription: req.body.discription || findService.discription,
            };
            const category = await service.findByIdAndUpdate({ _id: findService._id }, { $set: data }, { new: true });
            return res.status(200).json({ message: "Service add successfully.", status: 200, data: category });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({ status: 500, message: "internal server error ", data: error.message, });
    }
};
exports.getAllfeedback = async (req, res) => {
    try {
        const data = await feedback.find().populate('userId');
        if (data.length == 0) {
            return res.status(404).json({ status: 404, message: "No data found", data: {} });
        }
        return res.status(201).json({ message: "feedback Found", status: 200, data: data, });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Something went wrong ", status: 500, data: err.message });
    }
}
exports.getById = async (req, res) => {
    try {
        const data = await feedback.findOne({ _id: req.params.id });
        if (!data) {
            return res.status(404).json({ status: 404, message: "No data found", data: {} });
        }
        return res.status(201).json({ message: "feedback Found", status: 200, data: data, });
    } catch (err) {
        console.log(err);
        return res.status(400).json({ message: err.message })
    }
}
exports.DeleteFeedback = async (req, res) => {
    try {
        const category = await feedback.findById(id);
        if (!category) {
            return res.status(404).json({ message: "feedback Not Found", status: 404, data: {} });
        } else {
            await feedback.findByIdAndDelete(category._id);
            return res.status(200).json({ message: "feedback Deleted Successfully !" });
        }
    } catch (err) {
        console.log(err)
        return res.status(400).json({ message: "Deleted " })
    }
}
exports.addOffer = async (req, res) => {
    try {
        if (req.body.userId != (null || undefined)) {
            let vendorData = await User.findOne({ _id: req.body.userId });
            if (!vendorData) {
                return res.status(404).send({ status: 404, message: "User not found" });
            }
            if (req.body.categoryId != (null || undefined)) {
                const findCategory = await Category.findById({ _id: req.body.categoryId });
                if (!findCategory) {
                    return res.status(404).json({ message: "Category Not Found", status: 404, data: {} });
                } else {
                    let fileUrl;
                    if (req.file) {
                        fileUrl = req.file ? req.file.path : "";
                    }
                    const d = new Date(req.body.expirationDate);
                    let expirationDate = d.toISOString();
                    const de = new Date(req.body.activationDate);
                    let activationDate = de.toISOString();
                    let couponCode = await reffralCode();
                    let obj = {
                        userId: req.body.userId,
                        categoryId: findCategory._id,
                        couponCode: couponCode,
                        title: req.body.title,
                        description: req.body.description,
                        amount: req.body.amount,
                        expirationDate: expirationDate,
                        activationDate: activationDate,
                        image: fileUrl,
                        type: "user"
                    }
                    let saveStore = await offer(obj).save();
                    if (saveStore) {
                        res.json({ status: 200, message: 'offer add successfully.', data: saveStore });
                    }
                }
            }
            if (req.body.serviceId != (null || undefined)) {
                const findService = await service.findById({ _id: req.body.serviceId });
                if (!findService) {
                    return res.status(404).json({ message: "Service Not Found", status: 404, data: {} });
                } else {
                    let fileUrl;
                    if (req.file) {
                        fileUrl = req.file ? req.file.path : "";
                    }
                    const d = new Date(req.body.expirationDate);
                    let expirationDate = d.toISOString();
                    const de = new Date(req.body.activationDate);
                    let activationDate = de.toISOString();
                    let couponCode = await reffralCode();
                    let obj = {
                        userId: req.body.userId,
                        serviceId: findService._id,
                        couponCode: couponCode,
                        title: req.body.title,
                        description: req.body.description,
                        amount: req.body.amount,
                        expirationDate: expirationDate,
                        activationDate: activationDate,
                        image: fileUrl,
                        type: "user"
                    }
                    let saveStore = await offer(obj).save();
                    if (saveStore) {
                        res.json({ status: 200, message: 'offer add successfully.', data: saveStore });
                    }
                }
            }
        } else {
            if (req.body.categoryId != (null || undefined)) {
                const findCategory = await Category.findById({ _id: req.body.categoryId });
                if (!findCategory) {
                    return res.status(404).json({ message: "Category Not Found", status: 404, data: {} });
                } else {
                    let fileUrl;
                    if (req.file) {
                        fileUrl = req.file ? req.file.path : "";
                    }
                    const d = new Date(req.body.expirationDate);
                    let expirationDate = d.toISOString();
                    const de = new Date(req.body.activationDate);
                    let activationDate = de.toISOString();
                    let couponCode = await reffralCode();
                    let obj = {
                        categoryId: findCategory._id,
                        couponCode: couponCode,
                        title: req.body.title,
                        description: req.body.description,
                        amount: req.body.amount,
                        expirationDate: expirationDate,
                        activationDate: activationDate,
                        image: fileUrl,
                        type: "other"
                    }
                    let saveStore = await offer(obj).save();
                    if (saveStore) {
                        res.json({ status: 200, message: 'offer add successfully.', data: saveStore });
                    }
                }
            }
            if (req.body.serviceId != (null || undefined)) {
                const findService = await service.findById({ _id: req.body.serviceId });
                if (!findService) {
                    return res.status(404).json({ message: "Service Not Found", status: 404, data: {} });
                } else {
                    let fileUrl;
                    if (req.file) {
                        fileUrl = req.file ? req.file.path : "";
                    }
                    const d = new Date(req.body.expirationDate);
                    let expirationDate = d.toISOString();
                    const de = new Date(req.body.activationDate);
                    let activationDate = de.toISOString();
                    let couponCode = await reffralCode();
                    let obj = {
                        serviceId: findService._id,
                        couponCode: couponCode,
                        title: req.body.title,
                        description: req.body.description,
                        amount: req.body.amount,
                        expirationDate: expirationDate,
                        activationDate: activationDate,
                        image: fileUrl,
                        type: "other"
                    }
                    let saveStore = await offer(obj).save();
                    if (saveStore) {
                        res.json({ status: 200, message: 'offer add successfully.', data: saveStore });
                    }
                }
            }
        }
    } catch (error) {
        console.error(error);
        return res.status(500).send({ status: 500, message: "Server error" + error.message });
    }
};
exports.getOrders = async (req, res) => {
    try {
        const data = await orderModel.find().populate('services.serviceId');
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
exports.assignOrder = async (req, res) => {
    try {
        const data = await User.findOne({ _id: req.user._id, });
        if (data) {
            const data1 = await User.findOne({ _id: req.params.userId, });
            if (data1) {
                const data2 = await orderModel.findById({ _id: req.params.orderId });
                if (data2) {
                    let update = await orderModel.findByIdAndUpdate({ _id: data2._id }, { $set: { partnerId: data1._id, status: "assigned" } }, { new: true })
                    return res.status(200).json({ status: 200, message: "Order assign  successfully.", data: update });
                } else {
                    return res.status(404).json({ status: 404, message: "No data found", data: {} });
                }
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
const reffralCode = async () => {
    var digits = "ABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let OTP = '';
    for (let i = 0; i < 6; i++) {
        OTP += digits[Math.floor(Math.random() * 36)];
    }
    return OTP;
}