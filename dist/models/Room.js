"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const roomSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    building: {
        type: String,
        required: true,
        trim: true,
        uppercase: true,
        enum: ['A', 'G']
    },
    capacity: {
        type: Number,
        required: false,
        min: 1
    },
    type: {
        type: String,
        enum: [
            "classroom",
            "lab",
            "amphitheater"
        ],
        default: "classroom"
    }
}, {
    timestamps: true
});
module.exports = mongoose.model("Room", roomSchema);
//# sourceMappingURL=Room.js.map