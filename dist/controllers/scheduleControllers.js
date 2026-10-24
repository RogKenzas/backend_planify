"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const Course = require("../models/Course");
// const Teacher = require("../models/Teacher");
const Room = require("../models/Room");
const Classroom = require("../models/Classroom");
const ScheduleSlot = require("../models/ScheduleSlot");
/* =========================================================
   SERIALIZATION DES CRÉNEAUX
   ========================================================= */
const serializeScheduleSlot = (slot) => ({
    id: String(slot._id),
    classroomId: slot.classroomId?._id
        ? String(slot.classroomId._id)
        : String(slot.classroomId),
    courseId: slot.courseId?._id
        ? String(slot.courseId._id)
        : String(slot.courseId),
    roomId: slot.roomId
        ? slot.roomId._id
            ? String(slot.roomId._id)
            : String(slot.roomId)
        : null,
    day: slot.day,
    time: slot.time,
    course: slot.courseId?._id
        ? {
            id: String(slot.courseId._id),
            title: slot.courseId.title,
            teacherId: String(slot.courseId.teacherId),
            duration: slot.courseId.duration,
            color: slot.courseId.color,
        }
        : null,
    room: slot.roomId?._id
        ? {
            id: String(slot.roomId._id),
            name: slot.roomId.name,
            building: slot.roomId.building,
            capacity: slot.roomId.capacity,
            type: slot.roomId.type,
        }
        : null,
    createdAt: slot.createdAt,
    updatedAt: slot.updatedAt,
});
/* =========================================================
   EMPLOI DU TEMPS D'UNE SALLE
   ========================================================= */
/**
 * GET
 *
 * Charge tous les créneaux d'une salle.
 */
const getClassroomSchedule = async (req, res) => {
    try {
        const classroomId = String(req.params.classroomId ?? "");
        if (!mongoose.Types.ObjectId.isValid(classroomId)) {
            res.status(400).json({
                message: "Classe introuvable",
            });
            return;
        }
        const classroom = await Classroom.findById(classroomId);
        if (!classroom) {
            res.status(404).json({
                message: "Classe introuvable",
            });
            return;
        }
        const slots = await ScheduleSlot.find({
            classroomId,
        })
            .populate("courseId")
            .populate("roomId")
            .sort({
            day: 1,
            time: 1,
        });
        res.json(slots.map(serializeScheduleSlot));
    }
    catch (error) {
        console.error("Erreur getClassroomSchedule :", error);
        res.status(500).json({
            message: "Impossible de charger l'emploi du temps",
        });
    }
};
/**
 * PUT
 *
 * Crée un créneau s'il n'existe pas.
 *
 * S'il existe déjà pour cette salle + jour + heure,
 * le cours est remplacé.
 */
const upsertScheduleSlot = async (req, res) => {
    try {
        const classroomId = String(req.params.classroomId ?? "");
        const courseId = String(req.body?.courseId ?? "").trim();
        const roomId = String(req.body?.roomId ?? "").trim();
        const day = String(req.body?.day ?? "").trim();
        const time = String(req.body?.time ?? "").trim();
        if (!classroomId ||
            !courseId ||
            !roomId ||
            !day ||
            !time) {
            res.status(400).json({
                message: "La classe, le cours, la salle physique, le jour et l'heure sont requis",
            });
            return;
        }
        if (!mongoose.Types.ObjectId.isValid(classroomId) ||
            !mongoose.Types.ObjectId.isValid(courseId) ||
            !mongoose.Types.ObjectId.isValid(roomId)) {
            res.status(400).json({
                message: "Identifiant invalide",
            });
            return;
        }
        /*
         * Vérification de la salle.
         */
        const classroom = await Classroom.findById(classroomId);
        if (!classroom) {
            res.status(404).json({
                message: "Classe introuvable",
            });
            return;
        }
        /*
         * Vérification du cours.
         */
        const course = await Course.findById(courseId);
        if (!course) {
            res.status(404).json({
                message: "Cours introuvable",
            });
            return;
        }
        /*
     * Vérification de la salle physique.
     */
        const room = await Room.findById(roomId);
        if (!room) {
            res.status(404).json({
                message: "Salle physique introuvable",
            });
            return;
        }
        /*
         * Un créneau est identifié par :
         *
         * classroomId + day + time
         *
         * Si le créneau existe déjà, son cours
         * est remplacé.
         */
        const slot = await ScheduleSlot.findOneAndUpdate({
            classroomId,
            day,
            time,
        }, {
            $set: {
                courseId,
                roomId,
            },
        }, {
            new: true,
            upsert: true,
            runValidators: true,
            setDefaultsOnInsert: true,
        })
            .populate("courseId")
            .populate("roomId");
        res.json(serializeScheduleSlot(slot));
    }
    catch (error) {
        console.error("Erreur upsertScheduleSlot :", error);
        if (error?.code === 11000) {
            res.status(409).json({
                message: "Ce créneau est déjà occupé",
            });
            return;
        }
        res.status(500).json({
            message: "Impossible d'enregistrer le créneau",
        });
    }
};
/**
 * DELETE
 *
 * Supprime un créneau précis d'une salle.
 */
const deleteScheduleSlot = async (req, res) => {
    try {
        const classroomId = String(req.params.classroomId ?? "");
        const slotId = String(req.params.slotId ?? "");
        if (!mongoose.Types.ObjectId.isValid(classroomId) ||
            !mongoose.Types.ObjectId.isValid(slotId)) {
            res.status(400).json({
                message: "Identifiant invalide",
            });
            return;
        }
        /*
         * On utilise classroomId ET slotId.
         *
         * Cela évite de supprimer accidentellement
         * le créneau d'une autre salle.
         */
        const slot = await ScheduleSlot.findOneAndDelete({
            _id: slotId,
            classroomId,
        });
        if (!slot) {
            res.status(404).json({
                message: "Créneau introuvable",
            });
            return;
        }
        res.json({
            message: "Créneau supprimé avec succès",
            id: String(slot._id),
        });
    }
    catch (error) {
        console.error("Erreur deleteScheduleSlot :", error);
        res.status(500).json({
            message: "Impossible de supprimer le créneau",
        });
    }
};
module.exports = {
    /*
     * Planning
     */
    getClassroomSchedule, upsertScheduleSlot, deleteScheduleSlot
};
//# sourceMappingURL=scheduleControllers.js.map