const mongoose = require("mongoose");

const schema = mongoose.Schema;
const serviceTypeSchema = schema({
    
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
    notice: {
        type: String
    },
}, { timestamps: true });

module.exports = mongoose.model("ServiceType", serviceTypeSchema);
