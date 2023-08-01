const mongoose = require("mongoose");
const schema = mongoose.Schema;
const faqSchema = new mongoose.Schema(
    {
        categoryId: {
            type: schema.Types.ObjectId,
            ref: "Category"
        },
        question: {
            type: String,
            required: true,
        },
        answer: {
            type: String,
            required: true,
        },
        type: {
            type: String,
            enum: ["Category", "Support"],
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("FAQ", faqSchema);