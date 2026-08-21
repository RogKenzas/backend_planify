import express = require("express");
const { getTeachers, createTeacher } = require("../controllers/teacherControllers");

const router = express.Router();

router.get("/", getTeachers);
router.post("/", createTeacher);

module.exports = router;
