"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Teacher = require("../models/Teacher");
const Course = require("../models/Course");
const Classroom = require("../models/Classroom");
const ScheduleSlot = require("../models/ScheduleSlot");
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
const deleteAllTeachers = async (_req, res) => {
    try {
        /*
         * Les cours dépendent des professeurs.
         * Les créneaux dépendent des cours.
         * Les classes possèdent également un teacherId obligatoire.
         *
         * On nettoie donc les données dépendantes avant
         * de supprimer les professeurs.
         */
        const deletedScheduleSlots = await ScheduleSlot.deleteMany({});
        const deletedCourses = await Course.deleteMany({});
        const deletedClassrooms = await Classroom.deleteMany({});
        const deletedTeachers = await Teacher.deleteMany({});
        return res.status(200).json({
            message: "Tous les professeurs ont été supprimés avec succès",
            deletedTeachers: deletedTeachers.deletedCount,
            deletedCourses: deletedCourses.deletedCount,
            deletedClassrooms: deletedClassrooms.deletedCount,
            deletedScheduleSlots: deletedScheduleSlots.deletedCount,
        });
    }
    catch (error) {
        console.error("Erreur suppression des professeurs :", error);
        return res.status(500).json({
            message: "Impossible de supprimer tous les professeurs",
        });
    }
};
module.exports = { getTeachers, createTeacher, deleteAllTeachers };
//# sourceMappingURL=teacherControllers.js.map