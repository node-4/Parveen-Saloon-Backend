const mongoose = require("mongoose");
const schema = mongoose.Schema;
const categorySchema = schema({
    name: {
        type: String
    },
    status: {
        type: Boolean,
        default: true
    },
}, { timestamps: true });

module.exports = mongoose.model("facialType", categorySchema);
