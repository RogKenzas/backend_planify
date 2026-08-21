"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const Course = require("../models/Course");
const Teacher = require("../models/Teacher");
const serializeCourse = (course) => ({
    id: String(course._id),
    title: course.title,
    teacherId: String(course.teacherId),
    room: course.room,
    duration: course.duration,
    color: course.color,
});
const getCourses = async (_req, res) => {
    try {
        const courses = await Course.find().sort({ createdAt: -1 });
        res.json(courses.map(serializeCourse));
    }
    catch (error) {
        res.status(500).json({ message: "Impossible de charger les cours" });
    }
};
const createCourse = async (req, res) => {
    try {
        const title = String(req.body?.title ?? "").trim();
        const teacherId = String(req.body?.teacherId ?? "").trim();
        const room = String(req.body?.room ?? "").trim();
        const duration = String(req.body?.duration ?? "2h").trim();
        const color = String(req.body?.color ?? "blue").trim();
        if (!title || !teacherId || !room) {
            res.status(400).json({ message: "L'intitulé, la salle et le professeur sont requis" });
            return;
        }
        if (!mongoose.Types.ObjectId.isValid(teacherId)) {
            res.status(400).json({ message: "Professeur invalide" });
            return;
        }
        const teacher = await Teacher.findById(teacherId);
        if (!teacher) {
            res.status(400).json({ message: "Aucun professeur existant" });
            return;
        }
        const course = await Course.create({ title, teacherId, room, duration, color });
        res.status(201).json(serializeCourse(course));
    }
    catch (error) {
        res.status(500).json({ message: "Impossible d'enregistrer le cours" });
    }
};
const updateCourse = async (req, res) => {
    try {
        const id = String(req.params.id ?? "");
        const title = String(req.body?.title ?? "").trim();
        const teacherId = String(req.body?.teacherId ?? "").trim();
        const room = String(req.body?.room ?? "").trim();
        const duration = String(req.body?.duration ?? "2h").trim();
        const color = String(req.body?.color ?? "blue").trim();
        if (!title || !teacherId || !room) {
            res.status(400).json({ message: "L'intitulé, la salle et le professeur sont requis" });
            return;
        }
        if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(teacherId)) {
            res.status(400).json({ message: "Identifiant invalide" });
            return;
        }
        const teacher = await Teacher.findById(teacherId);
        if (!teacher) {
            res.status(400).json({ message: "Aucun professeur existant" });
            return;
        }
        const course = await Course.findByIdAndUpdate(id, { title, teacherId, room, duration, color }, { new: true });
        if (!course) {
            res.status(404).json({ message: "Aucun cours existant" });
            return;
        }
        res.json(serializeCourse(course));
    }
    catch (error) {
        res.status(500).json({ message: "Impossible de modifier le cours" });
    }
};
module.exports = { getCourses, createCourse, updateCourse };
//# sourceMappingURL=scheduleControllers.js.map