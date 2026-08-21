"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Teacher = require("../models/Teacher");
const initialsFromName = (name) => name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
const serializeTeacher = (teacher) => ({
    id: String(teacher._id),
    name: teacher.name,
    subject: teacher.subject,
    initials: initialsFromName(teacher.name),
});
const getTeachers = async (_req, res) => {
    try {
        const teachers = await Teacher.find().sort({ createdAt: -1 });
        res.json(teachers.map(serializeTeacher));
    }
    catch (error) {
        res.status(500).json({ message: "Impossible de charger les professeurs" });
    }
};
const createTeacher = async (req, res) => {
    try {
        const name = String(req.body?.name ?? "").trim();
        const subject = String(req.body?.subject ?? "").trim();
        if (!name || !subject) {
            res.status(400).json({ message: "Le nom et la matière sont requis" });
            return;
        }
        const teacher = await Teacher.create({ name, subject });
        res.status(201).json(serializeTeacher(teacher));
    }
    catch (error) {
        res.status(500).json({ message: "Impossible d'enregistrer le professeur" });
    }
};
module.exports = { getTeachers, createTeacher };
//# sourceMappingURL=teacherControllers.js.map