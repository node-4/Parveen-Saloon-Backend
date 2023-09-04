const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const authConfig = require("../configs/auth.config");
var newOTP = require("otp-generators");
const User = require("../models/user.model");
const mainCategory = require("../models/category/mainCategory");
const Category = require("../models/category/Category");
const subCategory = require("../models/category/subCategory");
const itemSubCategory = require("../models/category/itemSubCategory");
const item = require("../models/category/item");
const banner = require('../models/banner')
const ContactDetail = require("../models/ContactDetail");
// const subscription = require('../models/subscription');
const service = require('../models/service');
const servicePackage = require('../models/servicePackage');
// const facialType = require('../models/facialType');
const Charges = require('../models/Charges');
const freeService = require('../models/freeService');
const Coupan = require('../models/Coupan')
const Brand = require('../models/brand');
const weCanhelpyou = require('../models/weCanhelpyou');
const e4u = require('../models/e4u')
const feedback = require('../models/feedback');
// const offer = require('../models/offer');
const ticket = require('../models/ticket');
const orderModel = require('../models/orderModel');
const partnerItems = require('../models/partnerItems');
const Leave = require('../models/leavesModel');
const subscription = require('../Old/models/subscription');
const SPAgreement = require('../models/spAgreementModel');
const TrainingVideo = require('../models/traningVideoModel');
const TransportationCharge = require('../models/transportationModel');
const Referral = require('../models/refferalModel');
const ConsentForm = require('../models/consentFormModel');
const offer = require('../models/offer');






exports.registration = async (req, res) => {
    const { phone, email } = req.body;
    try {
        req.body.email = email.split(" ").join("").toLowerCase();
        let user = await User.findOne({ $and: [{ $or: [{ email: req.body.email }, { phone: phone }] }], userType: "ADMIN" });
        if (!user) {
            req.body.password = bcrypt.hashSync(req.body.password, 8);
            req.body.userType = "ADMIN";
            req.body.accountVerification = true;
            const userCreate = await User.create(req.body);
            return res.status(200).send({ message: "registered successfully ", data: userCreate, });
        } else {
            return res.status(409).send({ message: "Already Exist", data: [] });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
};
exports.signin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email: email, userType: "ADMIN" });
        if (!user) {
            return res
                .status(404)
                .send({ message: "user not found ! not registered" });
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
exports.update = async (req, res) => {
    try {
        const { fullName, firstName, lastName, email, phone, password } = req.body;
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).send({ message: "not found" });
        }
        user.fullName = fullName || user.fullName;
        user.firstName = firstName || user.firstName;
        user.lastName = lastName || user.lastName;
        user.email = email || user.email;
        user.phone = phone || user.phone;
        if (req.body.password) {
            user.password = bcrypt.hashSync(password, 8) || user.password;
        }
        const updated = await user.save();
        return res.status(200).send({ message: "updated", data: updated });
    } catch (err) {
        console.log(err);
        return res.status(500).send({
            message: "internal server error " + err.message,
        });
    }
};
exports.createBrands = async (req, res) => {
    try {
        let findBrand = await Brand.findOne({ name: req.body.name });
        if (findBrand) {
            return res.status(409).json({ message: "Brand already exit.", status: 404, data: {} });
        } else {
            let fileUrl;
            if (req.file) {
                fileUrl = req.file ? req.file.path : "";
            }
            const data = { name: req.body.name, image: fileUrl };
            const category = await Brand.create(data);
            return res.status(200).json({ message: "Brand add successfully.", status: 200, data: category });
        }
    } catch (error) {
        return res.status(500).json({ status: 500, message: "internal server error ", data: error.message, });
    }
};
exports.getBrands = async (req, res) => {
    const categories = await Brand.find({});
    if (categories.length > 0) {
        return res.status(201).json({ message: "Brand Found", status: 200, data: categories, });
    }
    return res.status(201).json({ message: "Brand not Found", status: 404, data: {}, });

};
exports.updateBrand = async (req, res) => {
    const { id } = req.params;
    const category = await Brand.findById(id);
    if (!category) {
        return res.status(404).json({ message: "Brand Not Found", status: 404, data: {} });
    }
    let fileUrl;
    if (req.file) {
        fileUrl = req.file ? req.file.path : "";
    }
    category.image = fileUrl || category.image;
    category.name = req.body.name || category.name;
    let update = await category.save();
    return res.status(200).json({ message: "Updated Successfully", data: update });
};
exports.removeBrand = async (req, res) => {
    const { id } = req.params;
    const category = await Brand.findById(id);
    if (!category) {
        return res.status(404).json({ message: "Brand Not Found", status: 404, data: {} });
    } else {
        await Brand.findByIdAndDelete(category._id);
        return res.status(200).json({ message: "Brand Deleted Successfully !" });
    }
};
exports.AddBanner = async (req, res) => {
    try {
        let fileUrl;
        if (req.file) {
            fileUrl = req.file ? req.file.path : "";
        }
        req.body.categoryId = req.body.categoryId;
        req.body.image = fileUrl;
        req.body.desc = req.body.desc;
        req.body.position = req.body.position;
        const Data = await banner.create(req.body);
        return res.status(200).json({ status: 200, message: "Banner is Addded ", data: Data })
    } catch (err) {
        console.log(err);
        return res.status(501).send({ status: 501, message: "server error.", data: {}, });
    }
};
exports.getBanner = async (req, res) => {
    try {
        const Banner = await banner.find();
        if (Banner.length == 0) {
            return res.status(404).json({ status: 404, message: "No data found", data: {} });
        }
        return res.status(200).json({ status: 200, message: "All banner Data found successfully.", data: Banner })
    } catch (err) {
        console.log(err);
        return res.status(501).send({ status: 501, message: "server error.", data: {}, });
    }
};
exports.getBannerByPosition = async (req, res) => {
    try {
        const position = req.query.position;
        if (!["TOP", "MID", "BOTTOM", "MB"].includes(position)) {
            return res.status(400).json({ status: 400, message: "Invalid position" });
        }
        const banners = await banner.find({ position });

        if (banners.length === 0) {
            return res.status(404).json({ status: 404, message: "No data found for the specified position", data: {} });
        }
        if (banners.length === 1) {
            return res.status(200).json({ status: 200, message: "Banner found successfully.", data: banners[0] });
        }

        return res.status(200).json({ status: 200, message: "Banners found successfully.", data: banners });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ status: 500, message: "Server error.", data: {} });
    }
};
// exports.getBannerForCategoryByPosition = async (req, res) => {
//     try {
//         const categoryId = req.params.categoryId
//         const position = req.query.position;
//         if (!["TOP", "MID", "BOTTOM", "MB"].includes(position)) {
//             return res.status(400).json({ status: 400, message: "Invalid position" });
//         }
//         const banners = await banner.find({ position: position, categoryId: categoryId });

//         if (banners.length === 0) {
//             return res.status(404).json({ status: 404, message: "No data found for the specified position", data: {} });
//         }
//         if (banners.length === 1) {
//             return res.status(200).json({ status: 200, message: "Banner found successfully.", data: banners[0] });
//         }

//         return res.status(200).json({ status: 200, message: "Banners found successfully.", data: banners });
//     } catch (err) {
//         console.error(err);
//         return res.status(500).json({ status: 500, message: "Server error.", data: {} });
//     }
// };


exports.getBannerForCategoryByPosition = async (req, res) => {
    try {
        const categoryId = req.params.categoryId;
        const position = req.query.position;
        if (!["TOP", "MID", "BOTTOM", "MB"].includes(position)) {
            return res.status(400).json({ status: 400, message: "Invalid position" });
        }
        const banners = await banner.find({ position: position, categoryId: categoryId });

        if (banners.length === 0) {
            return res.status(404).json({ status: 404, message: "No data found for the specified position", data: [] });
        }

        return res.status(200).json({ status: 200, message: "Banners found successfully.", position: position, data: banners });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ status: 500, message: "Server error.", data: [] });
    }
};

exports.getBannerById = async (req, res) => {
    try {
        const Banner = await banner.findById({ _id: req.params.id });
        if (!Banner) {
            return res.status(404).json({ status: 404, message: "No data found", data: {} });
        }
        return res.status(200).json({ status: 200, message: "Data found successfully.", data: Banner })
    } catch (err) {
        console.log(err);
        return res.status(501).send({ status: 501, message: "server error.", data: {}, });
    }
};
exports.DeleteBanner = async (req, res) => {
    try {
        const Banner = await banner.findById({ _id: req.params.id });
        if (!Banner) {
            return res.status(404).json({ status: 404, message: "No data found", data: {} });
        }
        await banner.findByIdAndDelete({ _id: req.params.id });
        return res.status(200).json({ status: 200, message: "Banner delete successfully.", data: {} })
    } catch (err) {
        console.log(err);
        return res.status(501).send({ status: 501, message: "server error.", data: {}, });
    }
};
exports.createCharge = async (req, res) => {
    try {
        let findCharges = await Charges.findOne({ name: req.body.name });
        if (findCharges) {
            return res.status(409).json({ message: "Charges already exit.", status: 404, data: {} });
        } else {
            const data = {
                name: req.body.name,
                charge: req.body.charge,
                cancelation: req.body.cancelation,
                discountCharge: req.body.discountCharge,
                discount: req.body.discount
            };
            const findCharge = await Charges.create(data);
            return res.status(200).json({ message: "Charges add successfully.", status: 200, data: findCharge });
        }
    } catch (error) {
        return res.status(500).json({ status: 500, message: "internal server error ", data: error.message, });
    }
};
exports.getCharges = async (req, res) => {
    const findCharge = await Charges.find({});
    return res.status(201).json({ message: "Charges Found", status: 200, data: findCharge, });
};
exports.updateCharge = async (req, res) => {
    const { id } = req.params;
    const findCharge = await Charges.findById(id);
    if (!findCharge) {
        return res.status(404).json({ message: "Charges Not Found", status: 404, data: {} });
    }
    let data = {
        charge: req.body.charge || findCharge.charge,
        name: req.body.name || findCharge.name,
        cancelation: req.body.cancelation || findCharge.cancelation,
        discountCharge: req.body.discountCharge || findCharge.discountCharge,
        discount: req.body.discount || findCharge.discount,
    }
    const update = await Charges.findByIdAndUpdate({ _id: findCharge._id }, { $set: data }, { new: true });
    return res.status(200).json({ message: "Updated Successfully", data: update });
};
exports.removeCharge = async (req, res) => {
    const { id } = req.params;
    const findCharge = await Charges.findById(id);
    if (!findCharge) {
        return res.status(404).json({ message: "Charges Not Found", status: 404, data: {} });
    } else {
        await Charges.findByIdAndDelete(findCharge._id);
        return res.status(200).json({ message: "Charges Deleted Successfully !" });
    }
};
exports.addContactDetails = async (req, res) => {
    try {
        let findContact = await ContactDetail.findOne();
        if (findContact) {
            req.body.mobileNumber = req.body.mobileNumber || findContact.mobileNumber;
            req.body.mobileNumberDescription = req.body.mobileNumberDescription || findContact.mobileNumberDescription;
            req.body.email = req.body.email || findContact.email;
            req.body.emailDescription = req.body.emailDescription || findContact.emailDescription;
            req.body.whatAppchat = req.body.whatAppchat || findContact.whatAppchat;
            req.body.whatAppchatDescription = req.body.whatAppchatDescription || findContact.whatAppchatDescription;
            let updateContact = await ContactDetail.findByIdAndUpdate({ _id: findContact._id }, { $set: req.body }, { new: true });
            if (updateContact) {
                return res.status(200).send({ status: 200, message: "Contact Detail update successfully", data: updateContact });
            }
        } else {
            let result2 = await ContactDetail.create(req.body);
            if (result2) {
                return res.status(200).send({ status: 200, message: "Contact Detail update successfully", data: result2 });
            }
        }
    } catch (err) {
        console.log(err.message);
        return res.status(500).send({ status: 500, msg: "internal server error", error: err.message, });
    }
};
exports.viewContactDetails = async (req, res) => {
    try {
        let findcontactDetails = await ContactDetail.findOne();
        if (!findcontactDetails) {
            return res.status(404).send({ status: 404, message: "Contact Detail not found.", data: {} });
        } else {
            return res.status(200).send({ status: 200, message: "Contact Detail fetch successfully", data: findcontactDetails });
        }
    } catch (err) {
        console.log(err);
        return res.status(500).send({ status: 500, msg: "internal server error", error: err.message, });
    }
};
exports.createE4u = async (req, res) => {
    try {
        let findE4U = await e4u.findOne({ title: req.body.title, type: req.body.type });
        if (findE4U) {
            return res.status(409).json({ message: "E4u already exit.", status: 404, data: {} });
        } else {
            let fileUrl;
            if (req.file) {
                fileUrl = req.file ? req.file.path : "";
            }
            const data = { title: req.body.title, type: req.body.type, description: req.body.description, image: fileUrl };
            const saved = await e4u.create(data);
            return res.status(200).json({ message: "E4u add successfully.", status: 200, data: saved });
        }
    } catch (error) {
        return res.status(500).json({ status: 500, message: "internal server error ", data: error.message, });
    }
};
exports.getE4uByType = async (req, res) => {
    if (req.params.type == "FR") {
        const findE4U = await e4u.findOne({ type: req.params.type });
        if (!findE4U) {
            return res.status(404).json({ status: 404, message: "No data found", data: {} });
        }
        return res.status(201).json({ message: "E4u Found", status: 200, data: findE4U, });
    } else {
        const findE4U = await e4u.find({ type: req.params.type });
        if (findE4U.length == 0) {
            return res.status(404).json({ status: 404, message: "No data found", data: {} });
        }
        return res.status(201).json({ message: "E4u Found", status: 200, data: findE4U, });
    }
};
exports.getE4u = async (req, res) => {
    const findE4U = await e4u.find({});
    if (findE4U.length == 0) {
        return res.status(404).json({ status: 404, message: "No data found", data: {} });
    }
    return res.status(201).json({ message: "E4u Found", status: 200, data: findE4U, });
};
exports.updateE4u = async (req, res) => {
    const { id } = req.params;
    const findE4U = await e4u.findById(id);
    if (!findE4U) {
        return res.status(404).json({ message: "E4u Not Found", status: 404, data: {} });
    }
    let fileUrl;
    if (req.file) {
        fileUrl = req.file ? req.file.path : "";
    }
    findE4U.title = req.body.title || findE4U.title;
    findE4U.type = req.body.type || findE4U.type;
    findE4U.description = req.body.description || findE4U.description;
    findE4U.image = fileUrl || findE4U.image;
    let update = await findE4U.save();
    return res.status(200).json({ message: "Updated Successfully", data: update });
};
exports.removeE4u = async (req, res) => {
    const { id } = req.params;
    const category = await e4u.findById(id);
    if (!category) {
        return res.status(404).json({ message: "E4u Not Found", status: 404, data: {} });
    } else {
        await e4u.findByIdAndDelete(category._id);
        return res.status(200).json({ message: "E4u Deleted Successfully !" });
    }
};
exports.createweCanhelpyou = async (req, res) => {
    const { question, answer, type } = req.body;
    try {
        if (!question || !answer || !type) {
            return res.status(400).json({ message: "questions, answers and type cannot be blank " });
        }
        const findData = await weCanhelpyou.create(req.body);
        return res.status(200).json({ status: 200, message: "We Can help you Added Successfully ", data: findData });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Error ", status: 500, data: err.message });
    }
};
exports.getAllweCanhelpyou = async (req, res) => {
    try {
        const findData = await weCanhelpyou.find({ type: req.params.type }).lean();
        if (findData.length == 0) {
            return res.status(404).json({ status: 404, message: "No data found", data: {} });
        }
        return res.status(200).json({ status: 200, message: "We Can help you retrieved successfully ", data: findData });
    } catch (err) {
        console.log(err);
        return res.status(501).send({ status: 501, message: "server error.", data: {}, });
    }
};
exports.getweCanhelpyouById = async (req, res) => {
    const { id } = req.params;
    try {
        const findData = await weCanhelpyou.findById(id);
        if (!findData) {
            return res.status(404).json({ status: 404, message: "No data found", data: {} });
        }
        return res.status(200).json({ status: 200, message: "We Can help you retrieved successfully ", data: findData });
    } catch (err) {
        console.log(err);
        return res.status(501).send({ status: 501, message: "server error.", data: {}, });
    }
};
exports.updateweCanhelpyou = async (req, res) => {
    const { id } = req.params;
    try {
        const { question, answer, type } = req.body;
        const findData = await weCanhelpyou.findById(id);
        if (!findData) {
            return res.status(404).json({ status: 404, message: "No data found", data: {} });
        }
        let obj = {
            question: question || findData.question,
            answer: answer || findData.answer,
            type: type || findData.type,
        }
        const update = await weCanhelpyou.findByIdAndUpdate(id, { $set: obj }, { new: true });
        return res.status(200).json({ status: 200, message: "update successfully.", data: update });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Something went wrong ", status: 500, data: err.message });
    }
};
exports.deleteweCanhelpyou = async (req, res) => {
    const { id } = req.params;
    try {
        const findData = await weCanhelpyou.findById(id);
        if (!findData) {
            return res.status(404).json({ status: 404, message: "No data found", data: {} });
        }
        const faq = await weCanhelpyou.findByIdAndDelete(findData._id);
        return res.status(200).json({ status: 200, message: "We Can help you Deleted Successfully ", data: faq });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Something went wrong ", status: 500, data: err.message });
    }
};
exports.listTicket = async (req, res) => {
    try {
        let findUser = await User.findOne({ _id: req.user._id });
        if (!findUser) {
            return res.status(404).send({ status: 404, message: "User not found" });
        } else {
            let findTicket = await ticket.find({});
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
                    byUser: false,
                    byAdmin: true,
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
exports.closeTicket = async (req, res) => {
    try {
        const data = await User.findOne({ _id: req.user._id, });
        if (data) {
            const data1 = await ticket.findById({ _id: req.params.id });
            if (data1) {
                let update = await ticket.findByIdAndUpdate({ _id: data1._id }, { $set: { close: true } }, { new: true })
                return res.status(200).json({ status: 200, message: "Ticket close successfully.", data: update });
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
exports.addCoupan = async (req, res) => {
    try {
        let vendorData = await User.findOne({ _id: req.body.userId });
        if (!vendorData) {
            return res.status(404).send({ status: 404, message: "User not found" });
        } else {
            const d = new Date(req.body.expirationDate);
            req.body.expirationDate = d.toISOString();
            const de = new Date(req.body.activationDate);
            req.body.activationDate = de.toISOString();
            req.body.userId = vendorData._id;
            req.body.couponCode = await reffralCode();
            let saveStore = await Coupan(req.body).save();
            if (saveStore) {
                res.json({ status: 200, message: 'Coupan add successfully.', data: saveStore });
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
            let findService = await Coupan.find({});
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
exports.createMainCategory = async (req, res) => {
    try {
        let findCategory = await mainCategory.findOne({ name: req.body.name });
        if (findCategory) {
            return res.status(409).json({ message: "Service Category already exit.", status: 404, data: {} });
        } else {
            let fileUrl;
            if (req.file) {
                fileUrl = req.file ? req.file.path : "";
            }
            const data = { name: req.body.name, image: fileUrl };
            const category = await mainCategory.create(data);
            return res.status(200).json({ message: "Service Category add successfully.", status: 200, data: category });
        }
    } catch (error) {
        return res.status(500).json({ status: 500, message: "internal server error ", data: error.message, });
    }
};
exports.getMainCategories = async (req, res) => {
    const categories = await mainCategory.find({});
    return res.status(201).json({ message: "Service Category Found", status: 200, data: categories, });
};
exports.updateMainCategory = async (req, res) => {
    const { id } = req.params;
    const category = await mainCategory.findById(id);
    if (!category) {
        return res.status(404).json({ message: "Service Category Not Found", status: 404, data: {} });
    }
    let fileUrl;
    if (req.file) {
        fileUrl = req.file ? req.file.path : "";
    }
    category.image = fileUrl || category.image;
    category.name = req.body.name || category.name;
    let update = await category.save();
    return res.status(200).json({ message: "Updated Successfully", data: update });
};
exports.removeMainCategory = async (req, res) => {
    const { id } = req.params;
    const category = await mainCategory.findById(id);
    if (!category) {
        return res.status(404).json({ message: "Service Category Not Found", status: 404, data: {} });
    } else {
        await mainCategory.findByIdAndDelete(category._id);
        return res.status(200).json({ message: "Service Category Deleted Successfully !" });
    }
};
exports.createCategory = async (req, res) => {
    try {
        const findCategory = await mainCategory.findById({ _id: req.body.categoryId });
        if (!findCategory) {
            return res.status(404).json({ message: "Category Not Found", status: 404, data: {} });
        } else {
            let findSubCategory = await Category.findOne({ categoryId: findCategory._id, name: req.body.name });
            if (findSubCategory) {
                return res.status(409).json({ message: "Sub Category already exit.", status: 404, data: {} });
            } else {
                let fileUrl;
                if (req.file) {
                    fileUrl = req.file ? req.file.path : "";
                }
                const data = { name: req.body.name, categoryId: findCategory._id, image: fileUrl };
                const category = await Category.create(data);
                return res.status(200).json({ message: "Service Category add successfully.", status: 200, data: category });
            }
        }
    } catch (error) {
        return res.status(500).json({ status: 500, message: "internal server error ", data: error.message, });
    }
};
exports.getCategories = async (req, res) => {
    const categoryId = req.params.categoryId
    const findCategory = await mainCategory.findById({ _id: categoryId });
    if (!findCategory) {
        return res.status(404).json({ message: "Category Not Found", status: 404, data: {} });
    } else {
        let findSubCategory = await Category.find({ categoryId: findCategory._id })
        if (findSubCategory.length > 0) {
            return res.status(200).json({ message: "Sub Category Found", status: 200, data: findSubCategory, });
        } else {
            return res.status(201).json({ message: "Sub Category not Found", status: 404, data: {}, });
        }
    }
};
exports.updateCategory = async (req, res) => {
    const { id } = req.params;
    const findSubCategory = await Category.findById(id);
    if (!findSubCategory) {
        return res.status(404).json({ message: "Sub Category Not Found", status: 404, data: {} });
    }
    if (req.body.categoryId != (null || undefined)) {
        const findCategory = await mainCategory.findById({ _id: req.body.categoryId });
        if (!findCategory) {
            return res.status(404).json({ message: "Category Not Found", status: 404, data: {} });
        }
    }
    let fileUrl;
    if (req.file) {
        fileUrl = req.file ? req.file.path : "";
    }
    let obj = {
        name: req.body.name || findSubCategory.name,
        categoryId: req.body.categoryId || findSubCategory.categoryId,
        image: fileUrl || findSubCategory.image
    }
    let update = await Category.findByIdAndUpdate({ _id: findSubCategory._id }, { $set: obj }, { new: true });
    return res.status(200).json({ message: "Updated Successfully", data: update });
};
exports.removeCategory = async (req, res) => {
    const { id } = req.params;
    const category = await Category.findById(id);
    if (!category) {
        return res.status(404).json({ message: "Sub Category Not Found", status: 404, data: {} });
    } else {
        await Category.findByIdAndDelete(category._id);
        return res.status(200).json({ message: "Sub Category Deleted Successfully !" });
    }
};
exports.createSubCategory = async (req, res) => {
    try {
        const findMainCategory = await mainCategory.findById({ _id: req.body.mainCategoryId });
        if (!findMainCategory) {
            return res.status(404).json({ message: "Main Category Not Found", status: 404, data: {} });
        } else {
            let findCategory = await Category.findOne({ mainCategoryId: findMainCategory._id, _id: req.body.categoryId });
            if (!findCategory) {
                return res.status(404).json({ message: "Category Not Found", status: 404, data: {} });
            } else {
                let findSubCategory = await subCategory.findOne({ mainCategoryId: findMainCategory._id, categoryId: findCategory._id, name: req.body.name });
                if (findSubCategory) {
                    return res.status(409).json({ message: "Sub Category already exit.", status: 404, data: {} });
                } else {
                    const data = { mainCategoryId: findMainCategory._id, categoryId: findCategory._id, name: req.body.name };
                    const category = await subCategory.create(data);
                    return res.status(200).json({ message: "Sub Category add successfully.", status: 200, data: category });
                }
            }
        }
    } catch (error) {
        return res.status(500).json({ status: 500, message: "internal server error ", data: error.message, });
    }
};
exports.getSubCategories = async (req, res) => {
    const findMainCategory = await mainCategory.findById({ _id: req.params.categoryId });
    if (!findMainCategory) {
        return res.status(404).json({ message: "Main Category Not Found", status: 404, data: {} });
    } else {
        let findCategory = await Category.findOne({ categoryId: findMainCategory._id, _id: req.params.subCategoryId });
        if (!findCategory) {
            return res.status(404).json({ message: "Category Not Found", status: 404, data: {} });
        } else {
            let findSubCategory = await subCategory.find({ mainCategoryId: findMainCategory._id, categoryId: findCategory._id, })
            if (findSubCategory.length > 0) {
                return res.status(200).json({ message: "Sub Category Found", status: 200, data: findSubCategory, });
            } else {
                return res.status(201).json({ message: "Sub Category not Found", status: 404, data: {}, });
            }
        }
    }
};
exports.updateSubCategory = async (req, res) => {
    const { id } = req.params;
    const findSubCategory = await subCategory.findById(id);
    if (!findSubCategory) {
        return res.status(404).json({ message: "Sub Category Not Found", status: 404, data: {} });
    }
    if (req.body.mainCategoryId != (null || undefined)) {
        const findMainCategory = await mainCategory.findById({ _id: req.body.mainCategoryId });
        if (!findMainCategory) {
            return res.status(404).json({ message: "Category Not Found", status: 404, data: {} });
        }
    }
    if (req.body.categoryId != (null || undefined)) {
        let findCategory = await Category.findOne({ _id: req.body.categoryId });
        if (!findCategory) {
            return res.status(404).json({ message: "Category Not Found", status: 404, data: {} });
        }
    }
    let obj = {
        name: req.body.name || findSubCategory.name,
        mainCategoryId: req.body.mainCategoryId || findSubCategory.mainCategoryId,
        categoryId: req.body.categoryId || findSubCategory.categoryId,
    }
    let update = await subCategory.findByIdAndUpdate({ _id: findSubCategory._id }, { $set: obj }, { new: true });
    return res.status(200).json({ message: "Updated Successfully", data: update });
};
exports.removeSubCategory = async (req, res) => {
    const { id } = req.params;
    const category = await subCategory.findById(id);
    if (!category) {
        return res.status(404).json({ message: "Sub Category Not Found", status: 404, data: {} });
    } else {
        await subCategory.findByIdAndDelete(category._id);
        return res.status(200).json({ message: "Sub Category Deleted Successfully !" });
    }
};
exports.createItemSubCategory = async (req, res) => {
    try {
        let findCategory = await Category.findOne({ _id: req.body.categoryId });
        if (!findCategory) {
            return res.status(404).json({ message: "Category Not Found", status: 404, data: {} });
        } else {
            let findSubCategory = await itemSubCategory.findOne({ categoryId: findCategory._id, name: req.body.name });
            if (findSubCategory) {
                return res.status(409).json({ message: "Item Sub Category already exit.", status: 404, data: {} });
            } else {
                const data = { categoryId: findCategory._id, name: req.body.name };
                const category = await itemSubCategory.create(data);
                return res.status(200).json({ message: "Item Sub Category add successfully.", status: 200, data: category });
            }
        }
    } catch (error) {
        return res.status(500).json({ status: 500, message: "internal server error ", data: error.message, });
    }
};
exports.getItemSubCategories = async (req, res) => {
    let findCategory = await Category.findOne({ _id: req.params.categoryId });
    if (!findCategory) {
        return res.status(404).json({ message: "Category Not Found", status: 404, data: {} });
    } else {
        let findSubCategory = await itemSubCategory.find({ categoryId: findCategory._id, })
        if (findSubCategory.length > 0) {
            return res.status(200).json({ message: "Item Sub Category Found", status: 200, data: findSubCategory, });
        } else {
            return res.status(201).json({ message: "Item Sub Category not Found", status: 404, data: {}, });
        }
    }
};
exports.updateItemSubCategory = async (req, res) => {
    const { id } = req.params;
    const findSubCategory = await itemSubCategory.findById(id);
    if (!findSubCategory) {
        return res.status(404).json({ message: "Sub Category Not Found", status: 404, data: {} });
    }
    if (req.body.categoryId != (null || undefined)) {
        let findCategory = await Category.findOne({ _id: req.body.categoryId });
        if (!findCategory) {
            return res.status(404).json({ message: "Category Not Found", status: 404, data: {} });
        }
    }
    let obj = {
        name: req.body.name || findSubCategory.name,
        categoryId: req.body.categoryId || findSubCategory.categoryId,
    }
    let update = await itemSubCategory.findByIdAndUpdate({ _id: findSubCategory._id }, { $set: obj }, { new: true });
    return res.status(200).json({ message: "Updated Successfully", data: update });
};
exports.removeItemSubCategory = async (req, res) => {
    const { id } = req.params;
    const category = await itemSubCategory.findById(id);
    if (!category) {
        return res.status(404).json({ message: "Sub Category Not Found", status: 404, data: {} });
    } else {
        await itemSubCategory.findByIdAndDelete(category._id);
        return res.status(200).json({ message: "Sub Category Deleted Successfully !" });
    }
};
exports.createItem = async (req, res) => {
    try {
        const findCategory = await Category.findById({ _id: req.body.categoryId });
        if (!findCategory) {
            return res.status(404).json({ message: "Main Category Not Found", status: 404, data: {} });
        } else {
            let findItemSubCategory = await itemSubCategory.findOne({ categoryId: findCategory._id, _id: req.body.itemSubCategoryId });
            if (!findItemSubCategory) {
                return res.status(404).json({ message: "Category Not Found", status: 404, data: {} });
            } else {
                let findSubCategory = await item.findOne({ categoryId: findCategory._id, itemSubCategoryId: findItemSubCategory._id, name: req.body.name });
                if (findSubCategory) {
                    return res.status(409).json({ message: "Item already exit.", status: 404, data: {} });
                } else {
                    const data = { categoryId: findCategory._id, itemSubCategoryId: findItemSubCategory._id, name: req.body.name, price: req.body.price };
                    const category = await item.create(data);
                    return res.status(200).json({ message: "Item add successfully.", status: 200, data: category });
                }
            }
        }
    } catch (error) {
        return res.status(500).json({ status: 500, message: "internal server error ", data: error.message, });
    }
};
exports.getItem = async (req, res) => {
    try {
        const findCategory = await Category.findById({ _id: req.params.categoryId });
        if (!findCategory) {
            return res.status(404).json({ message: "Category Not Found", status: 404, data: {} });
        } else {
            let findItemSubCategory = await itemSubCategory.findOne({ categoryId: findCategory._id, _id: req.params.itemSubCategoryId });
            if (!findItemSubCategory) {
                return res.status(404).json({ message: "Sub Category Not Found", status: 404, data: {} });
            } else {
                let findSubCategory = await item.find({ categoryId: findCategory._id, itemSubCategoryId: findItemSubCategory._id, })
                if (findSubCategory.length > 0) {
                    return res.status(200).json({ message: "Item Found", status: 200, data: findSubCategory, });
                } else {
                    return res.status(201).json({ message: "Item not Found", status: 404, data: {}, });
                }
            }
        }
    } catch (error) {
        return res.status(500).json({ status: 500, message: "internal server error ", data: error.message, });
    }
};
exports.updateItem = async (req, res) => {
    const { id } = req.params;
    const findSubCategory = await item.findById(id);
    if (!findSubCategory) {
        return res.status(404).json({ message: "Item Not Found", status: 404, data: {} });
    }
    let findItemSubCategory, findCategory;
    if (req.body.categoryId != (null || undefined)) {
        findCategory = await Category.findById({ _id: req.body.categoryId });
        if (!findCategory) {
            return res.status(404).json({ message: "Category Not Found", status: 404, data: {} });
        }
    }
    if (req.body.itemSubCategoryId != (null || undefined)) {
        findItemSubCategory = await itemSubCategory.findOne({ _id: req.body.itemSubCategoryId });
        if (!findItemSubCategory) {
            return res.status(404).json({ message: "Item sub Category Not Found", status: 404, data: {} });
        }
    }
    let obj = {
        name: req.body.name || findSubCategory.name,
        categoryId: req.body.categoryId || findSubCategory.categoryId,
        itemSubCategoryId: req.body.itemSubCategoryId || findSubCategory.itemSubCategoryId,
        price: req.body.price || findSubCategory.price,
    }
    let update = await item.findByIdAndUpdate({ _id: findSubCategory._id }, { $set: obj }, { new: true });
    return res.status(200).json({ message: "Updated Successfully", data: update });
};
exports.removeItem = async (req, res) => {
    const { id } = req.params;
    const category = await item.findById(id);
    if (!category) {
        return res.status(404).json({ message: "Item Not Found", status: 404, data: {} });
    } else {
        await item.findByIdAndDelete(category._id);
        return res.status(200).json({ message: "Item Deleted Successfully !" });
    }
};
exports.createService = async (req, res) => {
    try {
        const findMainCategory = await mainCategory.findById({ _id: req.body.mainCategoryId });
        if (!findMainCategory) {
            return res.status(404).json({ message: "Main Category Not Found", status: 404, data: {} });
        } else {
            let findCategory, findSubCategory;
            if (req.body.categoryId != (null || undefined)) {
                findCategory = await Category.findOne({ mainCategoryId: findMainCategory._id, _id: req.body.categoryId });
                if (!findCategory) {
                    return res.status(404).json({ message: "Category Not Found", status: 404, data: {} });
                }
            } else {
                let findService = await service.findOne({ title: req.body.title, mainCategoryId: findMainCategory._id, type: req.body.type, packageType: req.body.packageType });
                if (findService) {
                    return res.status(409).json({ message: "Service already exit.", status: 409, data: {} });
                }
            }
            if (req.body.subCategoryId != (null || undefined)) {
                findSubCategory = await subCategory.findOne({ _id: req.body.subCategoryId, mainCategoryId: findMainCategory._id, categoryId: findCategory._id, })
                if (!findSubCategory) {
                    return res.status(404).json({ message: "sub category Not Found", status: 404, data: {} });
                }
                let findService = await service.findOne({ title: req.body.title, mainCategoryId: findMainCategory._id, type: req.body.type, packageType: req.body.packageType, categoryId: findCategory._id, subCategoryId: findSubCategory._id, });
                if (findService) {
                    return res.status(409).json({ message: "Service already exit.", status: 409, data: {} });
                }
            }
            let discountPrice = 0, discount = 0, totalTime;
            if (req.body.timeInMin > 60) {
                const hours = Math.floor(req.body.timeInMin / 60);
                const minutes = req.body.timeInMin % 60;
                totalTime = `${hours} hr ${minutes} min`
            } else {
                const minutes = req.body.timeInMin % 60;
                totalTime = `00 hr ${minutes} min`
            }
            if (req.body.discountActive == "true") {
                discountPrice = Number((req.body.originalPrice) - ((Number(req.body.originalPrice) * Number(req.body.discount)) / 100)).toFixed();
                discount = req.body.discount;
            } else {
                discountPrice = discountPrice;
                discount = discount;
            }
            let images = [];
            if (req.files) {
                for (let j = 0; j < req.files.length; j++) {
                    let obj = {
                        img: req.files[j].path
                    }
                    images.push(obj)
                }
            }
            let items = [], services = [];
            if (req.body.services != (null || undefined)) {
                for (let i = 0; i < req.body.services.length; i++) {
                    let findItem = await service.findById({ _id: req.body.services[i] });
                    if (findItem) {
                        let item1 = {
                            service: findItem._id
                        }
                        services.push(item1);
                    } else {
                        return res.status(404).json({ message: `service Not Found`, status: 404, data: {} });
                    }
                }
            }
            if (req.body.items != (null || undefined)) {
                for (let i = 0; i < req.body.items.length; i++) {
                    let findItem = await item.findById({ _id: req.body.items[i] });
                    if (findItem) {
                        let item1 = {
                            item: findItem._id
                        }
                        items.push(item1);
                    } else {
                        return res.status(404).json({ message: `item Not Found`, status: 404, data: {} });
                    }
                }
            }
            if (req.body.type == "Service") {
                const data = {
                    mainCategoryId: findMainCategory._id,
                    categoryId: findCategory._id,
                    subCategoryId: findSubCategory._id,
                    title: req.body.title,
                    description: req.body.description,
                    originalPrice: req.body.originalPrice,
                    discountActive: req.body.discountActive,
                    discount: req.body.discount,
                    discountPrice: discountPrice,
                    totalTime: totalTime,
                    timeInMin: req.body.timeInMin,
                    images: images,
                    E4uSafety: req.body.E4uSafety,
                    thingsToKnow: req.body.thingsToKnow,
                    E4uSuggestion: req.body.E4uSuggestion,
                    type: req.body.type,
                    items: items
                };
                const category = await service.create(data);
                return res.status(200).json({ message: "Service add successfully.", status: 200, data: category });
            }
            if (req.body.type == "Package") {
                if (req.body.packageType == "Customise") {
                    const data = {
                        mainCategoryId: findMainCategory._id,
                        categoryId: findCategory._id,
                        subCategoryId: findSubCategory._id,
                        title: req.body.title,
                        description: req.body.description,
                        originalPrice: req.body.originalPrice,
                        discountActive: req.body.discountActive,
                        discount: req.body.discount,
                        discountPrice: discountPrice,
                        totalTime: totalTime,
                        timeInMin: req.body.timeInMin,
                        images: images,
                        E4uSafety: req.body.E4uSafety,
                        thingsToKnow: req.body.thingsToKnow,
                        E4uSuggestion: req.body.E4uSuggestion,
                        type: "Package",
                        packageType: "Customise",
                        selected: true,
                        selectedCount: req.body.selectedCount,
                        services: services,
                        items: items
                    };
                    const category = await service.create(data);
                    return res.status(200).json({ message: "Service add successfully.", status: 200, data: category });
                }
                if (req.body.packageType == "Normal") {
                    const data = {
                        mainCategoryId: findMainCategory._id,
                        categoryId: findCategory._id,
                        subCategoryId: findSubCategory._id,
                        title: req.body.title,
                        description: req.body.description,
                        originalPrice: req.body.originalPrice,
                        discountActive: req.body.discountActive,
                        discount: req.body.discount,
                        discountPrice: discountPrice,
                        totalTime: totalTime,
                        timeInMin: req.body.timeInMin,
                        images: images,
                        E4uSafety: req.body.E4uSafety,
                        thingsToKnow: req.body.thingsToKnow,
                        E4uSuggestion: req.body.E4uSuggestion,
                        type: "Package",
                        packageType: "Normal",
                        selected: false,
                        selectedCount: 0,
                        services: services,
                        items: items
                    };
                    const category = await service.create(data);
                    return res.status(200).json({ message: "Service add successfully.", status: 200, data: category });
                }
                if (req.body.packageType == "Edit") {
                    const data = {
                        mainCategoryId: findMainCategory._id,
                        title: req.body.title,
                        description: req.body.description,
                        originalPrice: req.body.originalPrice,
                        discountActive: req.body.discountActive,
                        discount: req.body.discount,
                        discountPrice: discountPrice,
                        totalTime: totalTime,
                        timeInMin: req.body.timeInMin,
                        images: images,
                        E4uSafety: req.body.E4uSafety,
                        thingsToKnow: req.body.thingsToKnow,
                        E4uSuggestion: req.body.E4uSuggestion,
                        type: "Package",
                        packageType: "Edit",
                    };
                    let findCategories = await Category.find({ mainCategoryId: findMainCategory._id });
                    if (findCategories.length == 0) {
                        return res.status(404).json({ message: "first add Category in this main category", status: 404, data: {} });
                    }
                    const saveService = await service.create(data);
                    if (saveService) {
                        for (let i = 0; i < findCategories.length; i++) {
                            let findServices = await service.find({ categoryId: findCategories[i]._id });
                            if (findServices.length == 0) {
                                return res.status(404).json({ message: "first add Services in categories", status: 404, data: {} });
                            }
                            let services = [];
                            for (let j = 0; j < findServices.length; j++) {
                                let obj = {
                                    service: findServices[j]._id,
                                }
                                services.push(obj)
                            }
                            let obj1 = {
                                serviceId: saveService._id,
                                categoryId: findCategories[i]._id,
                                services: services,
                            }
                            let savePackage = await servicePackage.create(obj1);
                            if (savePackage) {
                                await service.findByIdAndUpdate({ _id: saveService._id }, { $push: { servicePackageId: savePackage._id } }, { new: true })
                            }
                        }
                        let x = await service.findById({ _id: saveService._id })
                        return res.status(200).json({ message: "Service add successfully.", status: 200, data: x });
                    }
                }
            }

        }
    } catch (error) {
        return res.status(500).json({ status: 500, message: "internal server error ", data: error.message, });
    }
};
exports.getService = async (req, res) => {
    try {
        const findMainCategory = await mainCategory.findById({ _id: req.params.mainCategoryId });
        if (!findMainCategory) {
            return res.status(404).json({ message: "Main Category Not Found", status: 404, data: {} });
        } else {
            let findCategory = await Category.findOne({ mainCategoryId: findMainCategory._id, _id: req.params.categoryId });
            if (!findCategory) {
                return res.status(404).json({ message: "Category Not Found", status: 404, data: {} });
            } else {
                let findSubCategory = await subCategory.findOne({ _id: req.params.subCategoryId, mainCategoryId: findMainCategory._id, categoryId: findCategory._id, })
                if (!findSubCategory) {
                    return res.status(404).json({ message: "sub category Not Found", status: 404, data: {} });
                } else {
                    let findService = await service.find({ mainCategoryId: findMainCategory._id, categoryId: findCategory._id, subCategoryId: findSubCategory._id, });
                    if (findService.length > 0) {
                        return res.status(201).json({ message: "Service Found", status: 200, data: findService, });
                    } else {
                        return res.status(404).json({ message: "Service not found.", status: 404, data: {} });
                    }
                }
            }
        }
    } catch (error) {
        return res.status(500).json({ status: 500, message: "internal server error ", data: error.message, });
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
// exports.addOffer = async (req, res) => {
//     try {
//         if (req.body.userId != (null || undefined)) {
//             let vendorData = await User.findOne({ _id: req.body.userId });
//             if (!vendorData) {
//                 return res.status(404).send({ status: 404, message: "User not found" });
//             }
//             if (req.body.categoryId != (null || undefined)) {
//                 const findCategory = await Category.findById({ _id: req.body.categoryId });
//                 if (!findCategory) {
//                     return res.status(404).json({ message: "Category Not Found", status: 404, data: {} });
//                 } else {
//                     let fileUrl;
//                     if (req.file) {
//                         fileUrl = req.file ? req.file.path : "";
//                     }
//                     const d = new Date(req.body.expirationDate);
//                     let expirationDate = d.toISOString();
//                     const de = new Date(req.body.activationDate);
//                     let activationDate = de.toISOString();
//                     let couponCode = await reffralCode();
//                     let obj = {
//                         userId: req.body.userId,
//                         categoryId: findCategory._id,
//                         couponCode: couponCode,
//                         title: req.body.title,
//                         description: req.body.description,
//                         color: req.body.color,
//                         amount: req.body.amount,
//                         expirationDate: expirationDate,
//                         activationDate: activationDate,
//                         image: fileUrl,
//                         type: "user"
//                     }
//                     let saveStore = await offer(obj).save();
//                     if (saveStore) {
//                         res.json({ status: 200, message: 'offer add successfully.', data: saveStore });
//                     }
//                 }
//             }
//             if (req.body.serviceId != (null || undefined)) {
//                 const findService = await service.findById({ _id: req.body.serviceId });
//                 if (!findService) {
//                     return res.status(404).json({ message: "Service Not Found", status: 404, data: {} });
//                 } else {
//                     let fileUrl;
//                     if (req.file) {
//                         fileUrl = req.file ? req.file.path : "";
//                     }
//                     const d = new Date(req.body.expirationDate);
//                     let expirationDate = d.toISOString();
//                     const de = new Date(req.body.activationDate);
//                     let activationDate = de.toISOString();
//                     let couponCode = await reffralCode();
//                     let obj = {
//                         userId: req.body.userId,
//                         serviceId: findService._id,
//                         couponCode: couponCode,
//                         title: req.body.title,
//                         description: req.body.description,
//                         color: req.body.color,
//                         amount: req.body.amount,
//                         expirationDate: expirationDate,
//                         activationDate: activationDate,
//                         image: fileUrl,
//                         type: "user"
//                     }
//                     let saveStore = await offer(obj).save();
//                     if (saveStore) {
//                         res.json({ status: 200, message: 'offer add successfully.', data: saveStore });
//                     }
//                 }
//             }
//         } else {
//             if (req.body.categoryId != (null || undefined)) {
//                 const findCategory = await Category.findById({ _id: req.body.categoryId });
//                 if (!findCategory) {
//                     return res.status(404).json({ message: "Category Not Found", status: 404, data: {} });
//                 } else {
//                     let fileUrl;
//                     if (req.file) {
//                         fileUrl = req.file ? req.file.path : "";
//                     }
//                     const d = new Date(req.body.expirationDate);
//                     let expirationDate = d.toISOString();
//                     const de = new Date(req.body.activationDate);
//                     let activationDate = de.toISOString();
//                     let couponCode = await reffralCode();
//                     let obj = {
//                         categoryId: findCategory._id,
//                         couponCode: couponCode,
//                         title: req.body.title,
//                         description: req.body.description,
//                         amount: req.body.amount,
//                         color: req.body.color,
//                         expirationDate: expirationDate,
//                         activationDate: activationDate,
//                         image: fileUrl,
//                         type: "other"
//                     }
//                     let saveStore = await offer(obj).save();
//                     if (saveStore) {
//                         res.json({ status: 200, message: 'offer add successfully.', data: saveStore });
//                     }
//                 }
//             }
//             if (req.body.serviceId != (null || undefined)) {
//                 const findService = await service.findById({ _id: req.body.serviceId });
//                 if (!findService) {
//                     return res.status(404).json({ message: "Service Not Found", status: 404, data: {} });
//                 } else {
//                     let fileUrl;
//                     if (req.file) {
//                         fileUrl = req.file ? req.file.path : "";
//                     }
//                     const d = new Date(req.body.expirationDate);
//                     let expirationDate = d.toISOString();
//                     const de = new Date(req.body.activationDate);
//                     let activationDate = de.toISOString();
//                     let couponCode = await reffralCode();
//                     let obj = {
//                         serviceId: findService._id,
//                         couponCode: couponCode,
//                         title: req.body.title,
//                         description: req.body.description,
//                         amount: req.body.amount,
//                         color: req.body.color,
//                         expirationDate: expirationDate,
//                         activationDate: activationDate,
//                         image: fileUrl,
//                         type: "other"
//                     }
//                     let saveStore = await offer(obj).save();
//                     if (saveStore) {
//                         res.json({ status: 200, message: 'offer add successfully.', data: saveStore });
//                     }
//                 }
//             }
//         }
//     } catch (error) {
//         console.error(error);
//         return res.status(500).send({ status: 500, message: "Server error" + error.message });
//     }
// };

exports.addOffer = async (req, res) => {
    try {
        if (!req.body.userId) {
            return res.status(400).json({ status: 400, message: "User ID is required" });
        }

        const vendorData = await User.findOne({ _id: req.body.userId });
        if (!vendorData) {
            return res.status(404).json({ status: 404, message: "User not found" });
        }

        let obj = {
            userId: req.body.userId,
            title: req.body.title,
            description: req.body.description,
            color: req.body.color,
            amount: req.body.amount,
        };

        if (req.body.categoryId) {
            const findCategory = await mainCategory.findById(req.body.categoryId);
            if (!findCategory) {
                return res.status(404).json({ status: 404, message: "Category not found" });
            }
            obj.categoryId = findCategory._id;
        }

        if (req.body.serviceId) {
            const findService = await service.findById(req.body.serviceId);
            if (!findService) {
                return res.status(404).json({ status: 404, message: "Service not found" });
            }
            obj.serviceId = findService._id;
        }

        if (req.body.expirationDate) {
            const d = new Date(req.body.expirationDate);
            obj.expirationDate = d.toISOString();
        }

        if (req.body.activationDate) {
            const de = new Date(req.body.activationDate);
            obj.activationDate = de.toISOString();
        }

        if (req.file) {
            obj.image = req.file.path;
        }

        let couponCode = await reffralCode();
        obj.couponCode = couponCode;
        obj.type = req.body.type


        const saveStore = await offer(obj).save();

        if (saveStore) {
            res.status(200).json({ status: 200, message: 'Offer added successfully', data: saveStore });
        } else {
            res.status(500).json({ status: 500, message: 'Failed to add offer' });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: "Server error: " + error.message });
    }
};

exports.listOffer = async (req, res) => {
    try {
        let vendorData = await User.findOne({ _id: req.user._id });
        if (!vendorData) {
            return res.status(404).send({ status: 404, message: "User not found" });
        } else {
            let findService = await offer.find({});
            if (findService.length == 0) {
                return res.status(404).send({ status: 404, message: "Data not found" });
            } else {
                res.json({ status: 200, message: 'offer Data found successfully.', service: findService });
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
            let findService = await offer.find({ $and: [{ $or: [{ userId: vendorData._id }, { type: "user" }] }] })
                .populate('categoryId');

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

exports.getOtherOffer = async (req, res) => {
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
exports.createFreeService = async (req, res) => {
    try {
        let findUser = await User.findById({ _id: req.body.userId });
        if (!findUser) {
            return res.status(404).json({ message: "user not found.", status: 404, data: {} });
        }
        let findService = await service.findById({ _id: req.body.serviceId });
        if (!findService) {
            return res.status(404).json({ message: "Service not found.", status: 404, data: {} });
        }
        let findFreeService = await freeService.findOne({ userId: req.body.userId, serviceId: findService._id, used: false });
        if (findFreeService) {
            return res.status(409).json({ message: "This free service already exit.", status: 404, data: {} });
        } else {
            const data = {
                userId: req.body.userId,
                serviceId: findService._id,
                used: false
            };
            const findCharge = await freeService.create(data);
            return res.status(200).json({ message: "free service add successfully.", status: 200, data: findCharge });
        }
    } catch (error) {
        return res.status(500).json({ status: 500, message: "internal server error ", data: error.message, });
    }
};
exports.getFreeServices = async (req, res) => {
    const findFreeService = await freeService.find({}).populate([{ path: 'userId', select: 'fullName firstName lastName' }, { path: 'serviceId', select: 'name price totalTime' }]);
    return res.status(201).json({ message: "Free Service Found", status: 200, data: findFreeService, });
};
exports.updateFreeServices = async (req, res) => {
    const { id } = req.params;
    const findCharge = await freeService.findById(id);
    if (!findCharge) {
        return res.status(404).json({ message: "Free service Not Found", status: 404, data: {} });
    }
    let findUser = await User.findById({ _id: req.body.userId });
    if (!findUser) {
        return res.status(404).json({ message: "user not found.", status: 404, data: {} });
    }
    let findService = await service.findById({ _id: req.body.serviceId });
    if (!findService) {
        return res.status(404).json({ message: "Service not found.", status: 404, data: {} });
    }
    let findFreeService = await freeService.findOne({ _id: { $ne: findCharge._id }, userId: req.body.userId, serviceId: findService._id, used: false });
    if (findFreeService) {
        return res.status(409).json({ message: "This free service already exit.", status: 404, data: {} });
    }
    let data = {
        userId: req.body.userId || findCharge.userId,
        serviceId: req.body.serviceId || findCharge.serviceId,
        used: false || findCharge.used,
    }
    const update = await freeService.findByIdAndUpdate({ _id: findCharge._id }, { $set: data }, { new: true });
    return res.status(200).json({ message: "Updated Successfully", data: update });
};
exports.removeFreeServices = async (req, res) => {
    const { id } = req.params;
    const findCharge = await freeService.findById(id);
    if (!findCharge) {
        return res.status(404).json({ message: "freeService Not Found", status: 404, data: {} });
    } else {
        await freeService.findByIdAndDelete(findCharge._id);
        return res.status(200).json({ message: "freeService Deleted Successfully !" });
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
exports.assignItems = async (req, res) => {
    try {
        const data = await User.findOne({ _id: req.user._id, });
        if (data) {
            const data1 = await item.findOne({ _id: req.body.itemId, });
            if (data1) {
                const findPartner = await User.findOne({ _id: req.body.userId, });
                if (findPartner) {
                    let findPartnerItem = await partnerItems.findOne({ userId: findPartner._id, itemId: data1._id });
                    if (findPartnerItem) {
                        let obj = { totalStock: req.body.totalStock + findPartnerItem.totalStock, useStock: findPartnerItem.useStock, liveStock: req.body.liveStock + findPartnerItem.totalStock, }
                        let update = await partnerItems.findByIdAndUpdate({ _id: findPartnerItem._id }, { $set: obj }, { new: true })
                        return res.status(200).json({ status: 200, message: "Item assign to partner successfully. ", data: update })
                    } else {
                        let obj = {
                            userId: findPartner._id,
                            itemId: data1._id,
                            totalStock: req.body.totalStock,
                            useStock: 0,
                            liveStock: req.body.totalStock,
                        }
                        const Data = await partnerItems.create(obj);
                        return res.status(200).json({ status: 200, message: "Item assign to partner successfully. ", data: Data })
                    }
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
exports.assignItemslist = async (req, res) => {
    try {
        const data = await User.findOne({ _id: req.user._id, });
        if (data) {
            let findPartnerItem = await partnerItems.find({}).populate('userId itemId');
            if (findPartnerItem.length > 0) {
                return res.status(200).json({ status: 200, message: "Assign Item  get successfully. ", data: findPartnerItem })
            } else {
                return res.status(200).json({ status: 200, message: "Assign Item  get successfully. ", data: [] })
            }
        } else {
            return res.status(404).json({ status: 404, message: "No data found", data: {} });
        }
    } catch (error) {
        console.log(error);
        return res.status(501).send({ status: 501, message: "server error.", data: {}, });
    }
};









// ///////////////////////////////////////////////////////////////////////////////////////////////////////////
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
const reffralCode = async () => {
    var digits = "ABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let OTP = '';
    for (let i = 0; i < 6; i++) {
        OTP += digits[Math.floor(Math.random() * 36)];
    }
    return OTP;
}
exports.getAllLeaves = async (req, res) => {
    try {
        const allLeaves = await Leave.find();
        res.json({ status: 200, message: ' All Leave data retrieved successfully', data: allLeaves });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to retrieve leave requests' });
    }
};
exports.approveLeave = async (req, res) => {
    try {
        const leaveId = req.params.id;
        const updatedLeave = await Leave.findByIdAndUpdate(leaveId, { status: 'approved' }, { new: true });
        res.json({ status: 200, message: 'Approved leave successfully', data: updatedLeave });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to approve leave' });
    }
};
exports.cancelLeave = async (req, res) => {
    try {
        const leaveId = req.params.id;
        const updatedLeave = await Leave.findByIdAndUpdate(leaveId, { status: 'cancelled' }, { new: true });
        res.json({ status: 200, message: 'Cancel Leave successfully', data: updatedLeave });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to cancel leave' });
    }
};
exports.getAllSPAgreements = async (req, res) => {
    try {
        const allSPAgreements = await SPAgreement.find();
        res.json({ status: 200, message: 'All SpAgreement data retrieved successfully', data: allSPAgreements });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to retrieve SP agreements' });
    }
};
exports.getSPAgreementById = async (req, res) => {
    const { id } = req.params;
    try {
        const spAgreement = await SPAgreement.findById(id);
        if (!spAgreement) {
            return res.status(404).json({ error: 'SP agreement not found' });
        }
        res.json({ status: 200, message: 'SpAgreement retrieved successfully', data: spAgreement });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to retrieve SP agreement' });
    }
};
exports.getAllTrainingVideos = async (req, res) => {
    try {
        const allTrainingVideos = await TrainingVideo.find();
        res.json({ status: 200, message: 'All traning Video retrieved successfully', data: allTrainingVideos });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to retrieve training videos' });
    }
};
exports.getTrainingVideoById = async (req, res) => {
    const { id } = req.params;
    try {
        const trainingVideo = await TrainingVideo.findById(id);
        if (!trainingVideo) {
            return res.status(404).json({ error: 'Training video not found' });
        }
        res.json({ status: 200, message: 'Traning Video retrieved successfully', data: trainingVideo });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to retrieve training video' });
    }
};
exports.getAllTransportationCharges = async (req, res) => {
    try {
        const allCharges = await TransportationCharge.find();
        res.json({ status: 200, message: 'All transportation charges retrieved successfully', data: allCharges });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to retrieve transportation charges' });
    }
};
exports.getTransportationChargeById = async (req, res) => {
    const { id } = req.params;
    try {
        const charge = await TransportationCharge.findById(id);
        if (!charge) {
            return res.status(404).json({ error: 'Transportation charge not found' });
        }
        res.json({ status: 200, message: 'Transportation charge retrieved successfully', data: charge });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to retrieve transportation charge' });
    }
};

exports.getAllReferrals = async (req, res) => {
    try {
        const referrals = await Referral.find();
        res.status(200).json({ success: true, data: referrals });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Failed to fetch referrals' });
    }
};

exports.getReferralById = async (req, res) => {
    try {
        const referralId = req.params.id;
        const referral = await Referral.findById(referralId);

        if (!referral) {
            return res.status(404).json({ success: false, error: 'Referral not found' });
        }

        res.status(200).json({ success: true, data: referral });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Failed to fetch referral' });
    }
};

exports.getAllConsentForms = async (req, res) => {
    try {
        const consentForms = await ConsentForm.find();
        return res.status(200).json({ message: 'All consent forms', data: consentForms });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Failed to get consent forms' });
    }
};

exports.getConsentFormById = async (req, res) => {
    try {
        const consentForm = await ConsentForm.findById(req.params.id);
        if (!consentForm) {
            return res.status(404).json({ message: 'Consent form not found' });
        }
        return res.status(200).json({ message: 'Consent form found', data: consentForm });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Failed to get consent form' });
    }
};

