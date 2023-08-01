const mongoose = require("mongoose");
const schema = mongoose.Schema;
const FeedbackSchema = new mongoose.Schema(
    {
        userId: {
            type: schema.Types.ObjectId,
            ref: "user"
        },
        categoryId: {
            type: schema.Types.ObjectId,
            ref: "Category"
        },
        serviceId: {
            type: schema.Types.ObjectId,
            ref: "services"
        },
        couponCode: {
            type: String,
        },
        title: {
            type: String,
        },
        description: {
            type: String,
        },
        amount: {
            type: Number,
        },
        expirationDate: {
            type: Date,
        },
        activationDate: {
            type: Date,
        },
        image: {
            type: String,
        },
    },
    { timeseries: true }
);
module.exports = mongoose.model("offer", FeedbackSchema);