const mongoose = require('mongoose');

const dateAndTimeSlotSchema = new mongoose.Schema({
    startTime: {
        type: String,
        required: true,
    },
    endTime: {
        type: String,
        required: true,
    },
    isAvailable: {
        type: Boolean,
        default: true,
    },
}, { timestamps: true });

const DateAndTimeSlot = mongoose.model('DateAndTimeSlot', dateAndTimeSlotSchema);

module.exports = DateAndTimeSlot;
