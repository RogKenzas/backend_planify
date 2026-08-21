"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const { getCourses, createCourse, updateCourse } = require("../controllers/scheduleControllers");
const router = express.Router();
router.get("/data", getCourses);
router.post("/post", createCourse);
router.put("/:id", updateCourse);
module.exports = router;
//# sourceMappingURL=schedule.js.map