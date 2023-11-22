const mongoose = require("mongoose");
const schema = mongoose.Schema;
const bannerSchema = mongoose.Schema({
    mainCategoryId: {
        type: schema.Types.ObjectId,
        ref: "mainCategory"
    },
    categoryId: {
        type: schema.Types.ObjectId,
        ref: "Category"
    },
    subCategoryId: {
        type: schema.Types.ObjectId,
        ref: "subCategory"
    },
    servicesId: {
        type: schema.Types.ObjectId,
        ref: "services"
    },
    image: {
        type: String,
    },
    colour: {
        type: String,
    },
    position: {
        type: String,
        // enum: ["TOP", "MID", "BOTTOM", "MB"],
    },
    type: {
        type: String,
        enum: ["HeroBanner", "Offer", "Static"],
    },
    desc: {
        type: String,
    },
    status: {
        type: Boolean,
        default: true
    },
}, { timestamps: true });
const banner = mongoose.model("banner", bannerSchema);
module.exports = banner;
