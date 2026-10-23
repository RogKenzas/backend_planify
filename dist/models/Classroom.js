"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const classroomSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        unique: true,
    },
    teacherId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Teacher",
        required: true,
    },
}, {
    timestamps: true,
});
const Classroom = mongoose.models.Classroom ||
    mongoose.model("Classroom", classroomSchema);
module.exports = Classroom;
//# sourceMappingURL=Classroom.js.map