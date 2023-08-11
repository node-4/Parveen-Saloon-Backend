const mongoose = require('mongoose');
const schema = mongoose.Schema;
var storeSchema = new schema({
        categoryId: {
                type: schema.Types.ObjectId,
                ref: "Category"
        },
        subCategoryId: {
                type: schema.Types.ObjectId,
                ref: "subCategory"
        },
        facialTypeId: {
                type: schema.Types.ObjectId,
                ref: "facialType"
        },
        name: {
                type: String
        },
        images: [{
                img: {
                        type: String
                }
        }],
        timeInMin: {
                type: Number
        },
        totalTime: {
                type: String
        },
        price: {
                type: Number
        },
        discountPrice: {
                type: Number
        },
        discount: {
                type: Number
        },
        discountActive: {
                type: Boolean,
                default: false
        },
        discription: {
                type: Array
        },
        E4uSafety: {
                type: Array
        },
        thingsToKnow: {
                type: Array
        },
        E4uSuggestion: {
                type: Array
        },
        rating: {
                type: Number,
                default: 0
        },
        sellCount: {
                type: Number,
                default: 0
        },
        useBy: {
                type: String,
                enum: ["Male", "Female", "Both"]
        },
        type: {
                type: String,
                enum: ["Premium", "Classic"]
        },
}, { timestamps: true });
module.exports = mongoose.model("services", storeSchema);
