const mongoose = require("mongoose");
const schema = mongoose.Schema;
const couponSchema = new mongoose.Schema({
        name: {
                type: String,
        },
        charge: {
                type: Number,
        },
        status: {
                type: Boolean,
                default: true,
        },
}, { timestamps: true });
module.exports = mongoose.model("Charges", couponSchema);
