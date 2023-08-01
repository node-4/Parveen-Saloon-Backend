const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const testimonialSchema = new Schema(
    {
        userName: {
            type: String,
        },
        userProffession: {
            type: String,
        },
        title: {
            type: String
        },
        description: {
            type: String
        },
        image: {
            type: String
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Testimonial", testimonialSchema);