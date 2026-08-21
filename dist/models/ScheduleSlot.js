"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const scheduleSlotSchema = new mongoose.Schema({
    day: { type: String, required: true, trim: true },
    time: { type: String, required: true, trim: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
}, { timestamps: true });
scheduleSlotSchema.index({ day: 1, time: 1 }, { unique: true });
module.exports = mongoose.model("ScheduleSlot", scheduleSlotSchema);
//# sourceMappingURL=ScheduleSlot.js.map