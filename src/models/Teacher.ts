import mongoose = require("mongoose");

const teacherSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    subject: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Teacher", teacherSchema);
