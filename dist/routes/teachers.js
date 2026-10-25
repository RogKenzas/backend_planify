"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const { getTeachers, createTeacher, deleteAllTeachers } = require("../controllers/teacherControllers");
const router = express.Router();
router.get("/", getTeachers);
router.post("/", createTeacher);
/**
 * DELETE /api/teachers
 *
 * Supprime tous les professeurs ainsi que
 * les données dépendantes.
 */
router.delete("/", deleteAllTeachers);
module.exports = router;
//# sourceMappingURL=teachers.js.map