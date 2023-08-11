const mongoose = require("mongoose");

const schema = mongoose.Schema;
const categorySchema = schema({
    categoryId: {
        type: schema.Types.ObjectId,
        ref: "mainCategory"
    },
    name: {
        type: String
    },
    image: {
        type: String
    },
    status: {
        type: Boolean,
        default: true
    },
}, { timestamps: true });

module.exports = mongoose.model("Category", categorySchema);
