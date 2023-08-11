const mongoose = require("mongoose");

const schema = mongoose.Schema;
const categorySchema = schema({
    mainCategoryId: {
        type: schema.Types.ObjectId,
        ref: "mainCategory"
    },
    categoryId: {
        type: schema.Types.ObjectId,
        ref: "Category"
    },
    name: {
        type: String
    },
    status: {
        type: Boolean,
        default: true
    },
}, { timestamps: true });

module.exports = mongoose.model("subCategory", categorySchema);
