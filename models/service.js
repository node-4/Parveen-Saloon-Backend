const mongoose = require('mongoose');
const schema = mongoose.Schema;
var storeSchema = new schema({
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
        servicePackageId: [{
                type: schema.Types.ObjectId,
                ref: "servicePackage"
        }],
        title: {
                type: String
        },
        description: {
                type: Array
        },
        originalPrice: {
                type: Number
        },
        discountActive: {
                type: Boolean,
                default: false
        },
        discount: {
                type: Number
        },
        discountPrice: {
                type: Number
        },
        timeInMin: {
                type: Number
        },
        totalTime: {
                type: String
        },
        images: [{
                img: {
                        type: String
                }
        }],
        E4uSafety: {
                type: Array
        },
        thingsToKnow: {
                type: Array
        },
        E4uSuggestion: {
                type: Array
        },
        items: [{
                item: {
                        type: schema.Types.ObjectId,
                        ref: "item"
                }
        }],
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
        services: [{
                service: {
                        type: schema.Types.ObjectId,
                        ref: "services"
                }
        }],
        selectedCount: {
                type: Number,
                default: 0
        },
        selected: {
                type: Boolean,
                default: false
        },
        type: {
                type: String,
                enum: ["Service", "Package"]
        },
        packageType: {
                type: String,
                enum: ["Customise", "Normal", "Edit"]
        },

}, { timestamps: true });
module.exports = mongoose.model("services", storeSchema);
