"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const courseSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher", required: true },
    room: { type: String, required: true, trim: true },
    duration: { type: String, required: true, default: "2h" },
    color: {
        type: String,
        enum: ["blue", "green", "purple", "yellow"],
        default: "blue",
    },
}, { timestamps: true });
module.exports = mongoose.model("Course", courseSchema);
//# sourceMappingURL=Course.js.map